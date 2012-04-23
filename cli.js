// example.js

var flatiron = require('flatiron')
  , app = flatiron.app
  , db = require('./database')
  ;
db.config(__dirname);

app.use(flatiron.plugins.cli, {
  dir: __dirname,
  usage: [
  ]
});


app.commands.hi = function (name) {
  app.log.info('hello '+name);
}

app.commands.list = function(what) {
  switch(what){
    case 'datasets':
      db.list_datasets(function(err,sets){
        app.log.info('datasets:',sets);
      });
      break;
    case 'experiments':
      db.list_experiments(function(err,experiments){
        app.log.info('experiments:',experiments);
      });
      break;
    case 'trials':
      db.list_trials(arguments[1],function(err,trials){
        app.log.info('trials:',trials);
        console.log(trials);
      });
      break;
    case 'distributions':
      db.get_distributions(arguments[1],arguments[2],function(err,dists){
        if (err){
          app.log.error('caught: ',err);
        } else {
          app.log.info('distributions:');
          console.log(dists);
        }
      });
      break;
    default:
      app.log.error('unknown command');
      break;
  }
}

app.commands.data = function(which) {
  db.get_dataset(which,function(err,res){
    app.log.info(res.test.length)
    app.log.info(res.train.length)
    app.log.info(res.dev.length)
  });
}

app.start();
