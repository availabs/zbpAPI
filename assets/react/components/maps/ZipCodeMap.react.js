'use strict';

var React = require('react'),
	//-- Actions
	ClientActionsCreator = require('../../actions/ClientActionsCreator'),

	//Components
	LeafletMap = require('../utils/LeafletMap.react');

var zipID = 0;

//https://github.com/availabs/transitModeler/blob/master/assets/react/components/modeling/ModelMap.react.js
var ZipCodeMap = React.createClass({
	getDefaultProps: function() {
		return {
			currentZip: '10001'
		}
	},
	processLayers:function() {
		zipID++;
		if(Object.keys(this.props.geo).length == 0) {
			//console.log("not done loading.")
			return {
				zipLayer: {
					id: zipID,
					geo: { "type": "FeatureCollection",
	    					"features": []
	     				},
	 				options: {
	 					zoomOnLoad:true
	 				}
 				}
			}
		}
		else {
			return {
					zipLayer: {
						id: zipID,
						geo: this.props.geo, //our geoJSON, from server,
						options: {
							zoomOnLoad:true
						}
				}
			}
		}
	},
	render: function() {
		return (
			<div>
				<LeafletMap layers={this.processLayers()} height="400px" />
			</div>
		);
	}
});

module.exports = ZipCodeMap;
