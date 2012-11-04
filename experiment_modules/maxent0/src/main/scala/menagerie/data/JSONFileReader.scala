package menagerie.data

import scalanlp.io.JSONFile
import net.liftweb.json.JsonAST.{JString, JArray}
import menagerie.data.Constants.UNK_UNK_SENT

object JSONFileReader {
  def readDataFile(file: JSONFile): Iterable[Tweet] = file.iterator.toIterable.map(c =>
    Tweet(
      (c \ "id").values.toString,
      (c \ "uname").values.toString,
      (c \ "text").values.toString::Nil,
      (c \ "sent").children.map(_ match {
        case JArray(Nil) => UNK_UNK_SENT
        case JArray(JString(s) :: Nil) => (s, UNK_UNK_SENT._2)
        case JArray(JString(s) :: JString(t) :: Nil) => (s, t)
        case _ => throw new Error("unexpected sent value")
      }),
      (c \ "uid").values.toString
    )
  )
}
