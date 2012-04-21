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
  if (what === 'datasets') {
    db.list_datasets(function(err,sets){
      app.log.info(sets);
    });
  } else if (what === 'experiments') {
    db.list_experiments(function(err,experiments){
      app.log.info(JSON.stringify(experiments));
    });
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
