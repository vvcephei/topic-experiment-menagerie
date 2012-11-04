import AssemblyKeys._ // put this at the top of the file

assemblySettings

name := "maxent0"

version := "0.0"

scalaVersion := "2.9.1"

libraryDependencies ++= Seq(
  "net.liftweb"        %% "lift-json"      % "2.4",
  "org.apache.opennlp" %  "opennlp-maxent" % "3.0.2-incubating",
  "edu.stanford.nlp"   %% "tmt"            % "0.4.0"
)

mainClass := Some("menagerie.main.Main")

mainClass in assembly := Some("menagerie.main.Main")
