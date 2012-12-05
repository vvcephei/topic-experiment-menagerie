package org.vvcephei.liftapi

import net.liftweb.http.rest.RestHelper
import net.liftweb.http.{GetRequest, Req}
import net.liftweb.json.JsonAST.JString
import net.liftweb.json.Serialization.write
import net.liftweb.json.parse
import org.vvcephei.menagerie.data.Datasets
import org.vvcephei.menagerie.data.experiment.Experiments

object Api extends RestHelper {
  serve {
    case Req(List("api", "test"), "json", GetRequest) => JString("static test")

    case Req(List("api", "datasets"), "json", GetRequest) => parse(write(Datasets.datasets))
    case Req(List("api", "datasets", dataset), "json", GetRequest) => parse(write(Datasets.datasets(dataset)))
    case Req(List("api", "datasets", dataset, "description"), "json", GetRequest) => parse(write(Datasets.datasets(dataset).description))
    case Req(List("api", "datasets", dataset, "train"), "json", GetRequest) => parse(write(Datasets.datasets(dataset).train))
    case Req(List("api", "datasets", dataset, "dev"), "json", GetRequest) => parse(write(Datasets.datasets(dataset).dev))
    case Req(List("api", "datasets", dataset, "eval"), "json", GetRequest) => parse(write(Datasets.datasets(dataset).eval))

    case Req(List("api", "experiments"), "json", GetRequest) => parse(write(Experiments.experiments))
  }
}
