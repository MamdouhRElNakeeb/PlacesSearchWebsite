var express = require('express');
var http = require('http'); 
var url = require('url');
var request = require('request');
var fs = require('fs');
var cors = require('cors');
var key = 'AIzaSyAFUA0nL7qpmZ3k5VP-Kczu9xKG7OD90EI';

var app = express();

const yelp = require('yelp-fusion');

const client = yelp.client('wr0lm6LOMVju-orD_VoPKvZImqzyCloFvi_NsZgbQVMQOSxz-ZfZtMjeqI5YjdgoxvL_mFxCCvIbLHry8VnQYAfgL3YgRYV4EdsziuOh4zH0Wr7cL9IaerE-l9a_WnYx');
 
app.use(express.static('public'));

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

//app.use(express.static('public'));

app.get('/index.html', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
});

app.get('/index.js', function (req, res) {
   res.sendFile( __dirname + "/" + "index.js" );
});


//app.use(cors());

var port = process.env.PORT || 8081;

//app.set(‘port’, process.env.PORT || 8888);

//app.get('/products/:id', function (req, res, next) {
//    res.json({msg: 'This is CORS-enabled for all origins!'});
//})
 
app.listen(port, function () {
    console.log('CORS-enabled web server listening on port 8081');
});

app.get('/', function (req, res) {
    var queryData = url.parse(req.url, true).query; 
    if(queryData.calling === 'submit-data'){
        geocode(res, queryData);
    }
    else if(queryData.calling === 'next-data'){
        placesAPICall(res, queryData);
    }
    else if(queryData.calling === 'yelp-data'){
        yelpAPICall(res, queryData);
    }
    else if(queryData.calling == 'place-data'){
        placesDetails(res, queryData);
    }
});

function tableData(body, res, queryData){
    var data = JSON.parse(body); 
    var location = data.results[0].geometry.location.lat+","+data.results[0].geometry.location.lng;
    var radius = queryData.radius*1.6*1000;
    var parameter = "&keyword="+queryData.keyword+"&type="+queryData.type+"&radius="+radius+"&location="+location+"&key="+key;
    var requests = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?"+parameter;
    request.get({ url: requests }, function(error, response, body1) {
        if (!error && response.statusCode == 200) {
            var json = JSON.parse(body1);
            res.send(JSON.stringify(json));
        }
    });
}

function placesDetails(res, queryData){
    var placeID = queryData.placeId;
    var places_url = "https://maps.googleapis.com/maps/api/place/details/json?placeid="+placeID+"&key="+key;
     request.get({ url: places_url }, function(error, response, body) { 
        if (!error && response.statusCode == 200) {
             var json = JSON.parse(body);
            res.send(JSON.stringify(json));
        }
    });
}

function geocode(res, queryData){
    var loc = queryData.location.split(" ");
    var places_url = "https://maps.googleapis.com/maps/api/geocode/json?address="+loc[0]+","+loc[1]+"&key="+key;
    request.get({ url: places_url }, function(error, response, body) { 
        if (!error && response.statusCode == 200) {
             tableData(body,res,queryData);
        }
    });
}

function placesAPICall(res, queryData){
    var places_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken="+queryData.pagetoken+"&key="+key; 
    request.get({ url: places_url }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);
            res.send(JSON.stringify(data));
        }
    });
}

function yelpAPICall(res, queryData){
    client.businessMatch('best', queryData).then(response => {
         if(response.jsonBody.businesses.length!=0){
          console.log(response);
//          var phoneG = queryData.phone.replace(/\D+/g, "");
          var goog = queryData.phone;
          var yelp = response.jsonBody.businesses[0].display_phone;
          var phone_flag = false;
          var name_flag = false;
          var yelp_name = response.jsonBody.businesses[0].name;
          console.log("yelp: "+yelp_name+" google:"+queryData.name);
          if(goog===yelp && queryData.name===yelp_name){
              phone_flag = true;
              name_flag = true;
          }
          if(phone_flag && name_flag){
                get_yelp_reviews(response,res);
          }
          else{
              res.send(JSON.stringify({status:"ZERO_RESULTS"}));
          }
        }
        else {
            res.send(JSON.stringify({status:"ZERO_RESULTS"}));
        }
        }).catch(e => {
        console.log(e);
    });
}

function get_yelp_reviews(response,res){
    client.reviews(response.jsonBody.businesses[0].id).then(response =>{
        res.send(response.body);
    }).catch(e => {
        console.log(e);
    });
}