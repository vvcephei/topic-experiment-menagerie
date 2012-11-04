package menagerie.main

import menagerie.cli.Params
import menagerie.data.{Constants, Tweet, JSONFileReader}
import scalanlp.text.tokenize.{MinimumLengthFilter, WordsAndNumbersOnlyFilter, CaseFolder, SimpleEnglishTokenizer}
import scalanlp.stage.IDField
import scalanlp.stage.Field
import scalanlp.stage.text.TokenizeWith
import scalanlp.stage.text.TermDynamicStopListFilter
import scalanlp.stage.text.TermCounter
import scalanlp.stage.text.TermMinimumDocumentCountFilter
import menagerie.models.{Result, Maxent}
import menagerie.runner.Formatter

object Main {
  def main(args: Array[String]) {
    val params = Params.fromArgs(args)
    println(params)

    val trainText = {
      val train = params.trainFile ~> IDField("id")

      val tokenizer = {
        SimpleEnglishTokenizer() ~> // tokenize on space and punctuation
          CaseFolder() ~> // lowercase everything
          WordsAndNumbersOnlyFilter() ~> // ignore non-words and non-numbers
          MinimumLengthFilter(3) // take terms with >=3 characters
      }

      {
        train ~> // read from the source file
          Field("text") ~>
          TokenizeWith(tokenizer) ~> // tokenize with tokenizer above
          TermCounter() ~> // collect counts (needed below)
          TermMinimumDocumentCountFilter(1) ~> // filter terms in <4 docs
          TermDynamicStopListFilter(params.numTerms)
      }
    }

    val testText = {
      val test = params.testFile ~> IDField("id")

      val tokenizer = {
        SimpleEnglishTokenizer() ~> // tokenize on space and punctuation
          CaseFolder() ~> // lowercase everything
          WordsAndNumbersOnlyFilter() ~> // ignore non-words and non-numbers
          MinimumLengthFilter(3) // take terms with >=3 characters
      }

      {
        test ~> // read from the source file
          Field("text") ~>
          TokenizeWith(tokenizer) ~> // tokenize with tokenizer above
          TermCounter() ~> // collect counts (needed below)
          TermMinimumDocumentCountFilter(1) ~> // filter terms in <4 docs
          TermDynamicStopListFilter(params.numTerms)
      }
    }

    val processedText = trainText.data.map(i => (i.id.toString, i.value.toList)).toMap
    val tokenizedTweets = JSONFileReader
      .readDataFile(params.trainFile)
      .map {
      case Tweet(id, uname, text, sent, uid) => Tweet(id, uname, processedText(id), sent.map(s => (s._1, Constants.UNK_UNK_SENT._2)), uid)
    }

    val test_processedText = testText.data.map(i => (i.id.toString, i.value.toList)).toMap
    val test_tokenizedTweets = JSONFileReader
      .readDataFile(params.testFile)
      .map {
      case Tweet(id, uname, text, sent, uid) => Tweet(id, uname, test_processedText(id), sent.map(s => (s._1, Constants.UNK_UNK_SENT._2)), uid)
    }


    val model = Maxent.trainModel(tokenizedTweets, params.classifierIterations)

    var total = 0
    var correct = 0
    val binTotals = Array.fill(11)(0)
    val correctBinTotals = Array.fill(11)(0)
    for (tw <- test_tokenizedTweets) {
      val eval: Array[Double] = model.eval(tw.text.toArray)
      val isCorrect: Boolean = tw.sent.toString() == model.getBestOutcome(eval)
      total += 1
      val index: Int = math.round(eval.max.toFloat * 10)

      binTotals(index) += 1
      if (isCorrect) {
        correct += 1
        correctBinTotals(index) += 1
      }
      //      if (index == 10 && !isCorrect){
      //        println(tw + "\t" + model.getAllOutcomes(eval))
      //      }
    }
    val result = Result(total,correct,binTotals,correctBinTotals)

    println(net.liftweb.json.pretty(net.liftweb.json.render(Formatter.makeResult(params, result))))
  }
}