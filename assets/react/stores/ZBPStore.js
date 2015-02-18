'use strict';
/**
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 */

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    Constants = require('../constants/AppConstants'),
    EventEmitter = require('events').EventEmitter,
    assign = require('object-assign'),

    ActionTypes = Constants.ActionTypes,
    CHANGE_EVENT = 'change';

var _zipcodeList = [],
    _totals = {
      annual_payroll:{},
      q1_payroll:{},
      employees:{},
      establishments:{}
    },
    _variable = "annual_payroll",
    _details = {},
    _zip = "",
    _naics = "72",
    _naicsList = [],
    _chosenVariable = "annual_payroll";

function _addUsers(rawData) {
  //console.log('stores/zbpStore/_addUsers',rawData);
  rawData.forEach(function(user) {
    
      _users[user.id] = user;
    
  });
};


var zbpStore = assign({}, EventEmitter.prototype, {

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },
  
  /**
   * @param {function} callback
   */

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  get: function(id) {
    return _users[id];
  },

  getAll: function() {
    return _users;
  },

  getZipList: function() {
    return _zipcodeList;
  },
  getNaicsList: function() {
    return _naicsList;
  },
  getZip: function() {
    return _zip;
  },
  getTotals: function(varName) { 
    return _totals;
  },
  getVariable: function() {
    return _variable;
  },
  getDetails: function() {
    return _details;
  },
  getNaics: function() {
    return _naics;
  },
  getChosenVariable: function() {
    return _chosenVariable;
  }
});

zbpStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

    case ActionTypes.RECEIVE_ZIPCODES:
      _zipcodeList = action.zipcodes.data;
      zbpStore.emitChange();
    break;
    
    case ActionTypes.RECEIVE_TOTALS:
      //console.log("Action var", action.variable, "with data ", action.totals, "in ZBP store");
      _totals[action.variable] = action.totals.data; //sets it based on whichever variable it is.
      _variable = action.variable; //still necessary?
      _zip = action.zip;
      zbpStore.emitChange();
    break;
    
    case ActionTypes.RECEIVE_DETAILS:
      _details = action.details.data;
      _zip = action.zip;
      _naics = action.naics;
      zbpStore.emitChange();
    break;

    case ActionTypes.RECEIVE_NAICS:
      _naicsList = action.naics.data;
      zbpStore.emitChange();
    break;

    case ActionTypes.SET_CURRENT_VAR:
      _chosenVariable = action.variable;
      zbpStore.emitChange();
    break;

    case ActionTypes.SET_CURRENT_ZIPCODE:
      //console.log(action);
      _zip = [action.zipcode]; //bc zipcode is wanted as an array at some point
      zbpStore.emitChange();
    break;
    
    case ActionTypes.SET_CURRENT_NAICS:
      _naics = action.naics;
      zbpStore.emitChange();
    break;

    default:
      // do nothing
  }

});

module.exports = zbpStore;
