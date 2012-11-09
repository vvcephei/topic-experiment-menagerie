package menagerie.main

import menagerie.cli.Params
import menagerie.data._
import scalanlp.text.tokenize.{MinimumLengthFilter, WordsAndNumbersOnlyFilter, CaseFolder, SimpleEnglishTokenizer}
import scalanlp.stage.IDField
import scalanlp.stage.Field
import scalanlp.stage.text.TokenizeWith
import scalanlp.stage.text.TermDynamicStopListFilter
import scalanlp.stage.text.TermCounter
import scalanlp.stage.text.TermMinimumDocumentCountFilter
import menagerie.models.{Result, Maxent}
import menagerie.runner.Formatter
import menagerie.data.Types.Annotations
import com.codahale.jerkson.Json
import scalanlp.stage.text.TermMinimumDocumentCountFilter
import scalanlp.stage.IDField
import menagerie.models.Result
import scalanlp.stage.Field
import scalanlp.stage.text.TokenizeWith
import scalanlp.stage.text.TermCounter
import menagerie.data.Tweet
import scalanlp.stage.text.TermDynamicStopListFilter

object Main {
  def main(args: Array[String]) {
    val params = Params.fromArgs(args)
    println(params)

    val trainText = {
      val train = params.experiment.trainFile ~> IDField("id")

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
          TermDynamicStopListFilter(30)
      }
    }

    val testText = {
      val test = params.experiment.testFile ~> IDField("id")

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
          TermDynamicStopListFilter(params.preproc.numTerms)
      }
    }

    val processedText = trainText.data.map(i => (i.id.toString, i.value.toList)).toMap
    val tokenizedTweets = JSONFileReader
      .readDataFile(params.experiment.trainFile)
      .map {
      case Tweet(id, uname, text, sent, uid) => Tweet(id, uname, processedText(id), sent.map(s => (s._1, Constants.UNK_UNK_SENT._2)), uid)
    }

    val test_processedText = testText.data.map(i => (i.id.toString, i.value.toList)).toMap
    val test_tokenizedTweets = JSONFileReader
      .readDataFile(params.experiment.testFile)
      .map {
      case Tweet(id, uname, text, sent, uid) => Tweet(id, uname, test_processedText(id), sent.map(s => (s._1, Constants.UNK_UNK_SENT._2)), uid)
    }


    val model = Maxent.trainModel(tokenizedTweets, params.maxent.iterations)

    val goldAnnotations: Annotations = tokenizedTweets.map(tw=> (tw.id,Annotation(tw.sent,Maxent.keyInv(model.getBestOutcome(model.eval(tw.text.toArray)))))).toMap

    var total = 0
    var correct = 0
    val binTotals = Array.fill(11)(0)
    val correctBinTotals = Array.fill(11)(0)
    var goldLabelTotals = Map[String,Int]().withDefaultValue(0)
    var goldLabelCorrect = Map[String,Int]().withDefaultValue(0)
    var predictedLabelTotals = Map[String,Int]().withDefaultValue(0)
    var predictedLabelCorrect = Map[String,Int]().withDefaultValue(0)
    val predictedAnnotations: Annotations = (for (tw <- test_tokenizedTweets) yield {
      val eval: Array[Double] = model.eval(tw.text.toArray)
      val goldLabel = Maxent.key(tw.sent)
      val predictedLabel = model.getBestOutcome(eval)
      val predictedSent = Maxent.keyInv(predictedLabel)
      val isCorrect: Boolean = tw.sent == predictedSent
      val index: Int = math.round(eval.max.toFloat * 10)

      total += 1
      binTotals(index) += 1
      goldLabelTotals = goldLabelTotals.updated(goldLabel, goldLabelTotals(goldLabel) + 1)
      predictedLabelTotals = predictedLabelTotals.updated(predictedLabel, predictedLabelTotals(predictedLabel) + 1)
      if (isCorrect) {
        correct += 1
        correctBinTotals(index) += 1
        goldLabelCorrect = goldLabelCorrect.updated(goldLabel, goldLabelCorrect(goldLabel) + 1)
        predictedLabelCorrect = predictedLabelCorrect.updated(predictedLabel, predictedLabelCorrect(predictedLabel) + 1)
      }

      (tw.id, Annotation(tw.sent, predictedSent))
    }).toMap

    val result = Result(total,correct,binTotals,correctBinTotals, goldLabelTotals, goldLabelCorrect, predictedLabelTotals, predictedLabelCorrect, goldAnnotations, predictedAnnotations)

    println(net.liftweb.json.pretty(net.liftweb.json.render(Formatter.makeResult(params, result))))
    println("writing to "+params.experiment.outFile.getAbsolutePath)
    params.experiment.outFile.write(Formatter.makeResult(params,result))
    println("done")
  }
}