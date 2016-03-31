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
    FipsAnalysis = require('./fips_analysis.react'),
    ZipCodeMap = require('../components/maps/ZipCodeMap.react');

var CombinedAreaAnalysis = React.createClass({
	getInitialState: function() {
		return {
			code: ZBPStore.getFips("combinedArea")
		};
	},
	
	componentDidMount: function(){
		ZBPStore.addChangeListener(this._onChange);
	},

	componentWillUnmount: function(){
		ZBPStore.removeChangeListener(this._onChange);
	},

	_onChange: function() {
		/*this.setState({
			code: ZBPStore.getFips("combinedArea")
		});*/
	},
	render: function() {
		return (
			<div className="content container">
				<h2 className="page-title">Combined Statistical Area Analysis <small>Business Statistics, Analyzed by Combined Statistical Area</small></h2>
				<FipsAnalysis type="combinedArea" code={this.state.code} />
			</div>
			
		);
	}
});
module.exports = CombinedAreaAnalysis;
