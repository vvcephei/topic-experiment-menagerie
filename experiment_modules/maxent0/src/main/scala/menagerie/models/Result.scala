package menagerie.models

case class Result(total: Int, correct: Int,
                  binTotals: Array[Int], binCorrect: Array[Int],
                  goldLabelTotals: Map[String, Int], goldLabelCorrect: Map[String, Int],
                  predictedLabelTotals: Map[String, Int], predictedLabelCorrect: Map[String, Int]
                   ) {
  val scaled = 1.0 * correct / total
  val binScaled = (binCorrect zip binTotals) map {
    case (c, t) => 1.0 * c / t
  }

  val precision = (for ((ck, cv) <- predictedLabelCorrect) yield (ck, 1.0 * cv / predictedLabelTotals(ck)))
  val recall = (for ((ck, cv) <- goldLabelCorrect) yield (ck, 1.0 * cv / goldLabelTotals(ck)))

  val f1 = (for ((pk,pv) <- precision) yield (pk, 2 * pv * recall(pk) / (pv + recall(pk))))
}
