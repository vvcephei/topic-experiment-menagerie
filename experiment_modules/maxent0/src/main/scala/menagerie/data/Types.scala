package menagerie.data

case class Tweet(id: String, uname: String, text: List[String], sent: List[(String, String)], uid: String)

case class Annotation(goldSent: List[(String,String)], predictedSent: List[(String,String)])

object Types {
  type Sentiment = List[(String,String)]
  type Annotations = Map[String,Annotation]

}
