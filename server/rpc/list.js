var db = require('../../database.js')
  , log = require('winston')
  , path= require('path')
  ;
db.config(path.resolve(__dirname+'../../../'));//FIXME
exports.actions = function(req, res, ss){

  // return list of actions which can be called publicly
  return {

    datasets: function(){
      db.list_datasets(function(err,sets){
        log.info('datasets:',sets);
        res(sets);
      });
    }
  
  , experiments: function(){
      db.list_experiments(function(err,experiments){
        log.info('experiments:',experiments);
        res(experiments);
      });
    }

  }
}
