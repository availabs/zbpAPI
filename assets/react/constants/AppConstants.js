

var keyMirror = require('keymirror');

module.exports = {

  ActionTypes: keyMirror({
    
    //-------------------------------------------------------
    //View actions 
    //-------------------------------------------------------
    SELECT_USER: null,
    CREATE_USER:null,
    SET_CURRENT_ZIPCODE:null,

    //-------------------------------------------------------
    //Server actions 
    //-------------------------------------------------------
    SET_APP_SECTION:null,
    RECEIVE_ZIPCODES:null,
    RECEIVE_TOTALS:null,
    RECEIVE_DETAILS:null,
    //-------User--------------------------------------------
    RECEIVE_USERS: null,
    SET_SESSION_USER:null,


  }),

  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  })

};
