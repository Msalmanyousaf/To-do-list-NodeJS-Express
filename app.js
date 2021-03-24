//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

//make a database or connect to existing one
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const itemSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

//make model of collection
const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

//make documents to be added to the collection
const item1 = new Item({
  name: "Do research"
});

const item2 = new Item({
  name: "Cook food"
});

const defaultItems = [item1, item2];


app.use(bodyParser.urlencoded({
  extended: true
}));

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    //foundItems is array of found documents
    if (foundItems.length === 0) {

      // add to the collection Item
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("added default items");
        }
      });

      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Home", items: foundItems});
    }
  });
});


app.post("/", function(req, res) {
  let item = req.body.itemName; // whatever he entered
  let button = req.body.button; // title of the list
  const anItem = new Item({name: item});
  if (button === "Home") {
    Item.insertMany([{name:item}], function(err){
      if(err){
        console.log(err);
      } else {
        console.log("added new item");
      }
    });
    res.redirect("/");
  } else {
    List.findOne({name:button}, function(err, foundList){
      foundList.items.push({name: item});
      foundList.save(function(err){
        if(!err){
          res.redirect("/"+button);
        }
      });

    });

  }
});

app.post("/delete", function(req, res) {
  const checkedID = req.body.checkbox;
  const listTitle = req.body.listTitle;
  if (listTitle === "Home"){
    Item.findByIdAndRemove(checkedID, function(err){
      if(err){
        console.log(err);
      } else{
        console.log("removed a document");
        res.redirect("/");
      }
    });
  } else{
    List.findOneAndUpdate({name: listTitle}, {$pull: {items:{_id:checkedID}}},
      function(err, foundList){
        if (!err){
          res.redirect("/"+ listTitle);
        }
      });
  }

});


app.get("/:abc", function(req, res){
  const listName = _.capitalize(req.params.abc);
  List.findOne({name:listName}, function(err, foundList){
    if(!err){
      if(!foundList){ // checks if the foundList exists

        const aList = new List({name: listName, items:defaultItems});
        aList.save(function(err){
          if(!err){
            res.redirect("/"+listName);
          }
        });

      } else{
        res.render ("list", {listTitle: foundList.name, items: foundList.items})
      }
    }
  });

});


app.get("/about", function(req, res) {
  res.render("about.ejs");
});
app.listen(3000, function() {
  console.log("server running");
});
