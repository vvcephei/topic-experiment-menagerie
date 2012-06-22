// Stanford TMT Example 5 - Selecting LDA model parameters
// http://nlp.stanford.edu/software/tmt/0.4/

// tells Scala where to find the TMT classes
import scalanlp.io._;
import scalanlp.stage._;
import scalanlp.stage.text._;
import scalanlp.text.tokenize._;
import scalanlp.pipes.Pipes.global._;

import edu.stanford.nlp.tmt.stage._;
import edu.stanford.nlp.tmt.model.lda._;


val source = JSONFile("train.json") ~> IDField("id")
val devsource = JSONFile("dev.json") ~> IDField("id")

val tokenizer = {
  SimpleEnglishTokenizer() ~>            // tokenize on space and punctuation
  CaseFolder() ~>                        // lowercase everything
  WordsAndNumbersOnlyFilter() ~>         // ignore non-words and non-numbers
  MinimumLengthFilter(3)                 // take terms with >=3 characters
}

val text = {
  source ~>                              // read from the source file
  Field("text") ~>
  TokenizeWith(tokenizer) ~>             // tokenize with tokenizer above
  TermCounter() ~>                       // collect counts (needed below)
  TermMinimumDocumentCountFilter(4) ~>   // filter terms in <4 docs
  TermDynamicStopListFilter(30) ~>       // filter out 30 most common terms
  DocumentMinimumLengthFilter(5)         // take only docs with >=5 terms
}
val devtext = {
  devsource ~>                              // read from the source file
  Field("text") ~>
  TokenizeWith(tokenizer) ~>             // tokenize with tokenizer above
  TermCounter() ~>                       // collect counts (needed below)
  TermMinimumDocumentCountFilter(4) ~>   // filter terms in <4 docs
  TermDynamicStopListFilter(30) ~>       // filter out 30 most common terms
  DocumentMinimumLengthFilter(5)         // take only docs with >=5 terms
}

// set aside 80 percent of the input text as training data ...
//val numTrain = text.data.size * 4 / 5;

// build a training dataset
val training = LDADataset(text)

// build a test dataset, using term index from the training dataset 
val testing  = LDADataset(devtext,training.termIndex);

// a list of pairs of (number of topics, perplexity)
var scores = List.empty[(Int,Double)];

// loop over various numbers of topics, training and evaluating each model
for (numTopics <- List(5,10,15,20,25)) {
  val params = LDAModelParams(numTopics = numTopics, dataset = training);
  val output = file("lda-"+training.signature+"-"+params.signature);
  val model = TrainCVB0LDA(params, training, output=null, maxIterations=500);
  
  println("[perplexity] computing at "+numTopics);

  val perplexity = model.computePerplexity(testing);
  
  println("[perplexity] perplexity at "+numTopics+" topics: "+perplexity);

  scores :+= (numTopics, perplexity);
}

println("\n\nSummary:")
for ((numTopics,perplexity) <- scores) {
  println("[perplexity] perplexity at "+numTopics+" topics: "+perplexity);
}

