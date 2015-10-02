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
	},

	kaufvis:function(req,res){
		res.locals.layout = 'vis_layout';
		res.view({})
	}
	
};

