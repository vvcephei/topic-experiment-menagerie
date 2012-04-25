var experiments = {}
  ;

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
    });
    htmlTrials = $("<ul class=\"nav nav-list\">");
    for(j=0; j<experiments[i].results.length; j++) {
      htmlTrial = ss.tmpl['experiment-listItemTrial'].render({
        id: experiments[i].results[j].id
      });
      htmlTrials = $(htmlTrials).append(htmlTrial);
    }
    htmlExp = $(htmlExp).append(htmlTrials);
    $(htmlExp).appendTo("#experimentsList");
  }
}
window.r = refresh_experiments;

ss.rpc('list.experiments',function(res){
  experiments = res
  refresh_experiments(res);
});
