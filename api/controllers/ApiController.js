/* @flow */

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

var googleapis = require("googleapis"),
	fs = require("fs");

var jwt = new googleapis.auth.JWT(
	"424930963222-s59k4k5usekp20guokt0e605i06psh0d@developer.gserviceaccount.com", 
	"availwim.pem", 
	"3d161a58ac3237c1a1f24fbdf6323385213f6afc", 
	["https://www.googleapis.com/auth/bigquery"]
);
jwt.authorize();

var bigQuery = googleapis.bigquery("v2");

/*
	Converts raw bigquery data to API details format.
*/
var simplifyForDetails = function(response) {
	if(response == null) {
		return {code:400, responseText: "Error in retrieving your query."}
	}
	var sizes = ["total", "1-4","5-9","10-19","20-49","50-99","100-249","250-499","500-999","1000+"],
		toReturn = {},
		fields = response.schema.fields;

	for(var row in response.rows) {
		var rowVals = response.rows[row].f;

		if(!toReturn[rowVals[0].v]) { // If this year doesn't exist in toRet yet.
			toReturn[rowVals[0].v] = {};
		}

		if(fields[0].name == "year") { // if multiple years.
			for(var i=3; i<rowVals.length; i++) { // starting from f_0 at 3
				if(!toReturn[rowVals[0].v][rowVals[1].v]) { // if this zip doesn't exist in obj of yr yet
					toReturn[rowVals[0].v][rowVals[1].v] = {};
				}
				if(!toReturn[rowVals[0].v][rowVals[1].v][rowVals[2].v]) { //if this naics doesn't exist yet within the yr, then zip
					toReturn[rowVals[0].v][rowVals[1].v][rowVals[2].v] = {};
				}
				if(fields[i].name.charAt(0) == 'f') { // if it's a single val.
					toReturn[rowVals[0].v][rowVals[1].v][rowVals[2].v][sizes[i-3]] = rowVals[i].v;
				}
				else { // if it's the total.
					toReturn[rowVals[0].v][rowVals[1].v][rowVals[2].v][fields[i].name] = rowVals[i].v;
				}
			}
		}
		else {
			for(var i=2; i<rowVals.length; i++) { //starting from f_0 at 2
				if(!toReturn[rowVals[0].v][rowVals[1].v]) {
					toReturn[rowVals[0].v][rowVals[1].v] = {};
				}
				if(fields[i].name.charAt(0) == "b") {
					toReturn[rowVals[0].v][rowVals[1].v][sizes[i-2]] = rowVals[i].v;
				}
				else {
					toReturn[rowVals[0].v][rowVals[1].v][fields[i].name] = rowVals[i].v;
				}
			}
		}
	}

	return toReturn;
};

var simplifyForTotals = function(response) {
	if(response == null) {
		return {code:400, responseText: "Error in retrieving your query."}
	}
	var toReturn = {},
		fields = response.schema.fields;

	for(var row in response.rows){
		var rowVals = response.rows[row].f;

		if(fields[0].name == "year") {
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
	var sql = "";
	if(type === "state"){
		sql = "SELECT geoid10 FROM cb_2014_us_zcta510_500k as a, tl_2013_us_state as b " + 
			  "WHERE ST_ContainsProperly(b.the_geom, a.geom) AND b.geoid = '" + fips + "';";
	}
	else if(type === "csa"){
		sql = "SELECT a.geoid10 FROM cb_2014_us_zcta510_500k as a, cb_2014_us_csa_500k as b " +
		      "WHERE ST_ContainsProperly(b.geom, a.geom) AND b.geoid10 = '" + fips + "';";

	}
	else if(type === "metro"){
		sql = "SELECT a.geoid10 FROM cb_2014_us_zcta510_500k as a, cb_2014_us_cbsa_500k as b " +
		      "WHERE ST_ContainsProperly(b.geom, a.geom) AND b.geoid = '" + fips + "';";

	}
	else if(type === "county") {
		sql = "SELECT a.geoid10 FROM cb_2014_us_zcta510_500k as a, tl_2013_us_county as b " +
			  "WHERE ST_ContainsProperly(b.the_geom, a.geom) AND b.geoid = '" + fips + "';";
	}
	return sql;
}

var validType = function(type) { return type === "metro" || type === "csa" || type === "county" || type === "state"; }

module.exports = {
    /*
		Listing Routes
    */
	zipcode_list : function(req, res){
		/*
			/zipcodes/:type/:fips
			type of:
				metro,
				county,
				urban
			Returns:
				if a fips code + type is specified, an array of zipcodes within that fips
				else, an array of all zipcodes.
	    */
		var sql = "";
		
		if(!req.param("fips")){
			sql = "SELECT zip FROM zbp.zbp_totals GROUP BY zip;";
			var request = bigQuery.jobs.query({
				kind: "bigquery#queryRequest",
				projectId: "avail-wim",
				timeoutMs: "30000",
				resource: { query: sql, projectId: "avail-wim" },
				auth: jwt
			},
			function(err, response) {
				if (err) res.json(err);

				res.json({ data: simplifyList(response) });
			});
		}
		else if(!req.param("type")){
			res.json({ status: 500, responseText: "Error, must specify type (state,county,metro) and fips" });
		}
		else if(!parseInt(req.param("fips")) || !(req.param("fips").length == 2 || req.param("fips").length == 5)) {
			res.json({ status: 500, responseText: "Error, invalid fips code (must be of length 2 or 5)" });
		}
		else { 
			var fips = req.param("fips");
			var type = req.param("type");
			
			if(!validType(type)) {
				res.json({ status: 500, responseText: "Error, invalid type (state,county,metro)." });
			}
			else {
				Geocensus.query(getFipsQuery(type, fips), function(err, response){
					if(err) res.json(err);

					res.json({
						data: response.rows.map(function(row) {
							return row.geoid10;
						})
					});
				});
			}
		}
	},

	naics_list : function(req, res){
		/*
			/naics/:ncode
			Returns:
				if a naics code is specified, array of all naics codes similar to it
				else, array of all naics
		*/
		var sql = "";
		if(!req.param("ncode")) {
			sql = "SELECT naics FROM zbp.zbp_details GROUP BY naics ORDER BY naics;";

		}
		else {
			var ncode = req.param("ncode");
			if(ncode.length > 6) {
				res.json({ status: 500, responseText: "Error, invalid naics code" });
			}
			else {
				sql = "SELECT naics FROM zbp.zbp_details WHERE naics LIKE \"" + ncode + "%\" GROUP BY naics ORDER BY naics;";
			}
			
		}
		var request = bigQuery.jobs.query({
				kind: "bigquery#queryRequest",
				projectId: "avail-wim",
				timeoutMs: "30000",
				resource: { query: sql, projectId: "avail-wim" },
				auth: jwt
			},
			function(err, response) {
				if (err) res.json(err);

				res.json({ data: simplifyList(response) })
		});
		
	},

	/*
		Primary Data Routes
	*/
	totals : function(req, res){
		/*
			/totals/:variable_name/:year
			POST :zips or :fips
			Variable names of :
				annual_payroll
				q1_payroll
				employees
				establishments
			years from 1994 to 2012
			Returns: 
				{
				    "data": {
				        "99516": 1308,
				        "99517": 1819
				    }
				}
				else
				{
				    "data": {
				        "1994": {
				            "99516": 1656,
				            "99517": 3078
				        },
				        "1995": {
				            "99516": 1760,
				            "99517": 3082
				        },
				        ...
				    }
				} (if no year specified)	
		*/

		var validateVarName = function(varName) {
			return varName == "annual_payroll" ||
				   varName == "q1_payroll" ||
				   varName == "employees" ||
				   varName == "establishments";
		};

		var fixVarName = function(varName) {
			switch(varName) {
				case "annual_payroll":
					return "ap"; break; // I guess these breaks are redundant/unreachable.
				case "q1_payroll":
					return "qp1"; break;
				case "employees":
					return "emp"; break;
				case "establishments":
					return "est"; break;
			}
		};

		var codes = [];
		if(!req.param("variable_name")) {
			res.json({ status: 500, responseText: "Error, must pass variable name, see documentation." });
		}
		else if(!validateVarName(req.param("variable_name"))) {
			res.json({ status: 500, responseText: "Error, invalid variable name, see documentation." });
		}
		
		else if(!req.param("zips") && !req.param("fips")) {
			res.json({ status: 500, responseText: "Error, must pass fips code or array of zip codes." });
		}
		else if(req.param("zips") && req.param("fips")) {
			res.json({ status: 500, responseText: "Error, only pass either fips or zips." });
		}
		else if(req.param("fips")) {
			var fips = req.param("fips");
			if(!(fips.hasOwnProperty("type") && fips.hasOwnProperty("code"))) {
				res.json({ status: 500, responseText: "Error, must pass FIPS object with attributes type and code." });
			}
			else if(typeof fips.type != "string" || typeof fips.code != "string") {
				res.json({ status: 500, responseText: "Error, type and code must be Strings." });
			}
			else {
				var fipsCode = fips.code, type = fips.type;
				if(!validType(type)) {
					res.json({ status: 500, responseText: "Error, invalid type (state,county,metro)." });
				}
				else {
					Geocensus.query(getFipsQuery(type, fipsCode), function(err, response) {
						if(err) res.json(err);

						codes = response.rows.map(function(row) {
							return row.geoid10;
						}); 

						if(codes === []) {
							res.json({ data: null });
						}
						codes = JSON.stringify(codes).replace("[", "").replace("]", "");
						var sql = "";
						var varName = fixVarName(req.param("variable_name"));
						if(req.param("year")) { // If no year is passed, get summed data.
							var year = req.param("year");
							if((!parseInt(year) && !(parseInt(year) > 1993 && parseInt(year) < 2013))) { // if invalid year
								res.json({ status: 500, responseText: "Error, invalid year, should be from 1994 to 2012." });
							}
							sql = "SELECT zip, " + varName + " FROM zbp.zbp_totals WHERE zip IN (" + codes + ") AND year = \"" + year + "\" GROUP BY zip, emp, " + varName + " ORDER BY zip;";
						}
						else { 
							sql = "SELECT year, zip, sum(" + varName + ") FROM zbp.zbp_totals WHERE zip IN (" + codes + ") GROUP BY year, zip, " + varName + " ORDER BY year, zip;";	
						}
						
						var request = bigQuery.jobs.query({
							kind: "bigquery#queryRequest",
							projectId: "avail-wim",
							timeoutMs: "30000",
							resource: { query: sql, projectId: "avail-wim" },
							auth: jwt
						},
						function(err, response) {
							if (err) res.json(err);
							
							res.json({ data: simplifyForTotals(response) });
						});
					});
				}
			}
		}
		else if(req.param("zips")) {
			codes = JSON.stringify(req.param("zips")).replace("[", "").replace("]", "");
			console.log('ZIPs total',req.param("zips"),codes)
			
			var sql = "";
			var varName = fixVarName(req.param("variable_name"));

			if(req.param("year")) { // If no year is passed, get summed data.
				var year = req.param("year");
				if((!parseInt(year) && !(parseInt(year) > 1993 && parseInt(year) < 2013))) { // if invalid year
					res.json({ status: 500, responseText: "Error, invalid year, should be from 1994 to 2012." });
				}
				sql = "SELECT zip, " + varName + " FROM zbp.zbp_totals WHERE zip IN (" + codes + ") AND year = " + year + " GROUP BY zip, emp, " + varName + " ORDER BY zip;";
			}
			else { 
				sql = "SELECT year, zip, sum(" + varName + ") FROM zbp.zbp_totals WHERE zip IN (" + codes + ") GROUP BY year, zip, " + varName + " ORDER BY year, zip;";	
			}

			console.log('ZIP TOTAL SQL:',sql);
			var request = bigQuery.jobs.query({
				kind: "bigquery#queryRequest",
				projectId: "avail-wim",
				timeoutMs: "30000",
				resource: { query:sql,projectId:"avail-wim" },
				auth: jwt
			},
			function(err, response) {
				if (err) res.json(err);
			
				res.json({ data:simplifyForTotals(response) });
			});
		}
	},

	details : function(req, res){
		/*
			/details/:year
			POST naics and (zips or fips)
			years from 1994 to 2012
			returns:
				{
				    "data": {
				        "95014": {
				            "total": "134",
				            "1-4": "29",
				            "5-9": "24",
				            "10-19": "38",
				            "20-49": "30",
				            "50-99": "11",
				            "100-249": "2",
				            "250-499": "0",
				            "500-999": "0",
				            "1000+": "0"
				        },
				        ...
				    }
				}
				else
				{
				    "data": {
				        "1994": {
				            "95014": {
				                "total": "52",
				                "1-4": "33",
				                "5-9": "9",
				                "10-19": "7",
				                "20-49": "1",
				                "50-99": "1",
				                "100-249": "1",
				                "250-499": "0",
				                "500-999": "0",
				                "1000+": "0"
				            },
				            "95050": {
				                "total": "43",
				                "1-4": "25",
				                "5-9": "11",
				                "10-19": "5",
				                "20-49": "2",
				                "50-99": "0",
				                "100-249": "0",
				                "250-499": "0",
				                "500-999": "0",
				                "1000+": "0"
				            }
				        },        ...
				    }
				}
				if no year specified
		*/
		var sql = "";
		var codes = null;
		// if(!req.param("naics") || req.param("naics").length == 0 || !Array.isArray(req.param("naics"))) {
		// 	res.json({ status: 500, responseText: "Error, must pass array of naics codes" });
		// }
		if(!req.param("fips") && !req.param("zips")) {
			res.json({ status: 500, responseText: "Error, must pass zips or fips codes" });
		}
		else if(req.param("fips") && req.param("zips")) {
			res.json({ status: 500, responseText: "Error, only pass either fips or zips." });
		}
		else if(req.param("fips")) {
			var fips = req.param("fips");
			if(!(fips.hasOwnProperty("type") && fips.hasOwnProperty("code"))) {
				res.json({ status: 500, responseText: "Error, must pass FIPS object with attributes type and code." });
			}
			else if(typeof fips.type != "string" || typeof fips.code != "string") {
				res.json({ status: 500, responseText: "Error, type and code must be Strings." });
			}
			// else if(req.param("naics").indexOf("") != -1 || req.param("naics").indexOf(" ") != -1) {
			// 	res.json({ status: 500, responseText: "Error, cannot pass empty naics codes with fips"});
			// }
			else {
				var fipsCode = fips.code, type = fips.type;
				if(!validType(type)) {
					res.json({ status: 500, responseText: "Error, invalid type (state,county,metro)." });
				}
				else {
					Geocensus.query(getFipsQuery(type, fipsCode),function(err, response){
						if(err) res.json(err);

						codes = response.rows.map(function(row) {
							return row.geoid10;
						});
						codes = JSON.stringify(codes).replace("[", "").replace("]", "");

						var naicsString = '';
						if(req.param("naics")){				
							var naics = req.param("naics");
							var naicsString ="AND (naics LIKE \"" + naics[0] + "%\" ";
							for(var i=1; i<naics.length; i++) {
								naicsString += "OR naics LIKE \"" + naics[i] + "%\" ";
							}
							naicsString += ") ";
						}

						if(req.param("year")) {
							var year = req.param("year");
							if((!parseInt(year) && !(parseInt(year) > 1993 && parseInt(year) < 2013))) { // if invalid year
								res.json({ status: 500, responseText: "Error, invalid year, should be from 1994 to 2012." });
							}
							sql = "SELECT zip, naics, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10 FROM zbp.zbp_details WHERE year = \"" + year + "\" AND zip IN (" + codes + ") " + naicsString + " GROUP BY zip, naics, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10 ORDER BY zip;";
						}
						else { //if the user wants the summed data
							sql = "SELECT year, zip, naics, sum(b1), sum(b2), sum(b3), sum(b4), sum(b5), sum(b6), sum(b7), sum(b8), sum(b9), sum(b10) FROM zbp.zbp_details WHERE zip IN (" + codes + ") " + naicsString + " GROUP BY year, zip, naics ORDER BY year, zip;";
						}
						console.log('fips detail sql:',sql)
						var request = bigQuery.jobs.query({
								kind: "bigquery#queryRequest",
								projectId: "avail-wim",
								timeoutMs: "30000",
								resource: {query:sql,projectId:"avail-wim"},
								auth: jwt
							},
							function(err, response) {
								if (err) res.json(err);

								res.json({data:simplifyForDetails(response)})
								//res.json({data:response})
							});
					});
				}
			}
		}
		else if(req.param("zips")) {
			codes = JSON.stringify(req.param("zips")).replace("[", "").replace("]", "");
			var naicsString = '';
			if(req.param("naics")){				
				var naics = req.param("naics");
				var naicsString ="AND (naics LIKE \"" + naics[0] + "%\" ";
				for(var i=1; i<naics.length; i++) {
					naicsString += "OR naics LIKE \"" + naics[i] + "%\" ";
				}
				naicsString += ") ";
			}
			if(req.param("year")) {	
				var year = req.param("year");
				if((!parseInt(year) && !(parseInt(year) > 1993 && parseInt(year) < 2013))) { // if invalid year
					res.json({ status: 500, responseText: "Error, invalid year, should be from 1994 to 2012." });
				}
				sql = "SELECT zip, naics, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10 FROM zbp.zbp_details WHERE year = \"" + year + "\" AND zip IN (" + codes + ") " + naicsString + " GROUP BY zip, naics, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10 ORDER BY zip;";
			}
			else { // if the user wants the summed data
				sql = "SELECT year, zip, naics, sum(b1), sum(b2), sum(b3), sum(b4), sum(b5), sum(b6), sum(b7), sum(b8), sum(b9), sum(b10) FROM zbp.zbp_details WHERE zip IN (" + codes + ") " + naicsString + " GROUP BY year, zip, naics ORDER BY year, zip;";
			}
			console.log(' details sql : ',sql)
			var request = bigQuery.jobs.query({
					kind: "bigquery#queryRequest",
					projectId: "avail-wim",
					timeoutMs: "30000",
					resource: { query: sql, projectId: "avail-wim" },
					auth: jwt
				},
				function(err, response) {
					if (err) res.json(err);

					res.json( { data: simplifyForDetails(response) } );
				});
		}
		
		
	},

	/*
		Geography Functions
	*/
	
	zipcode_geo : function(req, res){
		/*
			/geozipcodes
			POST zips or fips
			returns:
				geojson for each zip code in zips
				or
				geojson for fip (provide type)
		*/

		var sql = "";
		console.log('new test 1', req.param('fips'), req.param('zips'))
		if(!req.param("fips") && !req.param("zips")) {
			res.json({ status: 500, responseText:"Error, must pass zips or fips codes" });
		}
		if(req.param("zips") && req.param("fips")) {
			res.json({ status: 500, responseText: "Error, only pass either zips or fips." });
		}
		else if(req.param("fips")) {
			var fips = req.param("fips");

			if(!(fips.hasOwnProperty("type") && fips.hasOwnProperty("code"))) {
				res.json({ status: 500, responseText: "Error, must pass FIPS object with attributes type and code." });
			}
			else if(typeof fips.type != "string" || typeof fips.code != "string") {
				res.json({ status: 500, responseText: "Error, type and code must be Strings." });
			}
			else if(!validType(fips.type)) {
				res.json({ status: 500, responseText: "Error, invalid type (state,county,metro)." });
			}
			else {
				var fipsCode = fips.code, fipsType = fips.type;
				switch(fipsType) {
					case "metro": 
						sql = "SELECT ST_ASGeoJSON(geom) AS geom,geoid FROM cb_2014_us_cbsa_500k WHERE geoid = \'" + fipsCode + "\';";
					break;
					case "csa": 
						sql = "SELECT ST_ASGeoJSON(geom) AS geom,geoid10 FROM cb_2014_us_csa_500k WHERE geoid10 = \'" + fipsCode + "\';";
					break;
					case "state":
						sql = "SELECT ST_ASGeoJSON(the_geom) AS geom,geoid10 FROM tl_2013_us_state WHERE geoid = \'"+ fipsCode + "\';";
					break;
					case "county":
						sql = "SELECT ST_ASGeoJSON(the_geom) AS geom,geoid10 FROM tl_2013_us_county WHERE geoid = \'" + fipsCode + "\';";
					break;
					default:
						sql = "";
				}
				console.log('test', fipsType, fipsCode, sql)
			}
		}
		else {
			var zips = JSON.stringify(req.param("zips")).replace("[", "").replace("]", "").replace(new RegExp("[\"]", "g"), "\'");
			// var sql="SELECT ua.geoid10, ua.name10, ua.namelsad10,ua.uatyp10, ST_ASGeoJSON(ua.geom) as geom, 
			// string_agg(zip.geoid10,',') as zip_codes 
			// FROM cb_2014_us_csa_500k as ua ,cb_2014_us_zcta510_500k as zip
			// where ST_Overlaps(ua.geom, zip.geom) and ua.name10 like '%NY%' 
			// group by  ua.geoid10, ua.name10, ua.namelsad10,ua.uatyp10, ST_ASGeoJSON(ua.geom)";
			sql = "SELECT ST_ASGeoJSON(geom) AS geom,geoid10 FROM cb_2014_us_zcta510_500k WHERE geoid10 IN (" + zips + ")";
			//var sql = "SELECT geoid10, aland10, ST_ASGeoJSON(geom) as geom FROM cb_2014_us_zcta510_500k"
			
		}
		
		Geocensus.query(sql,function(err, data) {
			if(err) res.json(err);

			var geoJSON = {};
			geoJSON.type = "FeatureCollection";
			geoJSON.features = [];
			data.rows.forEach(function(row, index) {
				var feature = {};
				feature.type ="Feature";
				feature.properties = {};
				feature.properties.id = index;
				feature.properties.geoid = row.geoid10;
				//feature.properties.geoid = row.geoid10;
				feature.geometry = JSON.parse(row.geom);
				geoJSON.features.push(feature);
				
			})
			res.json(geoJSON);
		});
	}
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to APIController)
   */
};