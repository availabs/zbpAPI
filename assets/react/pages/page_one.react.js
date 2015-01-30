var React = require('react'),

    //-- Components
    Graph  = require('../components/graphs/annual_payroll_total_graph.react');

var SamplePage = React.createClass({

  render: function() {
    
    return (
    	<div className="content container">
        	<h2 className="page-title">Dashboard <small>Statistics and more</small></h2>
            <div className="row">
            	<div className="col-lg-12">
                    <section className="widget">
                        <div className="body no-margin">
                            <Graph />
                            
                        </div>
                    </section>
                    
                </div>
            </div>
    	</div>
    );
  }
});

module.exports = SamplePage;
