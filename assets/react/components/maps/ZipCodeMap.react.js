'use strict';

var React = require('react'),
	ZBPStore = require('../stores/ZBPStore'), //Get the data from here.
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

		return {
			zipLayer: {
				id: zipID,
				geo: ZBPStore.getGeoJSON,//our geoJSON, from server
			}
		}
	}
});
