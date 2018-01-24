
const ObjectID = require('mongodb').ObjectID;

function transformAggregatePipe (pipe) {
  if (Array.isArray(pipe)) {
    return Promise.all(pipe.map(p => { return transform(p); }));
  } else {
    return transform(pipe);
  }
}

function transform (o) {
  return new Promise((resolve, reject) => {
    if (typeof o === 'object') {
      if (o.hasOwnProperty('$stringToDate') && typeof o['$stringToDate'] === 'string') {
        // this object's value is a conversion target
        var oDate = new Date(o['$stringToDate']);
        if (!isNaN(oDate)) {
          o = oDate;
          resolve(o);
        } else {
          reject(new Error('Invalid date string format: ' + o['$stringToDate']));
        }
      } else if (o.hasOwnProperty('$stringToObjectId') && typeof o['$stringToObjectId'] === 'string') {
        // this object's value is a conversion target
        if (ObjectID.isValid(o['$stringToObjectId'])) {
          var oObjectID = new ObjectID(o['$stringToObjectId']);
          o = oObjectID;
          resolve(o);
        } else {
          reject(new Error('Invalid ObjectID string format: ' + o['$stringToObjectId']));
        }
      } else {
        let properties = Object.keys(o).filter(p => { return o.hasOwnProperty(p); });
        let transformProperties = i => {
          if (i >= properties.length) {
            resolve(o);
          } else {
            transform(o[properties[i]])
              .then(newO => {
                o[properties[i]] = newO;
                transformProperties(i + 1);
              })
              .catch(err => { reject(err); });
          }
        };
        transformProperties(0);
      }
    } else {
      resolve(o);
    }
  });
}

module.exports = transformAggregatePipe;
