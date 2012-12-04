package org.vvcephei.menagerie.data

import java.io.File
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.fasterxml.jackson.core.`type`.TypeReference

case class Description(name: String, description: String, tasks: List[String])

case class Sentiment(sentiment: String, target: String)

case class Document(id: String,
                    uname: String,
                    text: String,
                    sent: List[Sentiment],
                    uid: String)

case class Dataset(description: Description,
                   train: List[Document],
                   dev: List[Document],
                   eval: List[Document])

object Datasets {
  lazy val datasetDir = new File("/home/john/repos/menagerie/database/datasets")
  lazy val datasets: Map[String, Dataset] =
    (for (dataset: File <- datasetDir.listFiles()) yield (dataset.getName, getDataset(dataset))).toMap

  def getDataset(file: File) = {
    val mapper = new ObjectMapper
    mapper.registerModule(DefaultScalaModule)
    Dataset(
      mapper.readValue(new File(file, "description.json"), classOf[Description]),
      mapper.readValue(new File(file, "train.json"), new TypeReference[List[Document]]{}),
      mapper.readValue(new File(file, "dev.json"), new TypeReference[List[Document]] {}),
      mapper.readValue(new File(file, "eval.json"), new TypeReference[List[Document]]{})
    )
  }
}