var cache = new CacheProvider
  , utils = require('./utils.js')
  , log = {info:function(){console.log(arguments)}}
  ;

var App = Backbone.Router.extend({
  _state:null

, routes: {
    "clear": "clear"
  }

, currentState: function(){
    var that = this;
    return that._state;
  }
, changeState: function(newstate){
    var that = this;
    log.info('changing state to',newstate);
    switch(newstate){
      case 'experiments':
        $('.nav li').removeClass('active')
        $('#navExp').addClass('active')
        that._state = newstate;
        break;
      case 'clear':
        $('.nav li').removeClass('active')
        $('#navClear').addClass('active')
        that._state = null;
        break;
      default:
        break;
    }
  }

, clear: function(){
    var that = this;
    that.changeState('clear');
    $('#container').empty();
  }

});

module.exports = function() {
  app = new App();
  ExpRouter = require('./experimentListPage').ExperimentRouter(app);
  erout = new ExpRouter();
  Backbone.history.start();
};
