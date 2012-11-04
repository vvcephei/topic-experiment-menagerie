package menagerie.models

import opennlp.maxent.{GISModel, GIS}
import opennlp.model.{OnePassDataIndexer, EventStream, Event}
import menagerie.data.Tweet

object Maxent {
  val DEFAULT_ITERATIONS = 10
  val DEFAULT_CUTOFF = 5
  val DEFAULT_GAUSSIAN = 1.0

  def getEventStream(data: Iterable[Tweet]) = new EventStream {
    var seq = data

    def hasNext = seq != Nil

    def next() = {
      val sent = seq.head.sent
      if (sent.length != 1) {
        throw new Error("unexpected sentiment value")
      }
      val result: Event = new Event(sent.toString(), seq.head.text.toArray)
      seq = seq.tail
      result
    }
  }

  def getDataIndexer(data: Iterable[Tweet]) = new OnePassDataIndexer(new EventStream {
    var seq = data

    def hasNext =
      seq != Nil

    def next() = {
      val sent = seq.head.sent
      if (sent.length != 1) {
        throw new Error("unexpected sentiment value")
      }
      val result: Event = new Event(sent.toString(), seq.head.text.toArray)
      seq = seq.tail
      result
    }
  }, 1)

  def trainModel(data: Iterable[Tweet], iterations: Int = DEFAULT_ITERATIONS, cutoff: Int = DEFAULT_CUTOFF, smoothing: Double = DEFAULT_GAUSSIAN)={
    GIS.trainModel(getEventStream(data), iterations, cutoff, smoothing)
  }

}
