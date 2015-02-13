'use strict';
var React = require('react');
var ZBPStore = require('../../stores/ZBPStore');
var nv = require('../../../../node_modules/nvd3/nv.d3');
var d3 = require('../../../../node_modules/d3/d3');

var drawDetailGraph = function(details) {}

var drawTotalGraph = function(variable, totals) {
    if(totals == {}) { //!totals doesn't work for some reason?
        return "";
    }
    else {
        nv.addGraph(function() {
            /*var chart = nv.models.lineChart()
                .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
                .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                .transitionDuration(350)  //how fast do you want the lines to transition?
                .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                .showYAxis(true)        //Show the y-axis
                .showXAxis(true)   
                ;*/

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
                .color(['#FFCC00'])
                ;

            chart.xAxis
                .axisLabel('Year');

            chart.yAxis
                .axisLabel(fixVarName(variable));

            d3.select('#totalGraph')
                .datum(parseTotalData(totals))
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

var parseTotalData = function(data) {
    var toRet = [],
        tempObj = {};
    /*
        toRet is an array of objects.
        Each object is 
        {
            values: [{"x": yr, "y": data[yr][zip]}, ... ],
            key: some zijp
        },
        {
            ...
        }
    */
    if(typeof data[Object.keys(data)[0]] == "object") { //If we have more than one year. Should only be this case for drawing a line chart.
        /*
            To make this easier (lose some efficiency), I first just make an object w/ zip as key and array of {x:yr, y:zip} objs as value.
        */
        for(var yr in data) {
            for(var zip in data[yr]) {
                if(!tempObj[zip]) {
                    tempObj[zip] = [];
                }
                tempObj[zip].push({"x": yr, "y": data[yr][zip]});
            }

        }
        for(var zip in tempObj) {
            toRet.push({
                values: tempObj[zip],
                key: zip,
                color: '#0000ff'
            })
        }

    }
    else { //shouldn't happen w/ line chart demo.
        console.log("Data != object! or something.")
    }
    return toRet;
};

var Graph = React.createClass({

    getInitialState: function() {

        return {
            //zipcodeList:ZBPStore.getList()
            totals:ZBPStore.getTotals(),
            variable:ZBPStore.getVariable()
        };
               
    },

    componentDidMount: function() {
        ZBPStore.addChangeListener(this._onChange);
        d3.select('body').append('svg')
            .attr("height", "500px")
            .attr("id",'totalGraph');
        
    },

    componentWillUnmount: function() {
        ZBPStore.removeChangeListener(this._onChange);
    },

    _onChange:function(){
        //this.setState({zipcodeList:ZBPStore.getList()})
        this.setState({totals:ZBPStore.getTotals(), variable:ZBPStore.getVariable()});
       
    },
    _renderTotals:function(){
        return (
            <div>{this.state.variable}</div>
        )
    },
    render: function() {
        if(this.state.variable && this.state.totals){
          drawTotalGraph(this.state.variable, this.state.totals)
        }
        return (
        	<div className="content container">
            	Hello World
                {this._renderTotals()}
        	</div>
        );
    }
});

module.exports = Graph;
