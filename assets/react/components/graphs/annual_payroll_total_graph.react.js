'use strict';
var React = require('react');
var ZBPStore = require('../../stores/ZBPStore');
var nv = require('../../../../node_modules/nvd3/nv.d3');
var d3 = require('../../../../node_modules/d3/d3');
console.log(nv);

var drawTotalGraph = function(variable, totals) {
    console.log("totals", totals);
    nv.addGraph(function() {
        var chart = nv.models.lineChart()
            .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
            .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
            .transitionDuration(350)  //how fast do you want the lines to transition?
            .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
            .showYAxis(true)        //Show the y-axis
            .showXAxis(true)   
            ;


        chart.xAxis
            .axisLabel('Year');

        chart.yAxis
            .axisLabel("Total Annual Payroll (thousands of dollars)")
            //.axisLabel(variable); //SHOULD BE THIS, but it needs to be switch-ed into a sexier format, since it comes as annual_payroll.



        d3.select('body').append('svg')
            .datum(parseTotalData(totals))
            .attr("height", "500px")
            .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
    });
};

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
    console.log(data)
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
                //console.log(yr, zip); //I have to be able to seperate these into series.
                /*if(!toRet[zip]) {
                    var oneZip = {};
                    oneZip.values = [];
                    oneZip.key = zip;
                    toRet.push(oneZip);
                }

                console.log(toRet);
                toRet[i].values.push({"x": yr, "y": data[yr][zip]});*/
                
            }

        }
        for(var zip in tempObj) {
            toRet.push({
                values: tempObj[zip],
                key: zip
            })
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
