var Jimp = require("jimp");
var fs = require('fs');
var csv = require("fast-csv");
var http = require('http');
var R = require("r-script");
var express = require('express');
var async = require('async');
var app = express();
var url = require("url");

process.env.PWD = process.cwd()
app.use(express.static(process.env.PWD + '/public'));

var csvData=[];
var go = 0;
var avg = 0.1;
var inputFile='fifa-18-demo-player-dataset/CompleteDataset.csv';

min = 30;
max = 100;
color1 = [60,0,60];
var avgs = [0,0,0,0,0,0,0,1,0,0,0,0];
color2 = [220,0,220];
positions = ['GK','LB','CB','CDM','RB','LW','LM','RM','RW','ST','CAM','CM']

function readData(){
  csvData=[];
  csv.fromPath(inputFile,{headers : true})
      .on("data", function(data){
       csvData.push(data);
      })
     .on("end", function(){
         console.log("data loaded");
     });
}

readData();

function filter_by_atb_country(wmin,wmax,amin,amax,country){
    var filtered = [];
    for(var i = 0; i < csvData.length; i++){
        var obj = csvData[i];
        currWage = parseInt(obj['Wage'].slice(1, -1));
        currAge = parseInt(obj['Age']);
        currCon = obj['Nationality'];
        if(currAge >= amin && currAge <= amax && currWage >= wmin && currWage <= wmax && currCon == country){
            filtered.push(obj);
          }
    }
    return filtered;
}

function filter_by_pos(data,position,metric){
    var filtered = [];
    var sum = 0;
    for(var i = 0; i < data.length; i++){
        var obj = data[i];
        if(obj['Preferred Positions'].includes(position)){
            filtered.push(parseInt(obj[metric],10));
            // console.log(obj['Overall']);
            sum +=parseInt(obj[metric],10);
          }
    }
    return Math.floor(sum/filtered.length);
}

function filtered_list(data,position,metric){
    var filtered = [];
    for(var i = 0; i < data.length; i++){
        var obj = data[i];
        if(obj['Preferred Positions'].includes(position)){
            filtered.push(parseInt(obj[metric],10));
          }
    }
    return filtered;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function custom_crop(player_num){
  Jimp.read("public/player"+player_num+".png", function (err, image) {
    image.crop(122, 17, 175,387);
    image.write("public/player"+player_num+"_crop.png");
  });
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgbc) {
    return "#" + componentToHex(rgbc[0]) + componentToHex(rgbc[1]) + componentToHex(rgbc[2]);
}
function generateColors(start,end,value,mi,ma){
    steps = ma-mi;
    fin = 0;
    rgb = [0,0,0];
    for(var i=0;i<3;i++){
      fin = start[i] + ((end[i] - start[i]) * (ma - value) / steps);
      rgb[i] = Math.floor(fin);
    }
    hexc = rgbToHex(rgb);
    // console.log(hexc);
    return hexc;
}

function create_gliphs(Atb,age_min,age_max,wage_min,wage_max,country,res){
  filteredAgeWage = filter_by_atb_country(wage_min,wage_max,age_min,age_max,country);
  console.log("______")
  for(var k=0;k<12;k++){
    avgs[k] = filter_by_pos(filteredAgeWage,positions[k],Atb)
    // console.log(avgs[k])
  }
  var max = avgs.reduce(function(a, b) {
    return Math.max(a, b);
  });
  var min = avgs.reduce(function(a, b) {
    return Math.min(a, b);
  });
  cdomain = min + "\n" + max;
  for(var k=0;k<11;k++){
    color=generateColors(color1,color2,avgs[k],parseInt(min),parseInt(max));
    cdomain = cdomain + "\n" + avgs[k];
    var cc = "";
    for(var l=0;l<14;l++){
      cc = cc + color+"\n";
    }
    fs.writeFile("color_lists/color_list"+(k+1)+".txt", cc, function(err) {
        if(err) {
            return console.log(err);
        }
    });
  }
  console.log(cdomain);
  fs.writeFile("public/color_domain.txt", cdomain, function(err) {
      if(err) {
          return console.log(err);
      }
  });
  var counter = 0
  var out = R("body.R")
    .call(function(err, d) {
        counter+=1;
        if (err){
          // console.log(d);
        }
        else if(counter>14){
          for(var i = 0;i<12;i++){
            custom_crop(i+1);
          }
          sleep(2000);
          // res.sendFile('index.html', { root: __dirname });
        }
      });
}

app.all('/*', function(req, res, next) {
    var params = url.parse(req.url,true).query;
    var country = params.country;
    var wage_min = parseInt(params.wage_min);
    var wage_max = parseInt(params.wage_max);
    var age_min = parseInt(params.age_min);
    var age_max = parseInt(params.age_max);
    var atb = params.atb;
    if(typeof atb != 'undefined'){
      create_gliphs(atb,age_min,age_max,wage_min,wage_max,country,res);
    }
    res.sendFile('index.html', { root: __dirname });
});

var server = app.listen(8080);
console.log('Server running. Go to url: \n http://localhost:8080/?country=England&atb=Overall&wage_min=1&wage_max=100&age_min=15&age_max=45')