var experiments = {}
  ;

function refresh_experiments(experiments) {
  var html = ss.tmpl['experiment-listItem'].render({
    name: 'banana'
  });
  console.log(html);
}
window.r = refresh_experiments;
console.log('reached');

ss.rpc('list.experiments',function(res){
  experiments = res
  refresh_experiments(res);
console.log('reached');
});
