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
    _totals = {},
    _variable = "",
    _details = {},
    _zip = "";

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

  getList: function() {
    return _zipcodeList;
  },
  getZip: function() {
    return _zip;
  },
  getTotals: function() {
    return _totals;
  },
  getVariable: function() {
    return _variable;
  },
  getDetails: function() {
    return _details;
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
      _totals = action.totals.data;
      _variable = action.variable;
      _zip = action.zip;
      zbpStore.emitChange();
    break;
    case ActionTypes.RECEIVE_DETAILS:
      _details = action.details.data;
      _zip = action.zip;

      zbpStore.emitChange();
    break;
    default:
      // do nothing
  }

});

module.exports = zbpStore;
