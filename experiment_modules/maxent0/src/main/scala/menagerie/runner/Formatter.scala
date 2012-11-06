package menagerie.runner

import menagerie.cli.Params
import net.liftweb.json.JsonAST._
import net.liftweb.json.JsonAST.JField
import net.liftweb.json.JsonAST.JObject
import menagerie.models.Result
import com.codahale.jerkson.Json

object Formatter {
  def map2fieldList(map: Map[String, Int]):List[JField] = map.toList.map(p=>JField(p._1, JInt(p._2)))
  def dmap2fieldList(map: Map[String, Double]):List[JField] = map.toList.map(p=>JField(p._1, JDouble(p._2)))

  def makeResult(params: Params, result: Result) = JObject(JField(
    Json.generate(params),
    JObject(
      JField("results", JObject(
        JField("total", JInt(result.total)) ::
          JField("accuracy", JDouble(result.scaled)) ::
          JField("bin totals", JArray(result.binTotals.map(JInt(_)).toList)) ::
          JField("bin accuracy", JArray(result.binScaled.map(JDouble(_)).toList)) ::
          JField("goldLabel totals", JObject(map2fieldList(result.goldLabelTotals))) ::
          JField("predictedLabel totals", JObject(map2fieldList(result.predictedLabelCorrect))) ::
          JField("precision", JObject(dmap2fieldList(result.precision))) ::
          JField("recall", JObject(dmap2fieldList(result.recall))) ::
          JField("F1", JObject(dmap2fieldList(result.f1))) ::
          Nil
      )) ::
        //      JField("train_annotations", annotations(training.items, trainDocTopicDist)) ::
        //      JField("eval_annotations", annotations(testing.items, testDocTopicDist)) ::
        //      JField("terms", termList) ::
        //      JField("topics", topicTermDistribution) ::
        Nil)
  ) :: Nil)

}
