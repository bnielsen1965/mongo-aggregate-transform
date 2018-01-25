# mongo-aggregate-transform

Special transforms to handle type casting in mongo aggregate pipes.

The transform module is utilized on the server where aggregate pipe requests
can be processed through a tranform promise prior to executing the aggregate
method.

## Use case

When passing aggregate pipe requests over an API, i.e. a REST interface, the type
of some values may be lost. Date objects and ObjectID objects may become strings
during the request transmission process.

Pipes that are passed to aggregate method with string values in place of objects
will not be cast into the object types and the results may not be as expected.

By specifying special operators on values in a pipe and running the passed pipes
through the transform process the object instances can be restored to the proper
types for the aggregate request.


# Transform Operators

The value in a pipe where a transform is needed should be replaced with an object
representation containing the transform operator and value to be transformed.
I.E. An example of an aggregate $match pipe passed through a rest API where a
timestamp string needs to be transformed may look like the following...

```javascript
[
  {
    $match: {
      Created: { $stringToDate: "2010-01-22T18:34:52.352Z" }
    }
  }
]
```

On the server where the request is received the pipe would need to run through
the transform process before executing the aggregate method. The results of the
transform process on the previous example would produce the following result...

```javascript
[
  {
    $match: {
      Created: new Date("2010-01-22T18:34:52.352Z")
    }
  }
]
```

## $stringToDate

When passing a date or timestamp string that needs to be converted to a Date
object on the server for an aggregate process the $stringToDate operator should
be used.


## $strinngToObjectId

Object IDs are commonly passed as a hex string. By using the $stringToObjectId
operator a string value can be passed to the server and then transformed into
a mongo ObjectID instance.


# Implementation

Transforms should be processed on the server where the request is received prior
to passing an aggregate pipe to the mongo aggregate method.

```javascript

const transform = require('mongo-aggregate-transform');

// method to run aggregate pipes on the provided mongoose model for a mongodb collection
function runAggregate(model, pipes) {
  // transform the pipes
  transform(pipes);
  .then(transformedPipes => {
    // use the transformed pipes in an aggregate request
    model.aggregate(pipes).exec((error, result) => {
      if (error) {
        throw error;
      }

      console.log('Results: ', result);
    });
  })
  .catch(err => {
    console.log('Error: ', err.stack);
  });
}
```
