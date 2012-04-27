//var cache = new CacheProvider
var utils = require('./utils.js')
  ;

/*
 * The basic experiment object
 * It 
 */
var Experiment = Backbone.Model.extend({});

var Result = Backbone.Model.extend({});

var Experiments = Backbone.Collection.extend({
  model: Experiment
});

var Results = Backbone.Collection.extend({
  model: Result
});

var Book = Backbone.Model.extend({});
var Library = Backbone.Collection.extend({
    model: Book
});

var IndexView = Backbone.View.extend({
  el: $("#experimentsList")
, render: function() {
    var that = this
      , experiments = that.model.toArray()
      ;
    var i=0
      , j=0
      , htmlExp
      , htmlTrials
      , htmlTrial
      ;
    that.$el.fadeOut('fast', function(){
      var results
      ;
      for(i=0; i<experiments.length; i++) {
        htmlExp = ss.tmpl['experiment-listItem'].render({
          name: experiments[i].get('name')
        , acc:  utils.getExperimentMaxAcc(experiments[i])
        });
        htmlTrials = $("<ul class=\"nav nav-list\">");
        results = experiments[i].get('results');
        for(j=0; j<results.length; j++) {
          htmlTrial = ss.tmpl['experiment-listItemTrial'].render({
            id: results[j].id
          , acc: results[j].accuracy
          });
          htmlTrials = $(htmlTrials).append(htmlTrial);
        }
        htmlExp = $(htmlExp).append(htmlTrials);
        that.$el.append(htmlExp);
        //$(htmlExp).appendTo(that.el);
      }
      that.$el.fadeIn('fast');
    });
    return this;
  }
});

var ExperimentView = Backbone.View.extend({
  el: $("#main")
, render: function(){
    var that = this
      ;
    that.$el.fadeOut('fast',function(){
      var infoBox = ss.tmpl['experiment-infoBox'].render({
        id: experiment.id
      , name: experiment.name
      , description: experiment.description
      , parameters: JSON.stringify(experiment.parameters)
      });
      $('#experimentInfo').replaceWith(infoBox);

      var trialsList = $('#trialsList');
      for(i=0;i<experiment.results.length; i++){
        var classResults = '';
        for(j=0;j<experiment.results[i].classes.length; j++){
          classResults += ss.tmpl['experiment-trialsListItemClass'].render(
            experiment.results[i].classes[j]
          );
        }
        var trialDetail = ss.tmpl['experiment-trialsListItem'].render({
          id: experiment.results[i].id
        , accuracy: experiment.results[i].accuracy
        , model: experiment.results[i].model
        , dataset: experiment.results[i].dataset
        , parameters: JSON.stringify(experiment.results[i].parameters)
        , classResults: classResults
        });
        trialsList.append(trialDetail);
      }
      that.$el.fadeIn('fast');
    });
  }
});

var App = Backbone.Router.extend({
  _index:null
, _data:null
, _experiments:null
, _experiment:null

, routes: {
    "": "index"
  , "experiment/:id": "hashExperiment"
  }

, initialize: function(options){
    var that = this
      ;
    return this;
  }

, index: function(){
    var that = this
      ;
    if (that._index === null) {
      ss.rpc('list.experiments',function(res){
        var i
          ;
        that._data = res;
        var test = new Library();
        var test2= new Experiments();
        that._experiments = new Experiments(res);
          //{id:0}
        //, {id:1}
        //]);
        that._index = new IndexView({model:that._experiments});
        //Backbone.history.loadUrl();
        that._index.render();
      });
    }
  }

});

module.exports = function() {
  app = new App();
  Backbone.history.start();
};
