package bootstrap.liftweb

import net.liftweb.http.LiftRules
import org.vvcephei.liftapi.Api

class Boot {
  def boot {
    LiftRules.statelessDispatchTable.append(Api)
  }
}
