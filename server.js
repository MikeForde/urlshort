// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var mongodb = require('mongodb');
var mongo = require('mongodb').MongoClient;
var url = "mongodb://testname:testpass@ds129462.mlab.com:29462/shorturlsdb";

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  //base address only entered - go to default page with instructions on use
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/new/*", function (req, response) 
{
  // possible new web address to store as shortURL
  
  // check if valid format = http:// + text with at least one . in middle (but not start or end)
  var possibleURL = req.url;
  console.log("Whole url..." + possibleURL);
  
  var startURL = possibleURL.substr(5, 7);
  console.log("The relevant start is " + startURL);
  
  // if not valid format return error message
  if(startURL !== "http://"){
    response.send("Sorry this is not a valid web address");
    return;
  }
  
  var restURL = possibleURL.substr(12);
  console.log("The rest is " + restURL);
  
  var intPosPoint = restURL.indexOf(".");
  
  console.log("Position of . is " + intPosPoint);
  
  if(intPosPoint == -1 || intPosPoint === 0 || intPosPoint == restURL.length-1){
    console.log("Point doesn't exist or at invalid location");
    response.send("Sorry this is not a valid web address");
    return;
  }
  
  // if valid then create unique shortURL number
  // rebuild fullURL
  var fullURL = startURL + restURL;
  console.log("The full URL stored is " + fullURL);
  
  
  var doc;
  
async function addShortURLToDatabase(){
  // check database for current highest shortURL number
  const db = await mongodb.MongoClient.connect(url);
      
  // db gives access to the database    
  //var newCollect = db.collection('tblShortUrls');
    
  var shortURLNumber = 0;
    
  // find highest shortURL number stored
  
  // first check if any records
  var records = await db.collection('tblShortUrls').count();
  
  console.log(records);
  
  if(records == 0){
    shortURLNumber = 1;
  } else {
    var documents = await db.collection('tblShortUrls').find().sort({shortURLNumber:-1}).limit(1).toArray();
    shortURLNumber = documents[0].shortURLNumber + 1;
  }
        
  doc = {
    fullURL: fullURL,
    shortURLNumber:  shortURLNumber
  }

   var documents = await db.collection('tblShortUrls').insert(doc);
    
    db.close();
  
    // return both to user
    response.send("Full URL = " + doc.fullURL + " and short URL = https://mikeforde-urlshort.glitch.me/" + shortURLNumber);
  }
  
  
  // store webaddress and shortURL in database
  addShortURLToDatabase();
  
  });

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
/*app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});*/

app.get("/*", function (req, response) {
  //possible short url
  var possibleNumber = req.url.substr(1);
  console.log("Possible Number = " + possibleNumber);
  
  // check whether * = number
  var asNumber = parseInt(possibleNumber);
  console.log(asNumber);
  var asString = "" + asNumber;
  console.log(asString);
  
  var respText = "";
  if(possibleNumber.length != asString.length){
    console.log("no number of number plus other text");
    respText = "No number of number plus other text";
    response.send(respText);
  } else {
    console.log("just a number");
    respText = "Valid shortURL format but shortURL not known";
    
    // if simple number then see if exists in database
    checkShortURLInDatabase();

    async function checkShortURLInDatabase(){
      // check database for current highest shortURL number
      const db = await mongodb.MongoClient.connect(url);

      // db gives access to the database    
      // first check if any records
      var records = await db.collection('tblShortUrls').count();

      console.log("Records = " + records);

      if(records == 0){
        // no shortURLs stored at all
        //do nothing
        response.send(respText);
      } else {
        // check if shortURL exists
        console.log("Number is " + asNumber);
        var documents = await db.collection('tblShortUrls').find({ shortURLNumber: asNumber }).toArray();
        if(documents.length !==0){
          console.log(documents[0].fullURL);
          var fullURL = documents[0].fullURL;
          response.redirect(fullURL);
          response.end;
        } else {
          response.send(respText);
        }
      }

    db.close();
  }
  // if does then navigate to page
  }
  
  
  
  // if doesn't then return message saying unknown
  //response.send(respText);
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});


/*
mongo.connect(url, function(err, db) {
      if(err) {
          console.log("connection error");
          return;
      }
      
      // db gives access to the database
      var newCollect = db.collection('tblShortUrls');
    
      var shortURLNumber = 0;
    
      // find highest shortURL number stored
      
      newCollect.find().sort({shortURLNumber:-1}).limit(1).toArray(function(err, documents) {
            if(err) {
              console.log("Find error");
              return;
            }
            
          //console.log("Highest one is...." + documents[0].shortURLNumber);
          console.log("Highest one is...." + JSON.stringify(documents));
          shortURLNumber = documents[0].shortURLNumber + 1;
          console.log("Next one is...." + shortURLNumber);
          })
    
        
            
        var doc = {
          fullURL: fullURL,
          shortURLNumber:  shortURLNumber
        }

        newCollect.insert(doc, function(err, data) {
          // handle error
          if(err) {
            console.log("insertion error");
            return;
          }

          // other operations
              console.log(JSON.stringify(doc));
  
        })
    
      // increment by 1 and use as shortURL number for next operation
        db.close();
      })
*/
