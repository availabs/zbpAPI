'use strict';
var React = require('react');
var ZBPStore = require('../../stores/ZBPStore');
var nv = require('../../../../node_modules/nvd3/nv.d3');
var d3 = require('../../../../node_modules/d3/d3');


var drawTotalGraph = function(variable, totals) {
    console.log(nv);
    nv.addGraph(function() {
        var chart = nv.models.multiBarChart()
            .transitionDuration(350)
            .reduceXTicks(true)
            rotateLabels(0)
            .showControls(false)
            .groupSpacing(0.1)
            .stacked(true)
            .showLegend(false)
            ;


        chart.xAxis
            .axisLabel('Year');

        chart.yAxis
            .axisLabel(variable);



        d3.append('#total_chart svg')
            .datum(parseTotalData(totals))
            .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
    });
};

var parseTotalData = function(data) {
    console.log(data);
    var toRet = [];

    if(typeof data[Object.keys(data)[0]] == "object") { //If we have more than one year. Should only be this case for drawing a line chart.
        for(var yr in data) {
            for(var zip in yr) {
                if(!toRet[zip]) {
                    var oneZip = {};
                    oneZip.values = [];
                    oneZip.key = zip;
                    toRet.push(oneZip);
                }
                toRet[zip].values.push({"x": yr, "y": data[yr][zip]});
                //graphData.values.push({series: "s" + i, "x":yr, "y":})
            }
        }
    }
    else { //shouldn't happen w/ line chart demo.
        console.log("You screwed up, Alan.")
    }
    /*for(var i in data) {

    }*/
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
        
    },

    componentWillUnmount: function() {
        ZBPStore.removeChangeListener(this._onChange);
    },

    _onChange:function(){
        //this.setState({zipcodeList:ZBPStore.getList()})
        this.setState({totals:ZBPStore.getTotals(), variable:ZBPStore.getVariable()})
    },

    render: function() {
        return (
        	<div className="content container">
            	Hello World
                {drawTotalGraph(this.state.variable, this.state.totals)}
        	</div>
        );
    }
});

module.exports = Graph;
