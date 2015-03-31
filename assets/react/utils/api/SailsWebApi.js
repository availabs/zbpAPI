'use strict';
/*
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 *.
 */

var io = require('./sails.io.js')();
var ServerActionCreators = require('../../actions/ServerActionsCreator');

var defaults = {
  zip: ["10001"],
  year: "",
  naics: [""]
}

var currZip = defaults.zip;
var currNaics = defaults.naics;

module.exports = {

  initAdmin: function(user){

    this.zpbTotals("annual_payroll", defaults.zip, defaults.year);
    this.zpbTotals("q1_payroll", defaults.zip, defaults.year);
    this.zpbTotals("employees", defaults.zip, defaults.year);
    this.zpbTotals("establishments", defaults.zip, defaults.year);

    this.zbpDetails(defaults.zip, defaults.year, defaults.naics); //as optional params
    this.zbpGeo(defaults.zip);
    this.zipList();
    this.naicsList();

    ServerActionCreators.setAppSection('admin');
    
    this.read('user');
    
  
  },
  initCmpgn: function(user,campaign){

    ServerActionCreators.setAppSection('cmpgn');
    ServerActionCreators.setSessionUser(user);
    ServerActionCreators.setSessionCampaign(campaign);
    
    this.read('user');
    this.recieveVoters(campaign.id)
  
  },

  //---------------------------------------------------
  // Sails Rest Route
  //---------------------------------------------------
  create: function(type,data){
    io.socket.post('/'+type,data,function(resData){
      //ToDo Check for Errors and Throw Error Case
      console.log('utils/sailsWebApi/createUser',resData);

      //add new user back to store through 
      ServerActionCreators.receiveData(type,[resData]);
    });
  },
  
  read: function(type) {
    io.socket.get('/'+type,function(data){     
      //console.log('utils/sailsWebApi/getUsers',data);
      ServerActionCreators.receiveData(type,data);
    });
  },


  update: function(type,data){
    io.socket.put('/'+type+'/'+data.id,data,function(resData){
      //ToDo Check for Errors and Throw Error Case
      console.log('utils/sailsWebApi/updateData',resData);

      //add new user back to store through 
      ServerActionCreators.receiveData(type,[resData]);
    });
  },

  delete: function(type,id){
    io.socket.delete('/'+type+'/'+id,function(resData){
      //ToDo Check for Errors and Throw Error Case
      console.log('utils/sailsWebApi/delete',resData,id);

      //Delete 
      ServerActionCreators.deleteData(type,id);
    });
  },

  updateZip: function(zip) {
    //console.log("Updating zip with new zip", zip);
    //add error checking of zip later?
    currZip = zip;
    this.zpbTotals("annual_payroll", currZip, defaults.year);
    this.zpbTotals("q1_payroll", currZip, defaults.year);
    this.zpbTotals("employees", currZip, defaults.year);
    this.zpbTotals("establishments", currZip, defaults.year);

    this.zbpDetails(currZip, defaults.year, currNaics); //as optional params
  },

  updateNaics: function(naics) {
    currNaics = naics;
    if(typeof currNaics == "string") {
      currNaics = currNaics.split(",")
    }
    
    if(!(currNaics instanceof Array)) { //no definite way to do this, bc js sucks
      currNaics = [currNaics];
    }
    //console.log("Updatin naics:", currNaics);
    this.zbpDetails(currZip, defaults.year, currNaics);
  },

  //---------------------------------------------------
  // Voters
  //---------------------------------------------------
  zpbTotals: function(type,zips,year){ //Should be only one zip!
    
    var yearPath = year || '';
    var zipPost = {'zips':zips}
    this.zbpGeo(zips);
    io.socket.post('/totals/'+type+'/'+yearPath, zipPost, function(resData){
      ServerActionCreators.receiveTotals(type,resData, zips[0]);
    });
  },
  //both year and zip should be passed as arrays?!?! maybe
  zbpDetails: function(zips, year, naics) {

    var yearPath = year || '';
    var post = {'zips':zips, 'naics':naics};

    io.socket.post('/details/' + yearPath, post, function(resData) {
      ServerActionCreators.receiveDetails(resData, zips, naics);
    });
  },
  zipList: function() {
    io.socket.get('/zipcodes',function(resData){
      ServerActionCreators.receiveZipList(resData);
    });
  },
  zbpGeo: function(zips) {
    var zipPost = {'zips':zips};
    io.socket.post('/geozipcodes', zipPost, function(resData) {
      ServerActionCreators.receiveGeoJSON(resData);
    });
  },
  naicsList: function() {    
    io.socket.get('/naics', function(resData) {
      ServerActionCreators.receiveNaicsList(resData);
    });       
  }

};
