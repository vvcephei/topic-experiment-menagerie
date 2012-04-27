var cache = new CacheProvider
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
          id: experiments[i].get('id')
        , name: experiments[i].get('name')
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
      , experiment = that.model
      ;
    that.$el.fadeOut('fast',function(){
      var infoBox = ss.tmpl['experiment-infoBox'].render({
        id: experiment.get('id')
      , name: experiment.get('name')
      , description: experiment.get('description')
      , parameters: JSON.stringify(experiment.get('parameters'))
      });
      $('#experimentInfo').replaceWith(infoBox);

      var trialsList = $('#trialsList')
        , results = experiment.get('results');
      for(i=0;i<results.length; i++){
        var classResults = '';
        for(j=0;j<results[i].classes.length; j++){
          classResults += ss.tmpl['experiment-trialsListItemClass'].render(
            results[i].classes[j]
          );
        }
        var trialDetail = ss.tmpl['experiment-trialsListItem'].render({
          id: results[i].id
        , accuracy: results[i].accuracy
        , model: results[i].model
        , dataset: results[i].dataset
        , parameters: JSON.stringify(results[i].parameters)
        , classResults: classResults
        });
        trialsList.append(trialDetail);
      }
      that.$el.fadeIn('fast');
    });
  }
});

var ResultListView = Backbone.View.extend({
  
})

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
    if (that._index === null) {
      ss.rpc('list.experiments',function(res){
        var i
          ;
        that._data = res;
        that._experiments = new Experiments(res);
        that.trigger("dataLoaded");
      });
    }
  }

, index: function(){
    var that = this
      ;
    if(! that._index){
      if(that._experiments){
        that._index = new IndexView({model:that._experiments});
        Backbone.history.loadUrl();
        that._index.render();
      } else {
        that.on("dataLoaded",function(){
          that._index = new IndexView({model:that._experiments});
          Backbone.history.loadUrl();
          that._index.render();
        });
      }
    }
  }

, hashExperiment: function(id){
    var that = this
      ;
    if(that._experiments){
      that._experiment = new ExperimentView({model:that._experiments.get(id)});
      that._experiment.render();
      that.index();
    } else {
      that.on("dataLoaded",function(){
        that._experiment = new ExperimentView({model:that._experiments.get(id)});
        that._experiment.render();
      });
      that.index();
    }
  }
});

module.exports = function() {
  app = new App();
  Backbone.history.start();
};
