package menagerie.cli

import scalanlp.io.JSONFile
import com.codahale.jerkson.Json
import org.codehaus.jackson.annotate.JsonIgnore


case class ExperimentParams(dataset: String, train: String, test: String, output: String){
  @JsonIgnore
  val trainFile = JSONFile(train)

  @JsonIgnore
  val testFile = JSONFile(test)

  @JsonIgnore
  val outFile = JSONFile(output)
}

case class PreprocParams(numTerms: Int)

case class MaxentParams(iterations: Int, cutoff: Int, gaussian: Double)

case class LDAParams(k: Int, N: Int, alpha: Float, beta: Float)

case class Params(experiment:ExperimentParams, preproc: PreprocParams, maxent: MaxentParams)

object Params {
  def fromArgs(args:Array[String]) =
    Json.parse[Params](args(0))
}
