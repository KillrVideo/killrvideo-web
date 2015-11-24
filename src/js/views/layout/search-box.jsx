import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import validate from 'validate.js';

class SearchBox extends Component {
  render() {
    const { fields: { query }, suggestions, handleSubmit } = this.props;
    
    return (
      <form id="search-box" autoComplete="off" className="navbar-form navbar-left" role="search" method="GET" action="/search/results" 
            onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="input-group-btn">
            <button className="btn btn-default" type="submit">
              <span className="glyphicon glyphicon-search" title="Search"></span><span className="hidden">Search</span>
            </button>
          </span>
          <input type="text" {...query} className="form-control" name="query" 
                 placeholder="Search" list="navbar-search-suggestions" />
          <datalist id="navbar-search-suggestions">
            {suggestions.map((s, idx) => <option value={s} key={s}></option>)}
          </datalist>
        </div>
      </form>
    );
  }
}

SearchBox.propTypes = {
  // Provided by redux-form
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  // Other
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired
};

const searchConstraints = {
  query: { presence: true }
};

function mapStateToProps(state) {
  return { suggestions: state.search.searchBox.suggestions };
}

// Apply form component
export default reduxForm({
  form: 'search',
  fields: [ 'query' ],
  validate: vals => { return validate(vals, searchConstraints) || {}; }
}, mapStateToProps)(SearchBox);
