'use strict';
/*
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 *.
 */

var io = require('./sails.io.js')();
var ServerActionCreators = require('../../actions/ServerActionsCreator');


module.exports = {

  initAdmin: function(user){
    this.zpbTotals("annual_payroll",["12110"], "");
    this.zbpDetails(["12110"], false, "72"); //as optional params
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

  //---------------------------------------------------
  // Voters
  //---------------------------------------------------
  zpbTotals: function(type,zips,year){ //Should be only one zip!
    
    console.time('loadTotals');
    
    console.log('zbpTotals',zips);
    var yearPath = year || '';
    var zipPost = {'zips':zips}

    io.socket.post('/totals/'+type+'/'+yearPath, zipPost, function(resData){
      console.log('resdata totals', resData);
      console.timeEnd('loadTotals');
      ServerActionCreators.receiveTotals(type,resData, zips[0]);
    });
  },
  zbpDetails: function(zips, year, naics) {
    console.time('load Details');
    console.log('zbpDetails', zips);

    var yearPath = year || '';
    var zipPost = {'zips':zips};

    console.log('/details/' + naics + '' + yearPath)
    io.socket.post('/details/' + naics + '' + yearPath, zipPost, function(resData) {
      console.log('resdata- details', resData);
      console.timeEnd('load Details');
      ServerActionCreators.receiveDetails(resData, zips[0]);
    });
  },
  zipList: function() {
    io.socket.get('/zipcodes',function(resData){
      ServerActionCreators.receiveList(resData);
    })
  }

};
