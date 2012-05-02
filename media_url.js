var exec = require('child_process').exec
  , log = require('winston')
  ;

module.exports = function(file_name,cb){
  var base64cmd = 'base64 ' + file_name;
  exec(base64cmd, function(code,stdOut,stdErr){
    //log.info('media_url_module',JSON.stringify(arguments));
    if (code !== null && code !== 0){
      cb({code:code
         ,stdErr:stdErr
         ,stdOut:stdOut}
        ,null);
    } else {
      cb(null,'data:image/jpg;base64,'+stdOut);
    }
  });
}
