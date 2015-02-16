'use strict';
var React = require('react');
var nv = require('../../../../node_modules/nvd3/nv.d3');
var d3 = require('../../../../node_modules/d3/d3');



var drawTotalGraph = function(variable, totals, zip) {
    if(totals == {}) { //!totals doesn't work for some reason?
        return "";
    }
    else {
        nv.addGraph(function() {
            var chart = nv.models.discreteBarChart()
                .margin({left: 100})
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                .staggerLabels(false) //try for now
                .tooltips(true) //might take out, it displays way above the chart for some reason.
                .showValues(false)
                .transitionDuration(350)
                .showXAxis(true)
                .showYAxis(true)
                .color(['#006699'])
                ;

            chart.xAxis
                .axisLabel('Year');

            chart.yAxis
                .axisLabel(fixVarName(variable));

            d3.select('#totalsGraph')
                .datum(parseTotalData(totals, zip))
                .call(chart);

            nv.utils.windowResize(chart.update);

            return chart;
        });
    }
};

var fixVarName = function(varName) {
    switch(varName) {
        case 'annual_payroll':
            return 'Total Annual Payroll (thousands of dollars)'; break;
        case 'q1_payroll':
            return 'Total First Quarter Payroll (thousands of dollars)'; break;
        case 'employees':
            return 'Total mid-March employees'; break;
        case 'establishments': 
            return 'Total number of establishments'; break;
    }
}

var parseTotalData = function(data, zip) {
    var toRet = [],
        vals = [];
    /*
        toRet is an array of objects.
        Each object is 
        {
            values: [{"x": yr, "y": data[yr][zip]}, ... ],
            key: some zip
        },
        {
            ...
        }
    */
    if(typeof data[Object.keys(data)[0]] == "object") { //If we have more than one year. Should always be the case.
        for(var yr in data) {
            vals.push({"x": yr, "y": data[yr][zip]});
        }
        toRet.push({
            values: vals,
            key: zip
        });

    }
    else { //shouldn't happen w/ line chart demo.
        console.log("Data != object! or something.")
    }
    return toRet;
};


var Graph = React.createClass({

    getDefaultProps:function(){
        return {
            height:500
        }
    },
    render: function() {
        if(this.props.variable && this.props.totalData){
          drawTotalGraph(this.props.variable, this.props.totalData, this.props.zip);
        }
        return (
        	<div>
                <svg height={this.props.height} id="totalsGraph" />
        	</div>
        );
    }
});

module.exports = Graph;
