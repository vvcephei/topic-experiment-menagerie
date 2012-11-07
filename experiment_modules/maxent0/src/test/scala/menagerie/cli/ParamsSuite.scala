package menagerie.cli

import org.scalatest.FunSuite

import org.junit.runner.RunWith
import org.scalatest.junit.JUnitRunner
import com.codahale.jerkson.Json

@RunWith(classOf[JUnitRunner])
class ParamsSuite extends FunSuite {
  test("fromJson"){
    val x = Json.parse[Params]("""{"experiment": {"dataset": "hcr", "train": "database/datasets/hcr/train.json", "test": "database/datasets/hcr/test.json"}, "preproc":{"numTerms":30}, "maxent": {"iterations": 10, "cutoff":5, "gaussian":1.0}}""")
    assert(x === Params(ExperimentParams("hcr","database/datasets/hcr/train.json", "database/datasets/hcr/test.json"),PreprocParams(30), MaxentParams(10, 5, 1.0)))
  }

  test("toJson"){
    val x =  Params(ExperimentParams("hcr","database/datasets/hcr/train.json", "database/datasets/hcr/test.json"), PreprocParams(30), MaxentParams(10, 5, 1.0))
    assert(Json.generate(x) === """{"experiment":{"dataset":"hcr","train":"database/datasets/hcr/train.json","test":"database/datasets/hcr/test.json"},"preproc":{"numTerms":30},"maxent":{"iterations":10,"cutoff":5,"gaussian":1.0}}""")
  }
}