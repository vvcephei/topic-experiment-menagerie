package menagerie.models

import menagerie.data.Types.Annotations

case class Result(total: Int, correct: Int,
                  certaintyBinTotals: Array[Int], certaintyBinCorrect: Array[Int],
                  goldLabelTotals: Map[String, Int], goldLabelCorrect: Map[String, Int],
                  predictedLabelTotals: Map[String, Int], predictedLabelCorrect: Map[String, Int],
                  goldAnnotations: Annotations,
                  predictedAnnotations: Annotations
                   ) {
  val scaled = 1.0 * correct / total
  val certaintyBinScaled = (certaintyBinCorrect zip certaintyBinTotals) map {
    case (c, t) => 1.0 * c / t
  }

  val precision = (for ((ck, cv) <- predictedLabelCorrect) yield (ck, 1.0 * cv / predictedLabelTotals(ck)))
  val recall = (for ((ck, cv) <- goldLabelCorrect) yield (ck, 1.0 * cv / goldLabelTotals(ck)))

  val f1 = (for ((pk, pv) <- precision) yield (pk, 2 * pv * recall(pk) / (pv + recall(pk))))
}
