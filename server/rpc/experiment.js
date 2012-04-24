var db = require('../../database.js')
  , log = require('winston')
  , path= require('path')
  ;
db.config(path.resolve(__dirname+'../../../'));//FIXME
exports.actions = function(req, res, ss){

  // return list of actions which can be called publicly
  return {

    trials: function(experimentId){
      db.list_trials(experimentId,function(err,trials){
        log.info('trials:',trials);
        res(trials);
      });
    }
  
  }
}
