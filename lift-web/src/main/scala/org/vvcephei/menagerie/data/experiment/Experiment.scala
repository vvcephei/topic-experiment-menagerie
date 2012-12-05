package org.vvcephei.menagerie.data.experiment

import java.io.File
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule

case class PreprocParams(numTerms: List[Int])

case class MaxentParams(iterations: List[Int], cutoff: List[Int], gaussian: List[Double])

case class LDAParams(k: List[Int], N: List[Int], alpha: List[Float], beta: List[Float])

case class OptParameters(preproc: PreprocParams, maxent: MaxentParams)

case class Description(name: String,
                       description: String,
                       tags: List[String],
                       opt_parameters: OptParameters,
                       task: List[String],
                       dependencies: List[String],
                       code: String)

case class Experiment(description: Description)

object Experiments {
  lazy val experimentDir = new File("/home/john/repos/menagerie/database/experiments")
  lazy val experiments: Map[String, Experiment] =
    (for (experiment: File <- experimentDir.listFiles()) yield (experiment.getName, getExperiment(experiment))).toMap

  def getExperiment(file: File) = {
    val mapper = new ObjectMapper
    mapper.registerModule(DefaultScalaModule)
    Experiment(
      mapper.readValue(new File(file, "description.json"), classOf[Description])
    )
  }
}