var fs = require('fs')
  , path = require('path')
  , databasePath = ''
  ;

module.exports.config = function(project_root){
  databasePath = path.join(project_root,'database');
}

// DATASETS ////////////////////////////////////////////////////////////////////
module.exports.list_datasets = function(cb) {
  fs.readdir(path.join(databasePath,'datasets'),function(err,files) {
    cb(err,files);
  });
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
  var experiments = []
    ;
  fs.readdir(path.join(databasePath,'experiments'), function(err,files) {
    var readRecursive = function(index) {
      if (index >= files.length) {
        cb(null,experiments);
      } else {
        fs.readFile(path.join(databasePath,'experiments',files[index],'description.json'),function(err,data) {
          var info = JSON.parse(data);
          experiments.push({ id: files[index], name:info.name});
          readRecursive(index + 1);
        });
      }
    }
    readRecursive(0);
  });
}
        
