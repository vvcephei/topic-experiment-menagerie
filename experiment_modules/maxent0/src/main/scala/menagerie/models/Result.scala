package menagerie.models

case class Result(total: Int, correct: Int, binTotals: Array[Int], binCorrect: Array[Int]) {
  val scaled = 1.0 * correct / total
  val binScaled = (binCorrect zip binTotals) map {
    case (c, t) => 1.0 * c / t
  }
}
