var React = require('react'),
	
	//-- Actions
	ClientActionsCreator = require('../../actions/ClientActionsCreator');

var FipsSearch = React.createClass({
	 getInitialState: function() {
      return {
      	currentFips: this.props.currentFips,
      	type: this.props.type
      };
    },

    handleChange: function(e) {
      this.setState({
      	currentFips: e.target.value,
      	type: this.props.type
      });
    },

	_newFips:function(e){
		if(this.state.type == 'state') {
			if(this.state.currentFips && this.state.currentFips.length == 2) {
				ClientActionsCreator.setCurrentFips(this.state.type, this.state.currentFips);
			}
			else {
				swal({
					title: "Invalid FIPS Code!",
					text: "Please try again.",
					type: "warning",
					showCancelButton: false,
					allowOutsideClick: true
				});
			}
		}
		else {
			if(this.state.currentFips && this.state.currentFips.length == 5) {
				ClientActionsCreator.setCurrentFips(this.state.type, this.state.currentFips);
			}
			else {
				swal({
					title: "Invalid FIPS Code!",
					text: "Please try again.",
					type: "warning",
					showCancelButton: false,
					allowOutsideClick: true
				});
			}
		}
	},
	//{'11': "Agriculture, forestry, fishing and hunting", "21": "Mining, quarrying, and oil and gas extraction", "22": "Utilities", "23": "Construction", "42": "Wholesale trade", "51": "Information", "52": "Finance and insurance", "53": "Real estate and rental and leasing", "54": "Professional, scientific, and technical services", "55": "Management of companies and enterprises", "56": "Administrative and support and waste management and remediation services", "61": "Educational services", "62": "Health care and social assistance", "71": "Arts, entertainment, and recreation", "72": "Accommodation and food services", "81": "Other services (except public administration)", "99": "Industries not classified", "--": "Total for all sectors"}
  	render: function() {
  		var style = {marginBottom:0};

    	return (
	    	<div className="form-group" style={style}>
                <div className="input-group input-group">
		        	<input
		                  id="fipsSearch"
		                  className="form-control"
		                  type="text"
		                  ref="fipsInput"
		                  value={this.state.currentFips} 
		                  onChange={this.handleChange} 
		                  placeholder="Search by FIPS..."/>

		   			<div className="input-group-btn">
                        <button type="button" className="btn btn-primary" onClick={this._newFips}><i className="fa fa-search"></i></button>
                    </div>
                </div>
            </div>
	    );
  	}
});

module.exports = FipsSearch;
