package menagerie.runner

import menagerie.cli.Params
import net.liftweb.json.JsonAST._
import net.liftweb.json.JsonAST.JField
import net.liftweb.json.JsonAST.JObject
import menagerie.models.Result
import com.codahale.jerkson.Json
import menagerie.data.Types.Annotations

object Formatter {
  def map2fieldList(map: Map[String, Int]): List[JField] =
    map.toList.map(p => JField(p._1, JInt(p._2)))

  def dmap2fieldList(map: Map[String, Double]): List[JField] = map.toList.map(p => JField(p._1, JDouble(p._2)))

  def listStrPair2JArrJArr(list: List[(String, String)]) = JArray(list.map(p => JArray(JString(p._1) :: JString(p._2) :: Nil)))

  def annotations(annotations: Annotations) = JObject(
    annotations.map(p => JField(p._1, JObject(
      JField("gold sentiment", listStrPair2JArrJArr(p._2.goldSent)) ::
        JField("predicted sentiment", listStrPair2JArrJArr(p._2.predictedSent)) ::
        Nil
    ))).toList
  )

  def makeResult(params: Params, result: Result) = JObject(JField(
    Json.generate(params),
    JObject(
      JField("results", JObject(
        JField("total", JInt(result.total)) ::
          JField("accuracy", JDouble(result.scaled)) ::
          JField("certainty bin totals", JArray(result.certaintyBinTotals.map(JInt(_)).toList)) ::
          JField("certainty bin accuracy", JArray(result.certaintyBinScaled.map(JDouble(_)).toList)) ::
          JField("gold label totals", JObject(map2fieldList(result.goldLabelTotals))) ::
          JField("predicted label totals", JObject(map2fieldList(result.predictedLabelCorrect))) ::
          JField("precision", JObject(dmap2fieldList(result.precision))) ::
          JField("recall", JObject(dmap2fieldList(result.recall))) ::
          JField("F1", JObject(dmap2fieldList(result.f1))) ::
          Nil
      )) ::
        JField("train_annotations", annotations(result.goldAnnotations)) ::
        JField("eval_annotations", annotations(result.predictedAnnotations)) ::
        //      JField("terms", termList) ::
        //      JField("topics", topicTermDistribution) ::
        Nil)
  ) :: Nil)

}
