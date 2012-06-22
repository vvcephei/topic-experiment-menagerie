// Stanford TMT Example 0 - Basic data loading
// http://nlp.stanford.edu/software/tmt/0.4/

import scalanlp.io._;

val hcr = JSONFile("train.json");

println("Success: " + hcr + " contains " + hcr.data.size + " records");
//println("Success: " + hcr);

