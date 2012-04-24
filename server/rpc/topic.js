//FIXME: Probably don't need this file at all, since trial.distributions
//already returns this information.
var db = require('../../database.js')
  , log = require('winston')
  , path= require('path')
  ;
db.config(path.resolve(__dirname+'../../../'));//FIXME
exports.actions = function(req, res, ss){

  // return list of actions which can be called publicly
  return {

    distribution: function(experimentId, trialId,topicNo){
      db.get_distributions(experimentId, trialId,function(err,dists){
        if (err){
          log.error('caught: ',err);
          res({err:err,res:null});
        } else {
          log.info('distributions:');
          res({err:null,res:dists.topicTermDist[topicNo]});
        }
      });
    }
  
  }
}
