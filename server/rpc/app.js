// server/rpc/app.js
exports.actions = function(req, res, ss){

  // return list of actions which can be called publicly
  return {

    square: function(number){
      res(number * number);
    }

  }
}
