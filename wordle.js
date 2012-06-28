var spawn = require('child_process').spawn
module.exports = function(config) {
  var wordleJar  = (config && config.jar)   || '/opt/wordcloud/ibm-word-cloud.jar'
    , configFile = (config && config.config)|| 'wordle.conf'
    , width      = (config && config.width) || 800
    , height     = (config && config.height)|| 600
    ;
  return function(infile,outfile,callback) {
    var wordle = spawn('java',['-jar',wordleJar
                              ,'-c',configFile
                              ,'-w',width
                              ,'-h',height
                              ,'-i',infile
                              ,'-o',outfile
                              ])
      , stdout = ''
      , stderr = ''
      ;

    wordle.on('exit',function(code){
      if(callback){
        if (code === 0) {
          callback(null,stdout,stderr);
        } else {
          callback(code,stdout,stderr);
        }
      }
    });

    wordle.stdout.on('data',function(data) {
      stdout+= data;
    });
    wordle.stderr.on('data',function(data) {
      stderr+= data;
    });
  }
}
