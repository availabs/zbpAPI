/**
 * APIController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var googleapis = require('googleapis');
var jwt = new googleapis.auth.JWT(
	'424930963222-s59k4k5usekp20guokt0e605i06psh0d@developer.gserviceaccount.com', 
	'availwim.pem', 
	'3d161a58ac3237c1a1f24fbdf6323385213f6afc', 
	['https://www.googleapis.com/auth/bigquery']
);
var fipsToName = require('../../assets/fips/fips-to-full-name-abbreviation.js');
jwt.authorize();
var bigQuery = googleapis.bigquery('v2');
var simplifyForDetails = function(response) {
	var sizes = ["total", "1-4","5-9","10-19","20-49","50-99","100-249","250-499","500-999","1000+"];
	var toReturn = {},
		fields = response.schema.fields;
	//console.log(response)
	for(var row in response.rows) {
		var rowVals = response.rows[row].f;

		if(!toReturn[rowVals[0].v]) { //If this year doesn't exist in toRet yet.
			toReturn[rowVals[0].v] = {};
		}

		if(fields[0].name == 'year') { //if multiple years.
			for(var i=3; i<rowVals.length; i++) { //starting from f_0 at 3
				if(!toReturn[rowVals[0].v][rowVals[1].v]) { //if this zip doesn't exist in obj of yr yet
					toReturn[rowVals[0].v][rowVals[1].v] = {};
				}
				if(!toReturn[rowVals[0].v][rowVals[1].v][rowVals[2].v]) { //if this naics doesn't exist yet within the yr, then zip
					toReturn[rowVals[0].v][rowVals[1].v][rowVals[2].v] = {};
				}
				if(fields[i].name.charAt(0) == 'f') { //if it's a single val.
					toReturn[rowVals[0].v][rowVals[1].v][rowVals[2].v][sizes[i-3]] = rowVals[i].v;
				}
				else { //if it's the total.
					toReturn[rowVals[0].v][rowVals[1].v][rowVals[2].v][fields[i].name] = rowVals[i].v;
				}
			}
		}
		else {
			for(var i=2; i<rowVals.length; i++) { //starting from f_0 at 2
				if(!toReturn[rowVals[0].v][rowVals[1].v]) {
					toReturn[rowVals[0].v][rowVals[1].v] = {};
				}
				if(fields[i].name.charAt(0) == 'b') {
					toReturn[rowVals[0].v][rowVals[1].v][sizes[i-2]] = rowVals[i].v;
				}
				else {
					toReturn[rowVals[0].v][rowvals[1].v][fields[i].name] = rowVals[i].v;
				}
			}
		}
	}

	return toReturn;
};

var simplifyForTotals = function(response) {
	var toReturn = {},
		fields = response.schema.fields;

	for(var row in response.rows){
		var rowVals = response.rows[row].f;

		if(fields[0].name == 'year') {
			if(!toReturn[rowVals[0].v]) {
				toReturn[rowVals[0].v] = {};
			}
			toReturn[rowVals[0].v][rowVals[1].v] = +rowVals[2].v;
		}
		else {
			toReturn[rowVals[0].v] = +rowVals[1].v;
		}

	}
	return toReturn;
}

var simplifyList = function(response) {
	return response.rows.map(function(row){
		return row.f[0].v;
	});
}

var getFipsQuery = function(type, fips) {
	var sql = '';
	if(type === 'state'){
		sql = 'SELECT geoid10 FROM tl_2013_us_zcta510 as a, tl_2013_us_state as b ' + 
			  'WHERE ST_CONTAINS(b.the_geom, a.geom) AND b.geoid = \'' + fips + '\';';
		

	}
	else if(type === 'metro'){
		sql = 'SELECT a.geoid10 FROM tl_2013_us_zcta510 as a, tl_2013_us_uac10 as b ' +
		      'WHERE ST_CONTAINS(b.geom, a.geom) AND b.geoid10 = \'' + fips + '\';';

	}
	else if(type === 'county') {
		sql = 'SELECT a.geoid10 FROM tl_2013_us_zcta510 as a, tl_2013_us_county as b ' +
			  'WHERE ST_CONTAINS(b.the_geom, a.geom) AND b.geoid = \'' + fips + '\';';
	}
	return sql;
}

var validType = function(type) { return type === 'metro' || type === 'county' || type === 'state'; }

module.exports = {
    
	zipcode_list : function(req,res){
		var sql = '';
		
		if(!req.param('fips')){
			sql = 'Select zip from zbp.zbp_totals group by zip';
			var request = bigQuery.jobs.query({
				kind: 'bigquery#queryRequest',
				projectId: 'avail-wim',
				timeoutMs: '30000',
				resource: {query:sql,projectId:'avail-wim'},
				auth: jwt
			},
			function(err, response) {
				if (err) console.log('Error in zipcode_list with all zips:',err);

				res.json({data:simplifyList(response)})
			});
		}
		if(!req.param('type')){
			res.json({status:500,responseText:'Error, must specify type (state,county,metro) and fips'});
		}
		if(!parseInt(req.param('fips')) || !(req.param('fips').length == 2 || req.param('fips').length == 5 )) {
			res.json({status:500,responseText:'Error, invalid fips code (must be of length 2 or 5)'});
		}
		else { 
			var fips = req.param('fips');
			var type = req.param('type');
			
			if(!validType(type)) {
				res.json({status:500,responseText:'Error, invalid type (state,county,metro).'});
			}
			else {
				Geocensus.query(getFipsQuery(type, fips),function(err, response){
					if(err) console.log('Error:Getting Fips Zip Code List for ' + type +'' ,err);
					var data = response.rows.map(function(row) {
							return row.geoid10;
						});
					res.json({
						data: data
					});
				});
			}
		}

	},
	naics_list : function(req, res){
		var sql = '';
		if(!req.param('ncode')) {
			sql = 'Select naics from zbp.zbp_details group by naics order by naics';

		}
		else {
			var ncode = req.param('ncode');
			if(ncode.length > 6) {
				res.json({status:500,responseText:'Error, invalid naics code'});
			}
			else {
				sql = 'select naics from zbp.zbp_details where naics like \"' + ncode + '%\" group by naics order by naics';
			}
			
		}
		var request = bigQuery.jobs.query({
				kind: 'bigquery#queryRequest',
				projectId: 'avail-wim',
				timeoutMs: '30000',
				resource: {query:sql,projectId:'avail-wim'},
				auth: jwt
			},
			function(err, response) {
				if (err) console.log('Error:',err);

				res.json({data:simplifyList(response)})
		});
		
	},
	totals : function(req,res){
		/*
			/totals/:variable_name/:year
			POST :zips or :fips
			Variable names of :
				annual_payroll
				q1_payroll
				employees
				establishments
			years from 1994 to 2012
		*/
		var validateVarName = function(varName) {
			return varName == 'annual_payroll'||
				   varName == 'q1_payroll'||
				   varName == 'employees'||
				   varName == 'establishments';
		}

		var fixVarName = function(varName) {
			switch(varName) {
				case 'annual_payroll':
					return 'ap'; break;
				case 'q1_payroll':
					return 'qp1'; break;
				case 'employees':
					return 'emp'; break;
				case 'establishments':
					return 'est'; break;
			}
		}
		var codes = null;
		if(!req.param('variable_name')) {
			res.json({status:500,responseText:'Error, must pass variable name, see documentation.'});
		}
		else if(!validateVarName(req.param('variable_name'))) {
			res.json({status:500,responseText:'Error, invalid variable name, see documentation.'});
		}
		
		else if(!req.param('zips') && !req.param('fips')) {
			res.json({status:500,responseText:'Error, must pass fips code or array of zip codes.'});
		}
		else if(req.param('zips') && req.param('fips')) {
			res.json({status:500,responseText:'Error, only pass either fips or zips.'})
		}
		else if(req.param('fips')) {
			var fips = req.param('fips');
			if(!(fips.hasOwnProperty("type") && fips.hasOwnProperty("code"))) {
				res.json({status:500,responseText:'Error, must pass FIPS object with attributes type and code.'});
			}
			else if(typeof fips.type != 'string' || typeof fips.code != 'string') {
				res.json({status:500,responseText:'Error, type and code must be Strings.'});
			}
			else {
				var fipsCode = fips.code, type = fips.type;
				if(!validType(type)) {
					res.json({status:500,responseText:'Error, invalid type (state,county,metro).'});
				}
				else {
					Geocensus.query(getFipsQuery(type, fipsCode),function(err, response){
						if(err) console.log('Error:Getting Fips Zip Code List for ' + type +'' ,err);
						codes = response.rows.map(function(row) {
								return row.geoid10;
							}); //b/c async sucks but also doesn't suck
						codes = JSON.stringify(codes).replace('[', '').replace(']', '');
						var sql = '';
						var varName = fixVarName(req.param('variable_name'));
						if(req.param('year')) { //If no year is passed, get summed data.
							var year = req.param('year');
							if((!parseInt(year) && !(parseInt(year) > 1993 && parseInt(year) < 2013))) { //if invalid year
								res.json({status:500,responseText:'Error, invalid year, should be from 1994 to 2012.'});
							}
							sql = 'select zip, ' + varName + ' from zbp.zbp_totals where zip in (' + codes + ') and year = ' + year + ' group by zip, emp, ' + varName + ' order by zip';
						}
						else { //TODO: TYPE SAFETY. 
							sql = 'select year, zip, sum(' + varName + ') from zbp.zbp_totals where zip in (' + codes + ') group by year, zip, ' + varName + ' order by year, zip';	
						}
						var request = bigQuery.jobs.query({
							kind: 'bigquery#queryRequest',
							projectId: 'avail-wim',
							timeoutMs: '30000',
							resource: {query:sql,projectId:'avail-wim'},
							auth: jwt
						},
						function(err, response) {
							if (err) console.log('Error:',err);
							
							res.json({data:simplifyForTotals(response)})
						});
	
					});
				}
			}
		}
		else if(req.param('zips')) {
			codes = JSON.stringify(req.param('zips')).replace('[', '').replace(']', '');
			var sql = '';
			var varName = fixVarName(req.param('variable_name'));
			if(req.param('year')) { //If no year is passed, get summed data.
				var year = req.param('year');
				if((!parseInt(year) && !(parseInt(year) > 1993 && parseInt(year) < 2013))) { //if invalid year
					res.json({status:500,responseText:'Error, invalid year, should be from 1994 to 2012.'});
				}
				sql = 'select zip, ' + varName + ' from zbp.zbp_totals where zip in (' + codes + ') and year = ' + year + ' group by zip, emp, ' + varName + ' order by zip';
			}
			else { //TODO: TYPE SAFETY. 
				sql = 'select year, zip, sum(' + varName + ') from zbp.zbp_totals where zip in (' + codes + ') group by year, zip, ' + varName + ' order by year, zip';	
			}
			var request = bigQuery.jobs.query({
				kind: 'bigquery#queryRequest',
				projectId: 'avail-wim',
				timeoutMs: '30000',
				resource: {query:sql,projectId:'avail-wim'},
				auth: jwt
			},
			function(err, response) {
				if (err) console.log('Error:',err);
			
				res.json({data:simplifyForTotals(response)})
			});
		}
		
	},
	details : function(req,res){
		var sql = '';
		var codes = null;
		if(!req.param('naics') || !Array.isArray(req.param('naics'))) {
			res.json({status:500,responseText:'Error, must pass array of naics codes'});
		}
		if(!req.param('fips') && !req.param('zips')) {
			res.json({status:500,responseText:'Error, must pass zips or fips codes'});
		}
		else if(req.param('fips') && req.param('zips')) {
			res.json({status:500,responseText:'Error, only pass either fips or zips.'})
		}
		else if(req.param('fips')) {
			var fips = req.param('fips');
			if(!(fips.hasOwnProperty("type") && fips.hasOwnProperty("code"))) {
				res.json({status:500,responseText:'Error, must pass FIPS object with attributes type and code.'});
			}
			else if(typeof fips.type != 'string' || typeof fips.code != 'string') {
				res.json({status:500,responseText:'Error, type and code must be Strings.'});
			}
			else {
				var fipsCode = fips.code, type = fips.type;
				if(!validType(type)) {
					res.json({status:500,responseText:'Error, invalid type (state,county,metro).'});
				}
				else {
					Geocensus.query(getFipsQuery(type, fipsCode),function(err, response){
						if(err) console.log('Error:Getting Fips Zip Code List for ' + type +'' ,err);
						//return response;
						codes = response.rows.map(function(row) {
								return row.geoid10;
							});
						codes = JSON.stringify(codes).replace('[', '').replace(']', '');

						var naics = req.param('naics');
						var naicsString = function() {
							var toRet = 'and (naics like "' + naics[0] + '%" ';
							for(var i=1; i<naics.length; i++) {
								toRet += 'or naics like "' + naics[i] + '%" ';
							}
							toRet += ") ";
							return toRet;
						}
						if(req.param('year')) {
							var year = req.param('year');
							if((!parseInt(year) && !(parseInt(year) > 1993 && parseInt(year) < 2013))) { //if invalid year
								res.json({status:500,responseText:'Error, invalid year, should be from 1994 to 2012.'});
							}
							sql = 'select zip, naics, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10 from zbp.zbp_details where year = "' + year + '" and zip in(' + codes + ') ' + naicsString() + ' group by zip, naics, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10 order by zip';
						}
						else { //if the user wants the summed data
							sql = 'select year, zip, naics, sum(b1), sum(b2), sum(b3), sum(b4), sum(b5), sum(b6), sum(b7), sum(b8), sum(b9), sum(b10) from zbp.zbp_details where zip in(' + codes + ') ' + naicsString() + ' group by year, zip, naics order by year, zip';
						}

						var request = bigQuery.jobs.query({
								kind: 'bigquery#queryRequest',
								projectId: 'avail-wim',
								timeoutMs: '30000',
								resource: {query:sql,projectId:'avail-wim'},
								auth: jwt
							},
							function(err, response) {
								if (err) console.log('Error:',err);
								res.json({data:simplifyForDetails(response)})
								//res.json({data:response})
							});
					});
				}
			}
		}
		else if(req.param('zips')) {
			codes = JSON.stringify(req.param('zips')).replace('[', '').replace(']', '');					
			var naics = req.param('naics');
			var naicsString = function() {
				var toRet = 'and (naics like "' + naics[0] + '%" ';
				for(var i=1; i<naics.length; i++) {
					toRet += 'or naics like "' + naics[i] + '%" ';
				}
				toRet += ") ";
				return toRet;
			}
			if(req.param('year')) {
				var year = req.param('year');
				if((!parseInt(year) && !(parseInt(year) > 1993 && parseInt(year) < 2013))) { //if invalid year
					res.json({status:500,responseText:'Error, invalid year, should be from 1994 to 2012.'});
				}
				sql = 'select zip, naics, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10 from zbp.zbp_details where year = "' + year + '" and zip in(' + codes + ') ' + naicsString() + ' group by zip, naics, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10 order by zip';
			}
			else { //if the user wants the summed data
				sql = 'select year, zip, naics, sum(b1), sum(b2), sum(b3), sum(b4), sum(b5), sum(b6), sum(b7), sum(b8), sum(b9), sum(b10) from zbp.zbp_details where zip in(' + codes + ') ' + naicsString() + ' group by year, zip, naics order by year, zip';
			}

			var request = bigQuery.jobs.query({
					kind: 'bigquery#queryRequest',
					projectId: 'avail-wim',
					timeoutMs: '30000',
					resource: {query:sql,projectId:'avail-wim'},
					auth: jwt
				},
				function(err, response) {
					if (err) console.log('Error in details query:',err);
					res.json({data:simplifyForDetails(response)})
					//res.json({data:response})
				});
		}
		
		
	},

	//--------------------------------------------------------------------------------------
	// Geography Functions
	//--------------------------------------------------------------------------------------
	
	zipcode_geo : function(req,res){
		//add error checking iff the zips array isn't actually an array
		if(!req.param('zips')) {
			res.json({status:500, responseText:'Error, must pass array of zip codes.'})
		}
		else {
			var zips = JSON.stringify(req.param('zips')).replace('[', '').replace(']','').replace(new RegExp('[\"]', 'g'), '\'');
			// var sql="SELECT ua.geoid10, ua.name10, ua.namelsad10,ua.uatyp10, ST_ASGeoJSON(ua.geom) as geom, 
			// string_agg(zip.geoid10,',') as zip_codes 
			// FROM tl_2013_us_uac10 as ua ,tl_2013_us_zcta510 as zip
			// where ST_Overlaps(ua.geom, zip.geom) and ua.name10 like '%NY%' 
			// group by  ua.geoid10, ua.name10, ua.namelsad10,ua.uatyp10, ST_ASGeoJSON(ua.geom)";
			
			var sql = "Select ST_ASGeoJSON(geom) as geom,geoid10 from tl_2013_us_zcta510 where geoid10 in (" + zips + ")";
			//var sql = "SELECT geoid10, aland10, ST_ASGeoJSON(geom) as geom FROM tl_2013_us_zcta510"
			Geocensus.query(sql,function(err,data){
				if(err) console.log('Error', err);
				var geoJSON = {};
				geoJSON.type = "FeatureCollection";
				geoJSON.features = [];
				data.rows.forEach(function(row,index){
					var feature = {};
					feature.type ="Feature";
					feature.properties = {};
					feature.properties.id = index;
					feature.properties.geoid = row.geoid10;
					feature.geometry = JSON.parse(row.geom);
					geoJSON.features.push(feature);
					
				})
				res.json(geoJSON);
			});
		}
	}
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to APIController)
   */
};