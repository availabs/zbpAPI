var React = require('react'),
	
	//-- Actions
	ClientActionsCreator = require('../../actions/ClientActionsCreator'),
	//-- Components
	Select2 = require('./Select2.react'),
	NaicsKey = require('./NaicsKey');

var NaicsSearch = React.createClass({
	 getInitialState: function() {
      return {
      	currentNaics: this.props.currentNaics
      };
    },

    handleChange: function(e) {
      this.setState({currentNaics: e.target.value});
    },

	_newNaics:function(e){

		if(this.props.naicsList.indexOf(this.state.currentNaics) >= 0) {
			ClientActionsCreator.setCurrentNaics(this.state.currentNaics);
		}
		else if(this.props.naicsList.indexOf(this.state.currentNaics + "----") >= 0) {
			ClientActionsCreator.setCurrentNaics(this.state.currentNaics + "----"); //if the naics is 2 digit
		}
		else if(this.props.naicsList.indexOf(this.state.currentNaics + "--") >= 0) {
			ClientActionsCreator.setCurrentNaics(this.state.currentNaics + "--"); //if the naics is 2 digit
		}
		else {
			swal({
				title: "Invalid NAICS Code!",
				text: "Please try again.",
				type: "warning",
				showCancelButton: false,
				allowOutsideClick: true
			});
		}
		
	
	},
	//{'11': "Agriculture, forestry, fishing and hunting", "21": "Mining, quarrying, and oil and gas extraction", "22": "Utilities", "23": "Construction", "42": "Wholesale trade", "51": "Information", "52": "Finance and insurance", "53": "Real estate and rental and leasing", "54": "Professional, scientific, and technical services", "55": "Management of companies and enterprises", "56": "Administrative and support and waste management and remediation services", "61": "Educational services", "62": "Health care and social assistance", "71": "Arts, entertainment, and recreation", "72": "Accommodation and food services", "81": "Other services (except public administration)", "99": "Industries not classified", "--": "Total for all sectors"}
  	render: function() {
  		
  		//console.log(this.state.currentNaics);
  		// var zipList = this.props.zips.map(function(zip){
  		// 	return {
  		// 		"id":zip,
  		// 		"text":zip
  		// 	}
  		// });
		var naicsList = this.props.naicsList.map(function(naics) {
			return {
				"id": naics,
				"text": naics + NaicsKey[naics] && NaicsKey[naics].title ? ": " + NaicsKey[naics].title : ""
			}
		});
  		var style = {marginBottom:0};

    	return (

        	<select className="form-control select2-select" id="naicsSearch" onChange={this.handleChange}>
     			<option value="72" selected="selected">{"72: " + NaicsKey["72"].title}</option>
        	</select>

	    );
  	}
});

module.exports = NaicsSearch;
