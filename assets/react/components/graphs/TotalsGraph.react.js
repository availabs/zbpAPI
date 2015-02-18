'use strict';
var React = require('react');
var nv = require('../../../../node_modules/nvd3/nv.d3');
var d3 = require('../../../../node_modules/d3/d3');



var drawTotalGraph = function(variable, totals, zip) {
    if(Object.keys(totals).length == 0) { 
        //console.log("Empty totals data", totals, "with variable ", variable)
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
                .axisLabel(fixVarName(variable))
                .axisLabelDistance(-5);

            d3.select('#' + variable)
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
    //console.log("Data that parseTotalData is getting", data);
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
        //console.log("Total's zip", zip, "for data", data);

        for(var yr in data) {
            if(data[yr][zip] != 0 && !data[yr][zip]){ //b/c that data can be 0 sometimes.
                //console.log("Empty graph for", zip, data);
                return ""; //does this if the data isn't loaded yet, so the data is still for the old zip code.
            }
            vals.push({"x": yr, "y": data[yr][zip]});

        }
        toRet.push({
            values: vals,
            key: zip
        });

    }
    else { //shouldn't happen w/ line chart demo.
        console.log("Data != object! or something.");
    }
    //console.log("returning toRet from totals", toRet);
    return toRet;
};


var Graph = React.createClass({

    getDefaultProps:function(){
        return {
            height:500
        }
    },
    render: function() {
        if(this.props.zip.constructor === Array) {
            //console.log("zip is array!")
            this.props.zip = this.props.zip[0];
        }
        if(this.props.variable && Object.keys(this.props.totalData).length > 0 && this.props.zip && Object.keys(this.props.totalData["2000"])[0] == this.props.zip){
            drawTotalGraph(this.props.variable, this.props.totalData, this.props.zip);
            //console.log("curr data for ", this.props.variable, " ", this.props.totalData)
        }
        else if(Object.keys(this.props.totalData).length > 0) {
            //console.log("No current data render side for zip", this.props.zip, "for var", this.props.variable);
        }
        return (
        	<div>
                <svg height={this.props.height} className="graph totals" id={this.props.variable} />
        	</div>
        );
    }
});

module.exports = Graph;
