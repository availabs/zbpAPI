'use strict';
var React = require('react');
var nv = require('../../../../node_modules/nvd3/nv.d3');
var d3 = require('../../../../node_modules/d3/d3');

var drawDetailGraph = function(details, zip) {
    //console.log("Data received", details);
    if(details == {} || !details) {
        console.log("drawDetailGraph received empty data");
        return "";
    }
    else {
        console.log("Details data: ", details);
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
                .useInteractiveGuideline(false)
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
                .datum(zip ? parseDetailData(details, zip) : parseDetailData(details, false))
                .call(chart);

            nv.utils.windowResize(chart.update);

            return chart;
        });
    }
};

var avg2 = function(num1,num2) {
    return (num1+ num2) / 2;
};

var sumArr = function(arr) {
    //return arr.reduce(function(a, b) { return a.y + b.y; }); //y u n owrk
    var sum = 0;
    for(var i in arr) {
        sum += arr[i].y;
    }
    return sum;
};

var parseDetailData = function(data, zip) {
    //console.log("data that parseDetail is getting", data);
    var vals = [],
        sizes = ["Establishments with 1 to 4 employees","Establishments with 5 to 9 employees","Establishments with 10 to 19 employees","Establishments with 20 to 49 employees","Establishments with 50 to 99 employees","Establishments with 100 to 249 employees","Establishments with 250 to 499 employees","Establishments with 500 to 999 employees","Establishments with 1,000 employees or more"],
        sizesKeys = ["1-4","5-9","10-19","20-49","50-99","100-249","250-499","500-999","1000+"],
        sizeVals = [avg2(1,4) , avg2(5, 9), avg2(10, 19), avg2(20, 49), avg2(50, 99), avg2(100, 249), avg2(250, 499), avg2(500, 999), 13700];
    console.log("In parse", zip, data);
    if(zip) {
        console.log("details zips ");
        var tempObj = {}; //temp object for easier data processing
        for(var yr in data) {
            if(data[yr][zip] != 0 && !data[yr][zip])
                return "";

            for(var n in data[yr][zip]) { 
                var sum = 0;
                if(!tempObj[n])
                    tempObj[n] = [];
                for(var k in data[yr][zip][n]) {
                    if(k == "total")
                        continue;
                    sum += parseInt(data[yr][zip][n][k]) * sizeVals[sizesKeys.indexOf(k)];
                }
                tempObj[n].push({x: parseInt(yr), y: Math.round(sum)});
            }
            
        }
        /*
            Sort by #emps, take top 10 
        */
        for(var naics in tempObj) {
            vals.push({
                values: tempObj[naics],
                key: naics
            });
        }
    }
    else { //if we're dealing with fips data.
        console.log("details fips ");
        var tempObj = {};
        for(var yr in data) {
            if(!tempObj[yr])
                tempObj[yr] = {};
            for(var z in data[yr]) {
                for(var n in data[yr][z]) {
                    if(!tempObj[yr][n])
                        tempObj[yr][n] = 0; //the sum
                    for(var k in data[yr][z][n]) {
                        if(k == "total") 
                            continue;
                        tempObj[yr][n] += parseInt(data[yr][z][n][k]) * sizeVals[sizesKeys.indexOf(k)];
                    }
                }
            }
        }
        var tempObjT = {};
        for(var yr in tempObj) {
            for(var n in tempObj[yr]) {
                if(!tempObjT[n])
                    tempObjT[n] = [];
                tempObjT[n].push({x: parseInt(yr), y: Math.round(tempObj[yr][n])});
            }
        }
        for(var naics in tempObjT) {
            vals.push({
                values: tempObjT[naics],
                key: naics
            });
        }
    }
    if(vals.length > 15) { //If a lot, show top 19?
        vals.sort(function(a, b) {
            var sumA = sumArr(a.values);
            var sumB = sumArr(b.values);
            if(a.key == '----' || a.key == '------') return 1; //bc don't want totals
            if(b.key == '----' || b.key == '------') return -1;
            return sumB-sumA;
        });
        return vals.slice(0, 10);
    }
    return vals;
};  

var Graph = React.createClass({

    getDefaultProps: function() {
        return {
            height: 500
        }
    },
    render: function() {
        // console.log("In render", this.props.zip, this.props.detailsdata)
        if(this.props.zip){
            if(this.props.zip.constructor === Array) {
                //console.log("zip is array!")
                this.props.zip = this.props.zip[0];
            }
            try { // b/c sometimes the data is derp.
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
        }
        else {
            drawDetailGraph(this.props.detailsData, false);
        }
        return (
        	<div>
                <svg height={this.props.height} id="detailsGraph" />
            </div>
        );
    }
});

module.exports = Graph;
