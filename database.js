var fs = require('fs')
  , path = require('path')
  , databasePath = ''
  , log = require('winston')
  , util = require('./util')
  ;

module.exports.config = function(project_root){
  databasePath = path.join(project_root,'database');
}

// UTIL ////////////////////////////////////////////////////////////////////////

function listDescriptions(subDir,cb){
  readDbFile(subDir,'description.json',cb);
}

function readDbFile(subDir,fileName,cb){
  var descriptions = [];
  fs.readdir(path.join(databasePath,subDir), function(err,files) {
    var readRecursive = function(index) {
      if (index >= files.length) {
        cb(null,descriptions);
      } else {
        fs.readFile(path.join(databasePath,subDir,files[index],fileName),function(err,data) {
          var info = JSON.parse(data);
          info.id = files[index];
          descriptions.push(info);
          readRecursive(index + 1);
        });
      }
    }
    readRecursive(0);
  });
}

// DATASETS ////////////////////////////////////////////////////////////////////

module.exports.list_datasets = function(cb) {
  listDescriptions('datasets',cb);
}

module.exports.get_dataset = function(datasetName, cb) {
  var dataset_path = path.join(databasePath,'datasets',datasetName)
    ;
  path.exists(dataset_path, function(exists) {
    var ds = {}
      ;
    if (exists) {
      fs.readFile(path.join(dataset_path,'test.json'),function(err,res){
        ds.test = JSON.parse(res);
        fs.readFile(path.join(dataset_path,'train.json'),function(err,res){
          ds.train = JSON.parse(res);
          fs.readFile(path.join(dataset_path,'dev.json'),function(err,res){
            ds.dev = JSON.parse(res);
            cb(null,ds);
          });
        });
      });
    }
  });
}

// EXPERIMENTS /////////////////////////////////////////////////////////////////

module.exports.list_experiments = function(cb) {
  listDescriptions('experiments',cb);
}
        
module.exports.list_trials = function(experimentId,cb) {
  var trialsPath = path.join('experiments',''+experimentId,'trials');
  log.info('list_trials',arguments);
  listDescriptions(trialsPath,function(err,trialsList){
    readDbFile(trialsPath,'results.json',function(err,resultsList){
      var combinedList = util.join(['id','id'],trialsList,resultsList);
      cb(null,combinedList);
    });
  });
}


