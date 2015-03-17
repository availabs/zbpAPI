'use strict';
var React = require('react');
var nv = require('../../../../node_modules/nvd3/nv.d3');
var d3 = require('../../../../node_modules/d3/d3');

var drawDetailGraph = function(details, zip) {
    if(details == {}) {
        //console.log("drawDetailGraph received empty data");
        return "";
    }
    else {
        nv.addGraph(function() {
            /*var chart = nv.models.multiBarChart()
                .margin({left:100})
                .transitionDuration(350)
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                .staggerLabels(false)
                .tooltips(false)
                .showXAxis(true)
                .showYAxis(true)
                .groupSpacing(0.1)
                .showControls(true)
                ;*/
            var chart = nv.models.lineChart()
                .margin({left:60})
                .useInteractiveGuideline(true)
                .transitionDuration(350)
                .showLegend(false)
                .showYAxis(true)
                .showXAxis(true)
            ;

            chart.xAxis
                .axisLabel('Year')
                .tickValues(Object.keys(details));

            chart.yAxis
                .axisLabel('Estimated Number of Employees');

            d3.select('#detailsGraph')
                .datum(parseDetailData(details, zip))
                .call(chart);

            nv.utils.windowResize(chart.update);

            return chart;
        });
    }
};

var avg2 = function(num1,num2) {
    return (num1+ num2) / 2;
};

var parseDetailData = function(data, zip) {
    //console.log("data that parseDetail is getting", data);
    var vals = [],
        sizes = ["Establishments with 1 to 4 employees","Establishments with 5 to 9 employees","Establishments with 10 to 19 employees","Establishments with 20 to 49 employees","Establishments with 50 to 99 employees","Establishments with 100 to 249 employees","Establishments with 250 to 499 employees","Establishments with 500 to 999 employees","Establishments with 1,000 employees or more"],
        sizesKeys = ["1-4","5-9","10-19","20-49","50-99","100-249","250-499","500-999","1000+"],
        sizeVals = [avg2(1,4) , avg2(5, 9), avg2(10, 19), avg2(20, 49), avg2(50, 99), avg2(100, 249), avg2(250, 499), avg2(500, 999), 13700];

    /*
        First go through each
        Each employment size in sizes is a stream/has an indiv key.
        MAKE A LINE GRAPH.
    */
    

    //Need more error checking? or not, since I dictate what I send to this,
    //console.log("Detail's zip", zip, "for data", data);
    //console.log(data)
    for(var yr in data) {
        if(data[yr][zip] != 0 && !data[yr][zip])
            return "";
        var sum = 0;
        for(var k in data[yr][zip]) {
            if(k == "total")
                continue;
            sum += parseInt(data[yr][zip][k]) * sizeVals[sizesKeys.indexOf(k)];
        }
        vals.push({x: parseInt(yr), y: Math.round(sum)});
    }
    /*for(var size in sizes) { 
        var vals = [];
        for(var yr in data) {
            if(data[yr][zip] != 0 && !data[yr][zip])
                return ""; //does this if the data isn't loaded yet, so the data is still for the old zip code.
            vals.push({"x": parseInt(yr), "y": parseInt(data[yr][zip][sizesKeys[size]])});
        }
        /*if(vals.length == 1){
            console.log("one yr of data")
            vals.push({});
        }
        toRet.push({
            values: vals,
            key: sizes[size]
        });
    }
*/ 
    return [{"values": vals}];
};  

var Graph = React.createClass({

    getDefaultProps: function() {
        return {
            height: 500
        }
    },
    render: function() {
        if(this.props.zip.constructor === Array) {
            //console.log("zip is array!")
            this.props.zip = this.props.zip[0];
        }
        try {
            if(this.props.zip && Object.keys(this.props.detailsData).length > 0 && Object.keys(this.props.detailsData[Object.keys(this.props.detailsData)[0]])[0] == this.props.zip) {
                //This makes sure that the data has caught up to the new zip code.
                //Issue: what if data for "1994" doesn't exist in this instance of detailsdata?
                drawDetailGraph(this.props.detailsData, this.props.zip);
            }
        }
        catch(err) {
            console.log(this.props.detailsData);
            //console.log(err);
        }
        return (
        	<div>
                <svg height={this.props.height} id="detailsGraph" />
            </div>
        );
    }
});

module.exports = Graph;
