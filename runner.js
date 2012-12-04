var db = require("./database")
  , log = require('winston')
  , child=require('child_process')
  , path = require('path')
  , fs = require('fs')
  , optionexpand = require('./optionexpand')
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

function outputName(opts) {
    var result = "";
    for (var key in opts){
        if (key !== "experiment") {
            if (opts[key] instanceof Object) {
                result += outputName(opts[key]);
            } else {
                result += opts[key];
            }
        } else {
            result += opts["experiment"]["dataset"];
        }
    }
    return result;
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
                "test":path.join(db.get_dataset_path("hcr"),"test.json"),
            }
        };
        var opt_permutations = optionexpand.permutations(arg,experiment.opt_parameters);
        var total = opt_permutations.length;
        //log.info("option_perms ", opt_permutations);
        var in_progress = 0;
        var number_completed = 0;
        var r = function(){
            if (in_progress < 8 && opt_permutations.length > 0) {
                var args = opt_permutations.pop();
                var resDir = path.join(dir,outputName(args));
                try {
                    fs.mkdirSync(resDir);
                } catch(err) {
                    if (err["code"] !== "EEXIST") {
                        throw err;
                    }
                }

                log.info("launching " + (total - opt_permutations.length));
                args["experiment"]["output"] = path.join(resDir,"result.json");
                in_progress++;

                var full_command = command + " '" + JSON.stringify(args) + "'";
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
                        in_progress--;
                        log.info(number_completed++ + " ", full_command);
                        log.info(id + " experiment run stdout",stdout);
                        log.info(number_completed + " ", full_command);
                        log.info("\n");
                    }
                });
                r();
            } else if (opt_permutations.length > 0) {
                log.info("ping");
                setTimeout(r, 1000);
            } else {
                log.info("done");
            }
        };
        r();
    });
}
module.exports.run_experiment = runExperiment;
