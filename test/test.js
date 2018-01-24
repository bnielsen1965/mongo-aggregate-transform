const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;

const transform = require('../lib');

describe('mongo-aggregate-transform', () => {
  describe('Date fields', () => {
    let d1 = new Date('2010-01-01T01:02:33.123Z');
    let d2 = new Date('2010-02-22T12:22:33.321Z');
    let b1 = {
      $match: { Created: { $stringToDate: d1.toISOString() }, Destroyed: { $stringToDate: d2.toISOString() } }
    };
    let e1 = {
      $match: { Created: d1, Destroyed: d2 }
    };

    it('should convert date field strings to date objects', () => {
      return transform(b1)
        .then(r => {
          assert.deepEqual(r, e1);
        })
        .catch(err => { console.log(err.stack); throw err; });
    });

    let b2 = {
      $match: { Dates: [{ $stringToDate: d1.toISOString() }, { $stringToDate: d2.toISOString() }] }
    };
    let e2 = {
      $match: { Dates: [d1, d2] }
    };

    it('should convert array of date strings to date objects', () => {
      return transform(b2)
        .then(r => {
          assert.deepEqual(r, e2);
        })
        .catch(err => { console.log(err.stack); throw err; });
    });
  });

  describe('ObjectId fields', () => {
    let d1 = ObjectID.createFromTime(10);
    let d2 = ObjectID.createFromTime(100000000);
    let b1 = {
      $match: { Created: { $stringToObjectId: d1.toHexString() }, Destroyed: { $stringToObjectId: d2.toHexString() } }
    };
    let e1 = {
      $match: { Created: d1, Destroyed: d2 }
    };

    it('should convert ObjectId field strings to ObjectId objects', () => {
      return transform(b1)
        .then(r => {
          assert.deepEqual(r, e1);
        })
        .catch(err => { console.log(err.stack); throw err; });
    });

    let b2 = {
      $match: { IDs: [{ $stringToObjectId: d1.toHexString() }, { $stringToObjectId: d2.toHexString() }] }
    };
    let e2 = {
      $match: { IDs: [d1, d2] }
    };

    it('should convert array of date strings to date objects', () => {
      return transform(b2)
        .then(r => {
          assert.deepEqual(r, e2);
        })
        .catch(err => { console.log(err.stack); throw err; });
    });
  });
});
