'use strict';
var React = require('react'),
    
    //--Stores
    ZBPStore = require('../stores/ZBPStore'),

    //-- Components
    TotalsGraph  = require('../components/graphs/TotalsGraph.react'),
    DetailsGraph  = require('../components/graphs/DetailsGraph.react');

var SamplePage = React.createClass({

    getInitialState: function() {

        return {
            totals:ZBPStore.getTotals(),
            variable:ZBPStore.getVariable(),
            details:ZBPStore.getDetails(),
            zip:ZBPStore.getZip()
        };
               
    },
    componentDidMount: function() {
        ZBPStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        ZBPStore.removeChangeListener(this._onChange);
    },
    _onChange:function(){
        
        this.setState({
            totals:ZBPStore.getTotals(), 
            variable:ZBPStore.getVariable(), 
            details: ZBPStore.getDetails(),
            zip:ZBPStore.getZip()
        });
       
    },
    render: function() {
    
        return (
        	<div className="content container">
            	<h2 className="page-title">Dashboard <small>Statistics and more</small></h2>
                <div className="row">
                	<div className="col-lg-12">
                        <section className="widget">
                            <header>
                            <h4>
                                Total Salary&nbsp;
                                <small>
                                    By Year for zipcode {this.state.zip}
                                </small>
                            </h4>
                        </header>
                            <div className="body no-margin">
                                <TotalsGraph 
                                    totalData={this.state.totals} 
                                    variable={this.state.variable} 
                                    zip={this.state.zip}
                                    height="500" />
                            </div>
                        </section>
                    </div>
                    
                    <div className="col-lg-12">
                        <section className="widget">
                            <header>
                            <h4>
                                Employment Details&nbsp;
                                <small>
                                    By Year for zipcode {this.state.zip}
                                </small>
                            </h4>
                        </header>
                            <div className="body no-margin">
                                <DetailsGraph
                                    detailsData={this.state.details}
                                    zip={this.state.zip}
                                    height="500" />
                            </div>
                        </section>
                    </div>
                </div>
        	</div>
        );
    }
});

module.exports = SamplePage;
