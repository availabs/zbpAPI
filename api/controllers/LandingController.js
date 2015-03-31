/**
 * LandingController
 *
 * @description :: Server-side logic for managing landings
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
	flux:function(req,res){
		res.view({})
	},
	home:function(req,res){
		res.view({page:'docs'});
	}
	
};

