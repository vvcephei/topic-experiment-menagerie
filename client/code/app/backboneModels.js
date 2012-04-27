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

      that.$el.fadeIn('fast');
    });
  }
});

var ResultListView = Backbone.View.extend({
  el: $("#trialsList")
, render: function(){
    var that = this
    that.model.each(function(result){
      var classResults = ''
        , classes = result.get('classes')
        ;
      for(j=0;j<classes.length; j++){
        classResults += ss.tmpl['experiment-trialsListItemClass'].render(
          classes[j]
        );
      }
      var trialDetail = ss.tmpl['experiment-trialsListItem'].render({
        id: result.get('id')
      , accuracy: result.get('accuracy')
      , model: result.get('model')
      , dataset: result.get('dataset')
      , parameters: JSON.stringify(result.get('parameters'))
      , classResults: classResults
      });
      that.$el.append(trialDetail);
    });
  }
})

var App = Backbone.Router.extend({
  _index:null
, _data:null
, _experiments:null
, _experiment:null
, _experimentResultsList:null

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
    var render = function(){
      var experimentModel = that._experiments.get(id)
        ;
      that._experimentView = cache.get('exp'+id) || cache.set('exp'+id, new ExperimentView({model:experimentModel}));
      that._experimentView.render();
      if(! experimentModel.get('_results')){
        experimentModel.set('_results', new Results(that._experiments.get(id).get('results')));
      }
      that._resultListView = cache.get('expRes'+id) || cache.set('expRes'+id, new ResultListView({model:experimentModel.get('_results')}));
      that._resultListView.render();
      that.index();
    };
    if(that._experiments){
      render();
    } else {
      that.on("dataLoaded",function(){
        render();
      });
    }
  }
});

module.exports = function() {
  app = new App();
  Backbone.history.start();
};
