var db = require("./database")
  , log = require('winston')
  , child=require('child_process')
  , path = require('path')
  ;

function verifyInput(id,cb){
    db.list_experiments(function(err,experiments){
        log.info(JSON.stringify(experiments));
        var experimentObj = undefined;
        for(var i=0; i<experiments.length; i++){
            if (experiments[i].id === id){
                experimentObj = experiments[i];
            }
        }
        if (experimentObj){
            log.info("experiment", experimentObj);
            var rundir = db.get_experiment_path(experimentObj.id);
            cb(rundir, experimentObj);
        } else {
            log.error("invalid key: ", id);
        }
    });
}

function getCPDeps(deps){
    var helper = function(deps){
        if (deps.length == 0) {
            return undefined;
        } else if (deps.length == 1) {
            return deps[0];
        } else if (deps.length >= 2) {
            return deps[0]+ ":" + helper(deps.slice(1,deps.length));
        }
    };
    var cp = helper(deps);
    if (cp) {
        return " -cp "+cp;
    } else {
        return "";
    }
}

function addAllOpts(toObj,opts){
    log.info("to",toObj);
    log.info("opts",opts);
    for (var key in opts) {
        log.info("key",key);
        if (opts[key] instanceof Array) {
            toObj[key] = opts[key][0]; //fixme
        } else if (opts[key] instanceof Object) {
            toObj[key] = addAllOpts({},opts[key]);
        } else {
            toObj[key] = opts[key];
        }
    }
    log.info("fro",toObj);
    return(toObj);
}

function runExperiment(id){
    verifyInput(id,function(dir, experiment){
        var command;
        var ext = path.extname(experiment.code);
        switch (ext){
            case ".jar":
                command = "java"+getCPDeps(experiment.dependencies)+" -jar "+experiment.code;
                break;
            default:
                log.error("unexpected extension",ext);
        }
        log.info("command",command);
        var arg = {
            "experiment":{
                "dataset":"hcr",
                "train":path.join(db.get_dataset_path("hcr"),"train.json"),
                "test":path.join(db.get_dataset_path("hcr"),"test.json")
            }
        };
        addAllOpts(arg,experiment.opt_parameters);

        var full_command = command + " '" + JSON.stringify(arg) + "'";
        log.info("full command", full_command);
        child.exec(full_command,{
            cwd:dir
        },function(err,stdout,stderr){
            if (err){
                log.error(id + " experiment run err",err);
            } 
            if (stderr){
                log.info(id + " experiment run stderr",stderr);
            }
            if (stdout){
                log.info(id + " experiment run stdout",stdout);
            }
        });
    });
}
module.exports.run_experiment = runExperiment;
