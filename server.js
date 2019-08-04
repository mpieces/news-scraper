// express
// express-handlebars
// mongoose
// cheerio
// axios

// Dependencies
var express = require("express");
var mongojs = require("mongojs");

// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
    console.log("inside scrape route")
  // Make a request via axios for the news section of `ycombinator`
  axios.get("https://www.buzzfeednews.com/").then(function(req, response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(req.data);
    // For each element with a "title" class
    $("div.news-feed article").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
      var title = $(element).children("a").children(".newsblock-story-card__info").children("h2.newsblock-story-card__title").text();
      console.log("title: " +title)
      var link = $(element).children("a").attr("href");
      var photo = $(element).find("a").find("img").attr("src");
      var articles = [];
      var articlesToAdd = {
          title: title,
          link: link,
          photo: photo,
          saved: false
      }
      articles.push(articlesToAdd);

      // If this found element had both a title and a link and photo
      if (title && link) {
        //Insert the data in the scrapedData db
        db.scrapedData.insert(articles,
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
            console.log("response: "+response)
            response.render("home", {db_headlines: inserted})
          }
        });
        // db.scrapedData.insert((articles),function(er,aticlesINfo){
        //     console.log("articles: " +articlesINfo);
        //     response.render("home", {db_headlines: articlesINfo});
        // }
         }
    });
});

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
