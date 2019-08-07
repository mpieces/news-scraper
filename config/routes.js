var express = require("express");
const router = express.Router();
var request = require("request");
var cheerio = require("cheerio");
var Headline = require("../models/Headline.js");
var Note = require("../models/Note.js");
var axios = require('axios');

router.get("/", function(req, res) {
    res.redirect("/all");
  });
  
  // Retrieve data from the db
  router.get("/all", function(req, res) {
    Headline.find({}, function(error, found) {
      // Throw any errors to the console
      if (error) {
        console.log(error);
      }
      // If there are no errors, render the home handlebars page with the *art variable accessible to it*
      else {
        var art = {article: found}
        res.render('home', art)
      }
    });
  });
  
  // Scrape data from one site and place it into the mongodb db
  router.get("/scrape", function(req, res) {
      console.log("inside scrape route")
    request("https://www.buzzfeednews.com/",(req, res, body) => {
      // Load the html body into cheerio
      var $ = cheerio.load(body);
     
      var titleArray = [];
      $("div.news-feed article").each(function(i, element) {
        var result = {}
        // Save the text and href of each link enclosed in the current element
         result.title = $(element).children("a").children(".newsblock-story-card__info").children("h2.newsblock-story-card__title").text();
         result.link = $(element).children("a").attr("href");
         result.photo = $(element).find("a").find("img").attr("src");
      
        // if the result's title and link are not empty
        if (result.title !== "" && result.link !== "") {
          // 
          if(titleArray.indexOf(result.title) == -1){
            // push title into titleArray
            titleArray.push(result.title);
            // Using Headline model, count results
            Headline.count({title: result.title}, function(err, count){
              // if the count is 0 or isn't present
              if (count == 0) {
                // create new entry variable = new headline result??
                var entry = new Headline(result);
                // save entry
                entry.save(function(err, doc) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(doc);
                  }
                });
              }
            })
          } else {
            console.log("Headline already exists");
          }
        } else {
          console.log("Not saved to DB")
        }
      });
      });
    res.redirect("/");
  });
  
 router.get('/readArticle/:id', function(req, res){
   console.log("read article route");
   var articleId = req.params.id;
   var hbsobj = {
     article: [],
     body: []
   }

// ????
   Headline.findOne({_id: articleId})
   .populate('comment')
   .exec(function(err, doc) {
     if (err) {
       console.log(err);
     } else { 
      hbsobj.article = doc;
      var link = doc.link;
      axios.get(link).then(function(res){
        var $ = cheerio.load(res.data);
         hbsobj.body = $(this).children('.news-article-header__dek').text();
  
      });
      res.render('article', hbsobj);
     }
    
   })
   
 })
    
module.exports = router;