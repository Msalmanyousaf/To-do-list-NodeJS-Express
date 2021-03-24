
// module.exports = currentDate; // you are not calling a function yet, so no parenthesis

module.exports.getDate = currentDate;
function currentDate(){
  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let today = new Date();
  today = today.toLocaleDateString("en-US", options);
  return today;
}

// now the following is the more efficient way. no need to write module.
exports.getDay = function(){
  let options = { month: 'long', day: 'numeric' };
  let today = new Date();
  today = today.toLocaleDateString("en-US", options);
  return today;
}
