package menagerie.cli

import scalanlp.io.JSONFile
import com.codahale.jerkson.Json
import org.codehaus.jackson.annotate.JsonIgnore


case class ExperimentParams(dataset: String, train: String, test: String){
  @JsonIgnore
  val trainFile = JSONFile(train)

  @JsonIgnore
  val testFile = JSONFile(test)
}

case class MaxentParams(iterations: Int, cutoff: Int, gaussian: Double)

case class LDAParams(k: Int, N: Int, alpha: Float, beta: Float, numTerms: Int)

case class Params(experiment:ExperimentParams, maxent: MaxentParams)

object Params {
  def fromArgs(args:Array[String]) = Json.parse[Params]("""{"experiment": {"dataset": "hcr", "train": "database/datasets/hcr/train.json", "test": "database/datasets/hcr/test.json"}, "maxent": {"iterations": 10, "cutoff":5, "gaussian":1.0}""")
}
