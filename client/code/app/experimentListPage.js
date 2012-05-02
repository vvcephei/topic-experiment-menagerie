var cache = new CacheProvider
  , utils = require('./utils.js')
  , log = {info:function(){console.log(arguments)}}
  , path = require('path')
  ;

/*
 * The basic experiment object
 * It 
 */
var Experiment = Backbone.Model.extend({});

var Result = Backbone.Model.extend({});

var TopicDistribution = Backbone.Model.extend({});

var Experiments = Backbone.Collection.extend({
  model: Experiment
});

var Results = Backbone.Collection.extend({
  model: Result
});

var ExperimentsPageView = Backbone.View.extend({
  el: $("#container")
, render: function(cb) {
    var that = this
      ;
    log.info('rendering ExperimentsPageView');
    that.$el.fadeOut('fast',function(){
      that.$el
        .empty()
        .append(ss.tmpl['experiment-experimentContainer'].render())
        .fadeIn('fast',function(){
          log.info('EPV: rendered content');
          log.info($('#experimentsList'));
          cb();
          log.info('EPV: called cb');
        })
        ;
    });
  }
});

var ExperimentsSideBarView = Backbone.View.extend({
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
    that.$el = that.el = $('#experimentsList');
    log.info('in ExperimentsSideBarView',that.$el);
    that.$el.fadeOut('fast', function(){
      var results
      ;
      for(i=0; i<experiments.length; i++) {
        htmlExp = ss.tmpl['experiment-listItem'].render({
          id: experiments[i].get('id')
        , name: experiments[i].get('name')
        , acc:  utils.getExperimentMaxAcc(experiments[i])
        });
        //htmlTrials = $("<ul class=\"nav nav-list\">");
        htmlTrials = $("<dl class=\"nav nav-list dl-horizontal\">");
        results = experiments[i].get('results');
        for(j=0; j<results.length; j++) {
          htmlTrial = ss.tmpl['experiment-listItemTrial'].render({
            eid: experiments[i].get('id')
          , id: results[j].id
          , acc: results[j].accuracy
          });
          htmlTrials = $(htmlTrials).append(htmlTrial);
        }
        htmlExp = $(htmlExp).append(htmlTrials);
        that.$el.append(htmlExp);
      }
      that.$el.fadeIn('fast');
    });
    return this;
  }
});

var ExperimentView = Backbone.View.extend({
  el: $("#main")
, render: function(cb){
    var that = this
      , experiment = that.model
      ;
    that.$el = that.el = $('#main');
    that.$el.fadeOut('fast',function(){
      var infoBox = ss.tmpl['experiment-infoBox'].render({
        id: experiment.get('id')
      , name: experiment.get('name')
      , description: experiment.get('description')
      , parameters: JSON.stringify(experiment.get('parameters'))
      });
      $('#experimentInfo').replaceWith(infoBox);
      $('#experimentBody').empty();
      that.$el.fadeIn('fast',cb);
    });
  }
});

var ResultListView = Backbone.View.extend({
  el: $("#experimentBody")
, render: function(){
    var that = this
      ;
    that.$el = that.el = $('#experimentBody');
    that.$el.fadeOut('fast',function(){
      that.$el.empty();
      var trialsContainer = ss.tmpl['experiment-experimentContainerTrials'].render();
      that.$el.append(trialsContainer);
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
        , eid: result.get('eid')
        , accuracy: result.get('accuracy')
        , model: result.get('model')
        , dataset: result.get('dataset')
        , parameters: JSON.stringify(result.get('parameters'))
        , classResults: classResults
        });
        that.$el.append(trialDetail);
      });
      that.$el.fadeIn('fast');
    });
  }
});

var TrialView = Backbone.View.extend({
  el: $("#main")
, render: function(){
    var that = this
      , trial = that.model
      ;
    that.$el = that.el = $('#main');
    that.$el.fadeOut('fast',function(){
      var infoBox = ss.tmpl['trial-infoBox'].render({
        id: trial.get('id')
      , eid: trial.get('eid')
      , dataset: trial.get('dataset')
      , model: trial.get('model')
      , parameters: JSON.stringify(trial.get('parameters'))
      , preproc: JSON.stringify(trial.get('preproc'))
      });
      $('#experimentInfo').replaceWith(infoBox);
      $('#experimentBody').empty();
      that.$el.fadeIn('fast');
    });
  }
});

var TrialTopicsView = Backbone.View.extend({
  el: $('#experimentBody')
, render: function(){
    var that = this;
    that.$el = that.el = $('#experimentBody');
    that.$el.fadeOut('fast',function(){
      var topicsContainer = ss.tmpl['trial-trialsBody'].render();
      var i=0
        , ttd = that.model.get('topicTermDist')
        , imgPath = ''
        , thumbimgPath = ''
      ;
      that.$el.empty();
      that.$el.append(topicsContainer);
      for(i=0; i<ttd.length; i++){
        thumbimgPath = ttd[i].wordleThumb;
        imgPath = path.join('dbcache',ttd[i].wordle);
        log.info(ttd[i],imgPath)
        that.$el.find('.thumbnails').append(
          ss.tmpl['trial-topicThumb'].render({
            wordleThumb:thumbimgPath
          , wordle:imgPath
          , id:i})
        );
        log.info(ttd[i],that.$el.find('.thumbnails'));
      }
      //looks like crap because there's so much to display here
      that.$el.fadeIn('slow');
    });
  }
});

module.exports.ExperimentRouter = function(StateManager){
  return Backbone.Router.extend({
    _experiments:null
  , _experiment:null
  , _experimentResultsList:null

  , routes: {
      "experiment": "experimentContainer"
    , "experiment/:id": "hashExperiment"
    , "experiment/:eid/trial/:tid": "hashTrial"
    }

  , initialize: function(options){
      var that = this
        ;
      if (that._experiments === null) {
        ss.rpc('list.experiments',function(res){
          var i
            ;
          log.info('got experiment data');
          that._experiments = new Experiments(res);
          that.trigger("dataLoaded");
        });
      }
    }

  , currentState: function(){return StateManager.currentState()}
  , changeState:  function(newstate){return StateManager.changeState(newstate)}

  , experimentContainer: function(cb){
      var that = this
        , populatePage = function(){
            log.info('set _state to experiments');
            that.changeState('experiments');
            var container = new ExperimentsPageView();
            container.render(function(){
              log.info($('#experimentsList'));
              var sideBar = new ExperimentsSideBarView({model:that._experiments});
              sideBar.render();
              if (typeof cb === 'function'){ cb(); }
            });
          }
        ;
      if(that.currentState() !== 'experiments'){
        log.info('entered ExperimentContainer');
        if (that._experiments === null) {
          log.info('eC: waiting for data');
          that.on("dataLoaded",function(){
            populatePage();
          });
        } else {
          populatePage();
        }
      }
    }
    /* The results list doesn't get traversed when the experiments are 
     * initially loaded, so we might need to create a model before 
     * accessing it.
     */
  , getResultsContainer: function(experimentModel){
      var that = this;
      if(! experimentModel.get('_results')){
        experimentModel.set('_results', new Results(experimentModel.get('results')));
      }
      var rm = experimentModel.get('_results');
      rm.each(function(item){item.set('eid',experimentModel.get('id'))});
      return rm;
    }
  
  , hashExperiment: function(id){
      var that = this
        , render = function(){
            var experimentModel = that._experiments.get(id)
              ;
            var experimentView = 
                ( cache.get( 'exp'+id)
               || cache.set( 'exp'+id
                           , new ExperimentView({model:experimentModel}))
                );
            experimentView.render(function(){
              var resultListView = 
                  ( cache.get( 'expRes'+id)
                 || cache.set( 'expRes'+id
                             , new ResultListView(
                               {model:that.getResultsContainer(experimentModel)}))
                  );
              resultListView.render();
            });
          }
        ;
      log.info('hE: state:',that.currentState());
      if(that.currentState() === 'experiments'){
        render();
      } else {
        that.experimentContainer(render);
      }
    }

  , hashTrial: function(eid,tid){
      var that = this
        , render = function(){
            var experimentModel = that._experiments.get(eid)
              , trialModel = that.getResultsContainer(experimentModel).get(tid)
              ;
            var trialView = new TrialView({model:trialModel})
              , topicDist = null
              ;
            trialView.render();
            if (topicDist = cache.get('trial-dist-'+eid+'-'+tid)) {
              trialModel.set('distributions',topicDist);
              var topicView = new TrialTopicsView({model:trialModel.get('distributions')});
              topicView.render();
            } else {
              ss.rpc('trial.distributions',eid,tid, function(robj){
                topicDist = new TopicDistribution(robj.res);
                cache.set('trial-dist-'+eid+'-'+tid,topicDist);
                trialModel.set('distributions',topicDist);
                var topicView = new TrialTopicsView({model:trialModel.get('distributions')});
                topicView.render();
              });
            }
          }
        ;
      if(that.currentState() === 'experiments'){
        render();
      } else {
        that.experimentContainer(render);
      }
    }
  });
};
