/*
 * Merge objects
 * @param obj... the objects to merge
 * @return objects merged by property
 */
function merge(){
  var result = {}
    , argIndex
    , arg
    ;
  for (argIndex=0; argIndex < arguments.length; argIndex++){
    arg = arguments[argIndex];
    for (prop in arg) {
      result[prop] = arg[prop];
    }
  }
  return result;
}

/*
 * Join lists of objects, 
 * @param ids : a list of ids. [a,b] specifies that the
 * property a of obj1 equates to proberty b of obj2. Likewise with
 * c and d. [a,b,c] specifies that obj1.a = obj2.b = obj3.c.
 * If 'ids' is not supplied, perform an outer join.
 *
 * @param obj... : several lists of objects to be joined, 
 * specified by the ids param
 *
 * @return a single list of objects, joined as specified. Note that
 * we perform the join from left to right, clobbering same-key properties.
 */
function join(ids){
  var numLists = arguments.length
    , argIndex
    , itemIndex
    , resultDict={}
    , resultList=[]
    , objs
    , item
    , iid
    ;
  for (argIndex=0; argIndex < arguments.length; argIndex++) {
    objs = arguments[argIndex+1];
    if (objs) {
      for(itemIndex=0; itemIndex<objs.length; itemIndex++){
        item = objs[itemIndex];
        iid = item[ids[argIndex]];
        if (iid in resultDict) {
          resultDict[iid] = merge(resultDict[iid],item);
        } else {
          resultDict[iid] = item;
        }
      }
    }
  }

  for (id in resultDict){
    resultList.push(resultDict[id]);
  }

  return resultList;
}

module.exports.merge = merge;
module.exports.join = join;
