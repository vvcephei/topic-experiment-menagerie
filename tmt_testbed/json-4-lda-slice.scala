// Stanford TMT Example 4 - Slicing LDA model output
// http://nlp.stanford.edu/software/tmt/0.4/

// tells Scala where to find the TMT classes
import scalanlp.io._;
import scalanlp.stage._;
import scalanlp.stage.text._;

import scalanlp.pipes.Pipes.global._;

import edu.stanford.nlp.tmt.stage._;
import edu.stanford.nlp.tmt.model.lda._;


// the path of the model to load
val modelPath = file("lda-a0c627d5-30-b73485d9")

println("Loading "+modelPath);
val model = LoadCVB0LDA(modelPath);
// Or, for a Gibbs model, use:
// val model = LoadGibbsLDA(modelPath);

// A dataset for inference; here we use the training dataset
val source = JSONFile("dev.json") ~> IDField("id")

val text = {
  source ~>                              // read from the source file
  Field("text") ~>                           // select column containing text
  TokenizeWith(model.tokenizer.get)      // tokenize with existing model's tokenizer
}

// turn the text into a dataset ready to be used with LDA
val dataset = LDADataset(text, termIndex = model.termIndex);

// define fields from the dataset we are going to slice against
val slice = source ~> Field("sent");
// could be multiple columns with: source ~> Columns(2,7,8)

// Base name of output files to generate
val output = file(modelPath, source.meta[java.io.File].getName.replaceAll(".csv",""));

println("Loading document distributions");
val perDocTopicDistributions = InferCVB0DocumentTopicDistributions(model,dataset)
//  LoadLDADocumentTopicDistributions(
//  CSVFile(modelPath,"document-topic-distributions.csv"));
// This could be InferDocumentTopicDistributions(model, dataset)
// for a new inference dataset.  Here we load the training output.

println("Writing topic usage to "+output+"-sliced-usage.csv");
val usage = QueryTopicUsage(model, dataset, perDocTopicDistributions, grouping=slice);
CSVFile(output+"-sliced-usage.csv").write(usage);

println("Estimating per-doc per-word topic distributions");
val perDocWordTopicDistributions = EstimatePerWordTopicDistributions(
  model, dataset, perDocTopicDistributions);

println("Writing top terms to "+output+"-sliced-top-terms.csv");
val topTerms = QueryTopTerms(model, dataset, perDocWordTopicDistributions, numTopTerms=50, grouping=slice);
CSVFile(output+"-sliced-top-terms.csv").write(usage);

