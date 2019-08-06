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
    // Find all results from the scrapedData collection in the db
    Headline.find({}, function(error, found) {
      // Throw any errors to the console
      if (error) {
        console.log(error);
      }
      // If there are no errors, send the data to the browser as json
      else {
        var art = {article: found}
        res.render('home', art)
      }
    });
  });
  
  // Scrape data from one site and place it into the mongodb db
  router.get("/scrape", function(req, res) {
      console.log("inside scrape route")
    // Make a request via axios for the news section of `ycombinator`
    request("https://www.buzzfeednews.com/",(req, res, body) => {
      // Load the html body from axios into cheerio
      var $ = cheerio.load(body);
      // For each element with a "title" class
      var titleArray = [];
      $("div.news-feed article").each(function(i, element) {
        var result = {}
        // Save the text and href of each link enclosed in the current element
         result.title = $(element).children("a").children(".newsblock-story-card__info").children("h2.newsblock-story-card__title").text();
        //console.log("title: " +title)
         result.link = $(element).children("a").attr("href");
         result.photo = $(element).find("a").find("img").attr("src");
      
        // If this found element had both a title and a link and photo
        if (result.title !== "" && result.link !== "") {
          if(titleArray.indexOf(result.title) == -1){
            titleArray.push(result.title);
            Headline.count({title: result.title}, function(err, count){
              if(count == 0){
                var entry = new Headline(result);
                entry.save(function(err, doc){
                  if(err){
                    console.log(err);
                  }
                  else{
                    console.log(doc);
                  }
                });
              }
            })
          }
          else {
            console.log("Headline already exists");
          }
        }else {
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

   Headline.findOne({_id: articleId})
   .populate('comment')
   .exec(function(err, doc){
     if(err){
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