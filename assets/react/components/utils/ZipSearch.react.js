var React = require('react'),
	
	//-- Actions
	ClientActionsCreator = require('../../actions/ClientActionsCreator'),
	//-- Components
	Select2 = require('./Select2.react');

var ZipSearch = React.createClass({
	 getInitialState: function() {
      return {
      	currentZip: this.props.currentZip
      };
    },

    handleChange: function(e) {
      this.setState({currentZip: e.target.value});
    },

	_newZip:function(e){

		//console.log();
		if(this.props.zips.indexOf(this.state.currentZip) >= 0){
			console.log('Legit Zip Code, sending to dispatch');
			console.log(this.state.currentZip);
			ClientActionsCreator.setCurrentZipcode([this.state.currentZip]); //send as array bc that's how everything, including the API, wants it.
		}else{
			console.log('Sorry Not a Zip Code')
			swal({
				title: "Invalid Zip Code!",
				text: "Please try again.",
				type: "warning",
				showCancelButton: false,
				allowOutsideClick: true
			});
		}
	
	},

  	render: function() {
  		// var zipList = this.props.zips.map(function(zip){
  		// 	return {
  		// 		"id":zip,
  		// 		"text":zip
  		// 	}
  		// });
  		var style = {marginBottom:0};
  		var currentZip = this.props.currentZip
    	return (
	    	<div className="form-group" style={style}>
                <div className="input-group input-group">
		        	<input
		                  id="routeSelector"
		                  className="form-control"
		                  type="text"
		                  ref="zipInput"
		                  value={this.state.currentZip} 
		                  onChange={this.handleChange} />

		   			<div className="input-group-btn">
                        <button type="button" className="btn btn-warning" onClick={this._newZip}><i className="fa fa-plus"></i></button>
                    </div>
                </div>
            </div>
	    );
  	}
});

module.exports = ZipSearch;