// client/code/app/demo.js

// define the number to square (vars are local to this file by default)
var number = 25;

console.log("demo.js");
ss.rpc('app.square', number, function(response){
  alert(number + ' squared is ' + response);
  console.log(number + ' squared is ' + response);
});
