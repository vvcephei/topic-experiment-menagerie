
function getExperimentMaxAcc(experiment) {
  var i=0
    , max = -Infinity
    , results = experiment.get('results')
    ;
  for (i=0; i<results.length; i++) {
    max = Math.max(max,results[i].accuracy);
  }
  return max;
}

module.exports.getExperimentMaxAcc = getExperimentMaxAcc;
