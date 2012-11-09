{ "dataset": { "description" : { "name" : "hcr"
                               , "description" : "Health Care Reform Dataset"
                               , "tasks" : ["label", "target", "label_wrt_target","labels", "targets", "label_wrt_targets"]
                               }
             , "train" : [ { "uname": "username"
                           , "text": "content" 
                           , "id": "guid" 
                           , "sent": [         // The label task tries to reproduce  sent[0][0]
                               [               // The target task tries to reproduce sent[0][1]
                               , "UNK"         // The label_wrt_target task tries to reproduce sent[0]
                               , "target"      // Labels tries to repro sent[*][0]
                               ]               // Targets tries to repr sent[*][1]
                             ]                 // Label_wrt_targets tries for sent
                           , "uid": "user id"
                           } 
                         , "...."
                         ]
             , "dev"  : "..."
             , "eval" : "..."
             }
, "experiment": [ { "config" : { "name" : "dummy experiment folder"
                               , "description" : "for prototyping. This field is used to describe the approach."
                               , "tags" : [ "LDA" , "TMT" ]
                               , "opt_parameters" : { "k" : [5, 10, 50, 100] 
                                                    , "N" : [22, 17]
                                                    }
                               , "task": ["label"]
                               , "dependencies" : [ "tmt_2.9.1-0.4.0.min.jar" ]
                               , "code" : "/path/to/sh/or/scala/or/jar/or/zip_with_main.sh"
                               }
                  , "trials" : { "hcr" : { "{'k':5,'N':22}" : { "results" : { "accuracy":0.91
                                                                            , "classes": [ { "sent":[ [ "POS" ] ]
                                                                                           , "precision":0.8
                                                                                           , "recall":0.9
                                                                                           , "f-score":0.85
                                                                                           }
                                                                                         , { "label":[ [ "NEG" ] ]
                                                                                           , "precision":0.7
                                                                                           , "recall":0.9
                                                                                           , "f-score":0.8
                                                                                           }
                                                                                         ]
                                                                            }
                                                              , "train_annotations" : {
                                                                                  "id" : 
                                                                                  { "sent" : [ [ "UNK" ] ]
                                                                                  , "topics" : [ 0.9, 0.01, 0.09 ]
                                                                                  , "..." : "..."
                                                                                  },
                                                                                  "..."
                                                                                }
                                                              , "eval_annotations" : [
                                                                                  { "id" : "guid"
                                                                                  , "sent" : [ [ "UNK" ] ]
                                                                                  , "topics" : [ 0.9, 0.01, 0.09 ]
                                                                                  , "..." : "..."
                                                                                  },
                                                                                  "..."
                                                                                ]
                                                              , "terms" : [ "methyl", "protons", "give", "clearly" ]
                                                              , "topics" : [ [ 0.3  , 0.2      , 0.4   , 0.1       ]
                                                                           , [ 0.9  , 0.09     , 0.009 , 0.001     ]
                                                                           , [ 0.1  , 0.2      , 0.3   , 0.4       ]
                                                                           ]
                                                              , "..." : "..."
                                                              }
                                         , "..." : "..."
                                         }
                               , "..." : "..."
                               }
                  , "final" : { "params" : "{'k':5,'N':22}"
                              , "results" : { "accuracy":0.91
                                            , "classes": [ { "sent":[ [ "POS" ] ]
                                                           , "precision":0.8
                                                           , "recall":0.9
                                                           , "f-score":0.85
                                                           }
                                                         , { "label":[ [ "NEG" ] ]
                                                           , "precision":0.7
                                                           , "recall":0.9
                                                           , "f-score":0.8
                                                           }
                                                         ]
                                            }
                              , "datasets": { "hcr" : { "results" : { "accuracy":0.91
                                                                    , "classes": [ { "sent":[ [ "POS" ] ]
                                                                                   , "precision":0.8
                                                                                   , "recall":0.9
                                                                                   , "f-score":0.85
                                                                                   }
                                                                                 , { "label":[ [ "NEG" ] ]
                                                                                   , "precision":0.7
                                                                                   , "recall":0.9
                                                                                   , "f-score":0.8
                                                                                   }
                                                                                 ]
                                                                    }
                                                      , "annotations" : { "id" : "guid"
                                                                        , "sent" : [ [ "UNK" ] ]
                                                                        , "topics" : [ 0.9, 0.01, 0.09 ]
                                                                        , "..." : "..."
                                                                        }
                                                      , "terms" : [ "methyl", "protons", "give", "clearly" ]
                                                      , "topics" : [ [ 0.3  , 0.2      , 0.4   , 0.1       ]
                                                                   , [ 0.9  , 0.09     , 0.009 , 0.001     ]
                                                                   , [ 0.1  , 0.2      , 0.3   , 0.4       ]
                                                                   ]
                                                      , "..." : "..."
                                                      }
                                            , "..." : "..."
                                            }
                              }
                  , "display"
