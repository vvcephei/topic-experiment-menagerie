var fs = require('fs')
  , path = require('path')
  , databasePath = ''
  , staticPath   = ''
  , log = require('winston')
  , util = require('./util')
  , exec = require('child_process').exec
  , wordle = require('./wordle')()
  ;

module.exports.config = function(project_root){
  databasePath = path.join(project_root,'database');
  staticPath   = path.join(project_root,'client','static','dbcache');
}

// UTIL ////////////////////////////////////////////////////////////////////////

function listDescriptions(subDir,cb){
  readDbFiles(subDir,'description.json',cb);
}

function readDbFiles(subDir,fileName,cb){
  var descriptions = [];
  fs.readdir(path.join(databasePath,subDir), function(err,files) {
    log.info('(err,files)',arguments);
    var readRecursive = function(index) {
      if (index >= files.length) {
        cb(null,descriptions);
      } else {
        readJSONFile(path.join(databasePath,subDir,files[index],fileName),
          function(err,obj){
            obj.id = files[index];
            descriptions.push(obj);
            readRecursive(index + 1);
          }
        );
      }
    }
    readRecursive(0);
  });
}

function readJSONFile(path,cb){
  fs.readFile(path,function(err,data) {
    var info = JSON.parse(data);
    cb(null,info);
  });
}

function readCSVFile(path,delimiter,cb){
  if (! cb && delimiter) {
    cb = delimiter;
    delimiter = ',';
  }
  fs.readFile(path,function(err,data) {
    var lines = data.toString().trim().split('\n')
      , r=0;
      ;
    for(r=0;r<lines.length;r++){
      lines[r] = lines[r].split(delimiter);
    }
    cb(err,lines);
  });
}

// DATASETS ////////////////////////////////////////////////////////////////////

module.exports.list_datasets = function(cb) {
  listDescriptions('datasets',cb);
}

module.exports.get_dataset = function(datasetName, cb) {
  var dataset_path = path.join(databasePath,'datasets',datasetName)
    ;
  path.exists(dataset_path, function(exists) {
    var ds = {}
      ;
    if (exists) {
      fs.readFile(path.join(dataset_path,'test.json'),function(err,res){
        ds.test = JSON.parse(res);
        fs.readFile(path.join(dataset_path,'train.json'),function(err,res){
          ds.train = JSON.parse(res);
          fs.readFile(path.join(dataset_path,'dev.json'),function(err,res){
            ds.dev = JSON.parse(res);
            cb(null,ds);
          });
        });
      });
    }
  });
}

// EXPERIMENTS /////////////////////////////////////////////////////////////////

module.exports.list_experiments = function(cb) {
  listDescriptions('experiments',cb);
}
        
module.exports.list_trials = function(experimentId,cb) {
  var trialsPath = path.join('experiments',''+experimentId,'trials');
  log.info('list_trials',arguments);
  listDescriptions(trialsPath,function(err,trialsList){
    readDbFiles(trialsPath,'results.json',function(err,resultsList){
      var combinedList = util.join(['id','id'],trialsList,resultsList);
      cb(null,combinedList);
    });
  });
}

function getLastIteration(experimentId,trialId,cb) {
  var trialsDir = path.join(databasePath,'experiments', ''+experimentId,'trials',''+trialId)
    ;
  fs.readdir(trialsDir,function(err,contents){
    var dirNames = []
      , statRecursive = function(index){
          var lsName = contents[index]
            ;
          if(index<contents.length){
            fs.stat(path.join(trialsDir,lsName),function(err,stats){
              if (stats.isDirectory()) {
                dirNames.push(lsName);
              }
              statRecursive(index+1);
            });
          } else {
            //return the largest numerical element (this should be the last iteration)
            cb(null,dirNames.sort(function(x,y){return y-x})[0]);
          }
        }
      ;
    statRecursive(0);
  });
}

/*
 * fire-and-forget wordle-making function.
 * cb is ignored.
 */
function makeWordles(experimentId,trialId,cb) {
  var trialsDir = path.join(databasePath,'experiments', ''+experimentId,'trials',''+trialId)
    ;
  getLastIteration(experimentId,trialId,function(err,itDirName){
    var itDir = path.join(trialsDir,itDirName)
      , topicTermDistFile = path.join(itDir,'topic-term-distributions.csv')
      , termFile = path.join(itDir,'term-index.txt')
      , topicTermDistDir = path.join(itDir,'topic-term-distributions')
      ;
    util.ensureUnzippedReadFile(topicTermDistFile,function(err,ttd){
      if (err) {
        log.error('caught an error',err);
      }
      fs.mkdir(topicTermDistDir,function(err){
        var ttds = ttd.toString().split('\n')
          , t=0
          , topicFileNoExtension
          , wordleMaker
          ;
        for(t=0;t<ttds.length;t++) {
          topicFileNoExtension = path.join(topicTermDistDir,''+t)
          wordleMaker = function(topicFileNoExtension){
            return function(pasteErr,pasteStdout,pasteStderr){
                wordle(topicFileNoExtension+'.txt',topicFileNoExtension+'.png',
                  function(wordleErr,wordleStderr,wordleStdout){
                    //currently,this is a fire-and-forget function
                    log.info('Wordle: '+topicFileNoExtension+' complete.\n'
                            +'- Code: '+wordleErr+'\n'
                            +'- StdE: '+wordleStderr+'\n'
                            +'- StdO: '+wordleStdout+'\n'
                      );
                  }
                );
              };
          };
          exec("head -n"+(t+1)+" "+topicTermDistFile+" | tail -n1 | "
                +"tr ',' '\\n' | paste "+termFile+" - > "+ topicFileNoExtension+'.txt'
              ,wordleMaker(topicFileNoExtension));
        }
      });
    });
  });
}

function mkdirP(dirname,cb){
  path.exists(dirname,function(exists){
    if (exists){
      // There are two base cases: '/' and '.' 
      // Both of these exist, so we are done.
      cb();
    } else {
      mkdirP(path.dirname(dirname),function(err){
        fs.mkdir(dirname,cb);
      });
    }
  });
}

function cacheStatic(dbFilePath,cb){
  var unrootedPath = path.relative(databasePath,dbFilePath)
    , staticFilePath   = path.join(staticPath,unrootedPath)
    ;
  mkdirP(path.dirname(staticFilePath),function(mkdirPErr){
    fs.symlink(dbFilePath,staticFilePath,function(symlinkErr){
      cb(symlinkErr,unrootedPath);
    })
  });
}

function listTTDs(topicTermDistDir,cb){
  fs.readdir(topicTermDistDir,function(err,children){
    var resultTTDs = []
      ;
    var populateResultRecursively = function(i){
      var childExt
        , childName
        ;
      if (i < children.length) {
        childName = children[i].split('.')[0];
        childExt  = children[i].split('.')[1];
        if (!resultTTDs[childName]){
          resultTTDs[childName] = {};
        }
        switch(childExt){
          case 'txt':
            readCSVFile(path.join(topicTermDistDir,children[i])
                       ,'\t'
                       ,function(err,table){
              resultTTDs[childName].distribution = table;
              populateResultRecursively(i+1);
            });
            break;
          case 'png':
            cacheStatic(path.join(topicTermDistDir,children[i])
                       ,function(err,cachedLink){
              resultTTDs[childName].wordle = cachedLink;
              populateResultRecursively(i+1);
            });
            break;
          default:
            // just ignore irrelevant files
            populateResultRecursively(i+1);
            break;
        }
      } else {
        cb(null,resultTTDs);
      }
    };
    populateResultRecursively(0);
  });
}

module.exports.get_distributions = function(experimentId,trialId,cb) {
  getLastIteration(experimentId,trialId,function(err,itDirName){
    var trialsDir = path.join(databasePath,'experiments', ''+experimentId,'trials',''+trialId)
      , itDir = path.join(trialsDir,itDirName)
      , topicTermDistDir = path.join(itDir,'topic-term-distributions')
      ;
    path.exists(topicTermDistDir,function(ttdExists){
      if(!ttdExists){
        makeWordles(experimentId,trialId);
        cb( { err:'ENOENT'
            , message:'Wordles scheduled for creation. '+
              'Run this command again to complete operation.'
            }
          , null);
      } else {
        readJSONFile(path.join(trialsDir,'description.json'),function(err,descObj){
          var docTopicDistFile = path.join(trialsDir
              ,descObj.dataset+'-document-topic-distributuions.csv')
            ;
          readCSVFile(docTopicDistFile,function(dtderr,docTopicDist){
            listTTDs(topicTermDistDir,function(ttderr,topicTermDist){
              cb( null
                , { docTopicDict:  docTopicDist
                  , topicTermDist: topicTermDist
                  }
                );
            });
          });
        });
      }
    });
  });
}
