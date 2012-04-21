var wordle = require('./wordle')()
  ;

wordle('/home/john/repos/updown/src/main/scala/updown/app/experiment/topic/lda/NFoldTopicExperiment.txt','tmp.png',function(err,data){console.log(arguments)});
