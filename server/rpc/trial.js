var db = require('../../database.js')
  , log = require('winston')
  , path= require('path')
  ;
db.config(path.resolve(__dirname+'../../../'));//FIXME
exports.actions = function(req, res, ss){

  // return list of actions which can be called publicly
  return {

    distributions: function(experimentId, trialId){
      db.get_distributions(experimentId,trialId,function(err,dists){
        if (err){
          log.error('caught: ',err);
          res({err:err,res:null});
        } else {
          log.info('distributions:');
          res({err:null,res:dists});//TODO give all rpcs this res api
        }
      });
    }
  
  }
}
