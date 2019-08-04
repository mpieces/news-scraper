// function that takes in 'scrapedData' (JSON) and creates a table body

function displayResults(scrapedData) {
    // empty the table
    $("tbody").empty();
    
    scrapedData.forEach(function(article) {
    // append each of the article's properties to the table
    var tr = $("<tr>").append( 
        $("<td>").text(article.photo),
        $("<td>").text(article.title),
        $("<td>").text(article.link),
        $("<td>").text(article.commments)
    );

    $("tbody").append(tr);
    });
}

// 1: On Load
// ==========

// First thing: ask the back end for json with all articles
$.getJSON("/all", function(data) {
    // Call our function to generate a table body
    displayResults(data);
  });


  // Add user comments