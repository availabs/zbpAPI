'use strict';
var React = require('react'),
    //--Stores
    ZBPStore = require('../stores/ZBPStore'),

    //-- Components
    TotalsGraph  = require('../components/graphs/TotalsGraph.react'),
    DetailsGraph  = require('../components/graphs/DetailsGraph.react'),
    ZipSearch = require('../components/utils/ZipSearch.react'),
    NaicsSearch = require('../components/utils/NaicsSearch.react'),
    VariableSelect = require('../components/utils/VariableSelect.react'),

    ZipCodeMap = require('../components/maps/ZipCodeMap.react');

var StateAnalysis = React.createClass({
	componentDidMount:function(){

	},
	render: function() {
		return (
			<div className="content container">
				<h2 className="page-title">Urban Area Analysis <small>Business Statistics, Analyzed by Urban Area</small></h2>
			</div>
		);
	}
});
module.exports = StateAnalysis;
