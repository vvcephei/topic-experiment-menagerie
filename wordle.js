var spawn = require('child_process').spawn
module.exports = function(config) {
  var wordleJar  = (config && config.jar)   || '/opt/wordcloud/ibm-word-cloud.jar'
    , configFile = (config && config.config)|| '/opt/wordcloud/myconf.txt'
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
          callback(null,stderr + stdout);
        } else {
          callback(''+code+": "+stderr,stdout);
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
