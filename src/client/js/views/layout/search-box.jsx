import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { validateForm } from 'lib/validation';

import Icon from 'components/shared/icon';

class SearchBox extends Component {
  handleChange(e) {
    // Let form track the changes to the input then get suggestions
    this.props.fields.query.onChange(e);
    this.props.getSuggestions(e.target.value);
  }
  
  render() {
    const { fields: { query }, suggestions, handleSubmit } = this.props;
    
    return (
      <form id="search-box" autoComplete="off" className="navbar-form navbar-left" role="search" method="GET" action="/search/results" 
            onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="input-group-btn">
            <button className="btn btn-default" type="submit">
              <Icon name="search" title="Search" />
            </button>
          </span>
          <input type="text" {...query} onChange={e => this.handleChange(e)} className="form-control" name="query" 
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
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  
  // Actions
  getSuggestions: PropTypes.func.isRequired
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
  validate: vals => validateForm(vals, searchConstraints)
}, mapStateToProps)(SearchBox);
