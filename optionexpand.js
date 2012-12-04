var log = require('winston');

function clone(obj){
    var res = {};
    for (var i in obj) {
        if (obj[i] instanceof Array || obj[i] instanceof Object) {
            res[i] = clone(obj[i]);
        } else {
            res[i] = obj[i];
        }
    }
    return res
}

function addAllOpts(toObj,opts){
    var permutations = [clone(toObj)];
    //log.info("to",toObj);
    //log.info("opts",opts);
    for (var key in opts) {
        //log.info("key",key);
        if (opts[key] instanceof Array) {
            var temp = [];
            for (var perm in permutations) {
                temp[perm] = permutations[perm];
            }
            permutations = [];
            for (var alt in opts[key]) {
                for (var perm in temp) {
                    var permute = clone(temp[perm]);
                    permute[key] = opts[key][alt];
                    permutations.push(permute);
                }
            }
        } else if (opts[key] instanceof Object) {
            var temp = [];
            for (var perm in permutations) {
                temp[perm] = permutations[perm];
            }
            permutations = [];
            for(var perm in temp) {
                var inner_perms = addAllOpts({},opts[key]);
                for(var ip in inner_perms){
                    var inner_perm = inner_perms[ip];
                    var permute = clone(temp[perm]);
                    permute[key] = inner_perm;
                    permutations.push(permute);
                }
            }
        } else {
            for(var perm in permutations) {
                permutations[perm][key] = opts[key];
            }
        }
    }
    //log.info("fro",toObj);
    return permutations;
}

module.exports.clone = clone;
module.exports.permutations = addAllOpts;
