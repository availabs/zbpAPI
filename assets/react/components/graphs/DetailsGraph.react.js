'use strict';
var React = require('react');
var nv = require('../../../../node_modules/nvd3/nv.d3');
var d3 = require('../../../../node_modules/d3/d3');

var drawDetailGraph = function(details, zip) {
    if(details == {}) {
        console.log("drawDetailGraph received empty data");
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
                .tooltips(false)
                .showXAxis(true)
                .showYAxis(true)
                .groupSpacing(0.1)
                .showControls(true)
                ;

            chart.xAxis
                .axisLabel('Year');

            chart.yAxis
                .axisLabel('Number of Establishments');

            d3.select('#detailsGraph')
                .datum(parseDetailData(details, zip))
                .call(chart);

            nv.utils.windowResize(chart.update);

            return chart;
        });
    }
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

    getDefaultProps: function() {
        return {
            height: 500
        }
    },
    render: function() {
        if(Object.keys(this.props.detailsData).length > 0 && this.props.zip) {

            drawDetailGraph(this.props.detailsData, this.props.zip);
        }
        return (
        	<div>
                <svg height={this.props.height} id="detailsGraph" />
            </div>
        );
    }
});

module.exports = Graph;
