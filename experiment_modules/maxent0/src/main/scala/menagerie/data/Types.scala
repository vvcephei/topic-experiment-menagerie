package menagerie.data

case class Tweet(id: String, uname: String, text: List[String], sent: List[(String, String)], uid: String)
