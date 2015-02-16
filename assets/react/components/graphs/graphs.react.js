'use strict';
var React = require('react');
var ZBPStore = require('../../stores/ZBPStore');
var nv = require('../../../../node_modules/nvd3/nv.d3');
var d3 = require('../../../../node_modules/d3/d3');

var drawDetailGraph = function(details, zip) {
    if(details == {}) {
        return "";
    }
    else {
        nv.addGraph(function() {
            var chart = nv.models.multiBarChart()
                .margin({left:100})
                .transitionDuration(350)
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                .staggerLabels(false)
                .showXAxis(true)
                .showYAxis(true)
                .groupSpacing(0.1)
                .showControls(true)
                ;

            chart.xAxis
                .axisLabel('Year');

            chart.yAxis
                .axisLabel('Employees');

            d3.select('#detailsGraph')
                .datum(parseDetailData(details, zip))
                .call(chart);

            nv.utils.windowResize(chart.update);

            return chart;
        });
    }
};

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

            d3.select('#totalGraph')
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

var parseDetailData = function(data, zip) {
    var toRet = [],
        sizes = ["Establishments with 1 to 4 employees","Establishments with 5 to 9 employees","Establishments with 10 to 19 employees","Establishments with 20 to 49 employees","Establishments with 50 to 99 employees","Establishments with 100 to 249 employees","Establishments with 250 to 499 employees","Establishments with 500 to 999 employees","Establishments with 1,000 employees or more"],
        sizesKeys = ["1-4","5-9","10-19","20-49","50-99","100-249","250-499","500-999","1000+"];

    /*
        First go through each
        Each employment size in sizes is a stream/has an indiv key.
    */
        
    //not a lot of error checking, for example: if there is only one year, or if there are multiple zip codes.

    for(var size in sizes) { 
        var vals = [];
        for(var yr in data) {
            vals.push({"x": yr, "y": data[yr][zip][sizesKeys[size]]});
        }
        toRet.push({
            values: vals,
            key: sizes[size]
        });
    }

    return toRet;
};  

var Graph = React.createClass({

    getInitialState: function() {

        return {
            //zipcodeList:ZBPStore.getList()
            totals:ZBPStore.getTotals(),
            variable:ZBPStore.getVariable(),
            details:ZBPStore.getDetails(),
            zip:ZBPStore.getZip()
        };
               
    },

    componentDidMount: function() {
        ZBPStore.addChangeListener(this._onChange);
        d3.select('body').append('svg')
            .attr("height", "500px")
            .attr("id",'totalGraph');
        
        d3.select('body').append('svg')
            .attr('height', '500px')
            .attr('id', 'detailsGraph');
    },

    componentWillUnmount: function() {
        ZBPStore.removeChangeListener(this._onChange);
    },

    _onChange:function(){
        //this.setState({zipcodeList:ZBPStore.getList()})
        this.setState({totals:ZBPStore.getTotals(), variable:ZBPStore.getVariable(), details: ZBPStore.getDetails(), zip:ZBPStore.getZip()});
       
    },
    _renderTotals:function(){
        return (
            <div>{this.state.zip}</div>
        )
    },
    render: function() {
        if(this.state.variable && this.state.totals && this.state.details){
          drawTotalGraph(this.state.variable, this.state.totals, this.state.zip);
          drawDetailGraph(this.state.details, this.state.zip);
        }
        return (
        	<div className="content container">
                {this._renderTotals()}

        	</div>
        );
    }
});

module.exports = Graph;
