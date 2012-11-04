package menagerie.runner

import menagerie.cli.Params
import net.liftweb.json.JsonAST._
import net.liftweb.json.JsonAST.JField
import net.liftweb.json.JsonAST.JObject
import menagerie.models.Result

object Formatter {
  def makeResult(params: Params, result: Result) = JObject(JField(
    params.toJsonString,
    JObject(
      JField("results", JObject(
        JField("total", JInt(result.total)) ::
          JField("accuracy", JDouble(result.scaled)) ::
          JField("bin totals", JArray(result.binTotals.map(JInt(_)).toList)) ::
          JField("bin accuracy", JArray(result.binScaled.map(JDouble(_)).toList)) ::
          Nil
      )) ::
        //      JField("train_annotations", annotations(training.items, trainDocTopicDist)) ::
        //      JField("eval_annotations", annotations(testing.items, testDocTopicDist)) ::
        //      JField("terms", termList) ::
        //      JField("topics", topicTermDistribution) ::
        Nil)
  ) :: Nil)

}
