package menagerie.cli

import scalanlp.io.JSONFile

case class Params(dataset: String, train: String, test: String, k: Int, N: Int, alpha: Float, beta: Float, numTerms: Int, classifierIterations: Int) {
  override def toString = "{dataset:%s, k:%s, N:%s, alpha:%f, beta:%f, numTerms:%d, train:%s, test:%s, classifierIterations:%s}".format(dataset, k, N, alpha, beta, numTerms, train, test, classifierIterations)

  def toJsonString = toString

  val trainFile = JSONFile(train)

  val testFile = JSONFile(test)
}

object Params {
  def fromArgs(args:Array[String]) = Params(args(0), args(1), args(2), args(3).toInt, args(4).toInt, args(5).toFloat, args(6).toFloat, args(7).toInt, args(8).toInt)
}
