import AssemblyKeys._ // put this at the top of the file

assemblySettings

name := "maxent0"

version := "0.0"

scalaVersion := "2.9.1"

resolvers ++= Seq (
  "repo.codahale.com" at "http://repo.codahale.com"
)

libraryDependencies ++= Seq(
  "net.liftweb"        %% "lift-json"      % "2.4",
  "org.apache.opennlp" %  "opennlp-maxent" % "3.0.2-incubating",
  "edu.stanford.nlp"   %% "tmt"            % "0.4.0",
  "com.codahale"       %% "jerkson"        % "0.5.0"
)

libraryDependencies += "org.scalatest" %% "scalatest" % "1.8" % "test"

libraryDependencies += "junit" % "junit" % "4.10" % "test"

mainClass := Some("menagerie.main.Main")

mainClass in assembly := Some("menagerie.main.Main")
