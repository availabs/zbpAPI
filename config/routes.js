/**
 * Route Mappings
 * (sails.config.routes)
 * CoffeeScript for the front-end.
 *
 * For more information on routes, check out:
 * http://links.sailsjs.org/docs/config/routes
 */

module.exports.routes = {

  //-------------------------------
  // User controller 
  //-------------------------------

  '/':'LandingController.home',

  '/zipcodes' : 'APIController.zipcode_list', //No fips params
  '/zipcodes/:fips' : 'APIController.zipcode_list',
  '/geozipcodes' : 'APIController.zipcode_geo',
  '/naics' : 'APIController.naics_list',     
  '/naics/:ncode' : 'APIController.naics_list',
  '/totals' : 'APIController.totals',
  '/totals/:variable_name' : 'APIController.totals',
  '/totals/:variable_name/:year' : 'APIController.totals',
  '/details' : 'APIController.details',
  '/details/:year' : 'APIController.details',

  '/zip_analysis': 'LandingController.flux', //Main Flux App

  //-------------------------------
  // User controller 
  //-------------------------------

  //Views
  '/login':'UserController.login',
  
  //Auth
  '/logout':'UserController.logout',
  '/login/auth':'UserController.auth',
  
};
