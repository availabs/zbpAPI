'use strict';
var React = require('react'),
    //--Stores
    ZBPStore = require('../stores/ZBPStore'),

    //-- Components
    TotalsGraph  = require('../components/graphs/TotalsGraph.react'),
    DetailsGraph  = require('../components/graphs/DetailsGraph.react'),
    ZipSearch = require('../components/utils/ZipSearch.react'),
    NaicsSearch = require('../components/utils/NaicsSearch.react'),
    VariableSelect = require('../components/utils/VariableSelect.react');

var fixVarName = function(varName) {
    switch(varName) {
        case 'annual_payroll':
            return 'Total Annual Payroll (thousands of dollars)'; break;
        case 'q1_payroll':
            return 'Total First Quarter Payroll (thousands of dollars)'; break;
        case 'employees':
            return 'Total Mid-March Employees'; break;
        case 'establishments': 
            return 'Total Number of Establishments'; break;
    }
}

var SamplePage = React.createClass({

    getInitialState: function() {

        return {
            zipList: ZBPStore.getZipList(),
            naicsList: ZBPStore.getNaicsList(),
            totals:ZBPStore.getTotals(),
            variable:ZBPStore.getVariable(),
            details:ZBPStore.getDetails(),
            zip:ZBPStore.getZip(),
            naics:ZBPStore.getNaics(), //Is this needed for anything beyond displaying to the user?,
            chosenVariable: ZBPStore.getChosenVariable()
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
            zipList: ZBPStore.getZipList(),
            naicsList: ZBPStore.getNaicsList(),
            totals:ZBPStore.getTotals(),
            variable:ZBPStore.getVariable(), 
            details: ZBPStore.getDetails(),
            zip:ZBPStore.getZip(),
            naics:ZBPStore.getNaics(),
            chosenVariable: ZBPStore.getChosenVariable()
        });
       
    },
    render: function() {
        return (
        	<div className="content container">
            	<h2 className="page-title">Dashboard <small>Statistics and more</small></h2>
                <div className="row">
                    <div className="col-lg-8">
                        <section className="widget">
                          <ZipSearch zips={this.state.zipList} currentZip={this.state.zip} />
                        </section>
                    </div>
                    <div className="col-lg-4">
                        <section className="widget">
                          <VariableSelect currentVariable = {this.state.chosenVariable} />
                        </section>
                    </div>
                </div>
                <div className="row">
                	<div className="col-lg-12">
                        <section className="widget">
                            <header>
                            <h4>
                                {fixVarName(this.state.chosenVariable)}&nbsp;
                                <small>
                                    By Year for zipcode {this.state.zip}
                                </small>
                            </h4>
                        </header>
                            <div className="body no-margin">
                                <TotalsGraph 
                                    totalData={this.state.totals[this.state.chosenVariable]} 
                                    variable={this.state.chosenVariable} 
                                    zip={this.state.zip}
                                    height="500" />
                            </div>
                        </section>
                    </div>
                    
                    <div className="col-lg-12">
                        <section className="widget">
                            <NaicsSearch naicsList={this.state.naicsList} currentNaics={this.state.naics} />
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


                     <div className="col-lg-12">
                        <section className="widget">
                            <header>
                            <h4>
                                Establishments for Naics Code {this.state.naics}&nbsp;
                                <small>
                                    Map of zipcode {this.state.zip}
                                </small>
                            </h4>
                        </header>
                            <div className="body no-margin">
                                <ZipCodeMap 
                                zipcodes={this.state.zipGeo}/>
                            </div>
                        </section>
                    </div>
                </div>
        	</div>
        );
    }
});

module.exports = SamplePage;
