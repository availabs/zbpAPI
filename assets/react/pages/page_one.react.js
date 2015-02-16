'use strict';
var React = require('react'),
    
    //--Stores
    ZBPStore = require('../stores/ZBPStore'),

    //-- Components
    TotalsGraph  = require('../components/graphs/TotalsGraph.react'),
    DetailsGraph  = require('../components/graphs/DetailsGraph.react');

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

var SamplePage = React.createClass({

    getInitialState: function() {

        return {
            totals:ZBPStore.getTotals(),
            variable:ZBPStore.getVariable(),
            details:ZBPStore.getDetails(),
            zip:ZBPStore.getZip(),
            naics:ZBPStore.getNaics() //Is this needed for anything beyond displaying to the user?
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
            apTotals:ZBPStore.getTotals('annual_payroll'),
            q1Totals:ZBPStore.getTotals('q1_payroll'),
            empTotals:ZBPStore.getTotals('employees'), 
            estTotals:ZBPStore.getTotals('establishments'),
            variable:ZBPStore.getVariable(), 
            details: ZBPStore.getDetails(),
            zip:ZBPStore.getZip(),
            naics:ZBPStore.getNaics()
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
                                {this.state.variable}&nbsp;
                                <small>
                                    By Year for zipcode {this.state.zip}
                                </small>
                            </h4>
                        </header>
                            <div className="body no-margin">
                                <TotalsGraph 
                                    totalData={this.state.totals} 
                                    variable='emplo' 
                                    zip={this.state.zip}
                                    height="500" />
                            </div>
                        </section>
                    </div>
                    
                    <div className="col-lg-12">
                        <section className="widget">
                            <header>
                            <h4>
                                Establishments for Naics Code {this.state.naics}&nbsp;
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
