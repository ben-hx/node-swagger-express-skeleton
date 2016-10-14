'use strict';

exports.add = function(args, res, next) {
  /**
   * parameters expected in the args:
  * body (Post)
  **/
  // no response value expected for this operation
  res.end();
}

exports.findByRelease = function(args, res, next) {
  /**
   * parameters expected in the args:
  * release (List)
  **/
    var examples = {};
  examples['application/json'] = [ {
  "photoUrls" : [ "aeiou" ],
  "name" : "doggie",
  "id" : 123456789,
  "category" : {
    "name" : "aeiou",
    "id" : 123456789
  },
  "tags" : [ {
    "name" : "aeiou",
    "id" : 123456789
  } ],
  "status" : "2000-01-23T04:56:07.000+00:00"
} ];
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

exports.findByTags = function(args, res, next) {
  /**
   * parameters expected in the args:
  * tags (List)
  **/
    var examples = {};
  examples['application/json'] = [ {
  "photoUrls" : [ "aeiou" ],
  "name" : "doggie",
  "id" : 123456789,
  "category" : {
    "name" : "aeiou",
    "id" : 123456789
  },
  "tags" : [ {
    "name" : "aeiou",
    "id" : 123456789
  } ],
  "status" : "2000-01-23T04:56:07.000+00:00"
} ];
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

exports.getByID = function(args, res, next) {
  /**
   * parameters expected in the args:
  * postID (Long)
  **/
    var examples = {};
  examples['application/json'] = {
  "photoUrls" : [ "aeiou" ],
  "name" : "doggie",
  "id" : 123456789,
  "category" : {
    "name" : "aeiou",
    "id" : 123456789
  },
  "tags" : [ {
    "name" : "aeiou",
    "id" : 123456789
  } ],
  "status" : "2000-01-23T04:56:07.000+00:00"
};
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

exports.remove = function(args, res, next) {
  /**
   * parameters expected in the args:
  * postID (Long)
  * api_key (String)
  **/
  // no response value expected for this operation
  res.end();
}

exports.update = function(args, res, next) {
  /**
   * parameters expected in the args:
  * body (Post)
  **/
  // no response value expected for this operation
  res.end();
}

exports.updateWithForm = function(args, res, next) {
  /**
   * parameters expected in the args:
  * postID (Long)
  * name (String)
  * status (String)
  **/
  // no response value expected for this operation
  res.end();
}

exports.uploadFile = function(args, res, next) {
  /**
   * parameters expected in the args:
  * postID (Long)
  * additionalMetadata (String)
  * file (file)
  **/
    var examples = {};
  examples['application/json'] = {
  "code" : 123,
  "type" : "aeiou",
  "message" : "aeiou"
};
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

