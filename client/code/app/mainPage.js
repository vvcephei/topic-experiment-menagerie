var experiments = {}
  ;

function getExperimentMaxAcc(experiment) {
  var i=0
    , max = -Infinity
    ;
  for (i=0; i<experiment.results.length; i++) {
    max = Math.max(max,experiment.results[i].accuracy);
  }
  return max;
}

function refresh_experiments(experiments) {
  var i=0
    , j=0
    , htmlExp
    , htmlTrials
    , htmlTrial
    ;
  for(i=0; i<experiments.length; i++) {
    htmlExp = ss.tmpl['experiment-listItem'].render({
      name: experiments[i].name
    , acc:  getExperimentMaxAcc(experiments[i])
    });
    htmlTrials = $("<ul class=\"nav nav-list\">");
    for(j=0; j<experiments[i].results.length; j++) {
      htmlTrial = ss.tmpl['experiment-listItemTrial'].render({
        id: experiments[i].results[j].id
      , acc: experiments[i].results[j].accuracy
      });
      htmlTrials = $(htmlTrials).append(htmlTrial);
    }
    htmlExp = $(htmlExp).append(htmlTrials);
    $(htmlExp).appendTo("#experimentsList");
  }
}

function experimentDetail(experiment) {
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
}

ss.rpc('list.experiments',function(res){
  experiments = res
  refresh_experiments(res);
experimentDetail(res[0]);
});
