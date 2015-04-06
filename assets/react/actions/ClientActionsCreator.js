/**
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/AppConstants');
var ServerActionsCreator = require('./ServerActionsCreator');
var SailsWebApi = require('../utils/api/SailsWebApi');
var ActionTypes = Constants.ActionTypes;

module.exports = {

  setCurrentZipcode: function(data) {
    
    AppDispatcher.handleViewAction({
      type: ActionTypes.SET_CURRENT_ZIPCODE,
      zipcode: data
    });
    SailsWebApi.updateZip(data);
  },
  setCurrentNaics: function(data) {
  	AppDispatcher.handleViewAction({
  		type:ActionTypes.SET_CURRENT_NAICS,
  		naics: data
  	});
  	SailsWebApi.updateNaics(data);
  },
  setCurrentVariable: function(data) { 
    AppDispatcher.handleViewAction({
      type:ActionTypes.SET_CURRENT_VAR,
      variable: data
    });
  }

};