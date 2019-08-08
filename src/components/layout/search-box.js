import React from 'react';
import { connect } from 'react-redux';

import Icon from '../shared/icon';

class SearchBoxContainer extends React.Component {
  render() {

    return (
      <form id="search-box" autoComplete="off" className="navbar-form navbar-left" role="search" method="GET" action="/search/results" 
            onSubmit={this.props.handleSearchSubmit}>
        <div className="input-group">
          <span className="input-group-btn">
            <button className="btn btn-default" type="submit">
              <Icon name="search" title="Search" />
            </button>
          </span>
          <input type="text" onChange={e => this.props.handleSearchChange(e)} className="form-control" name="query"
                 placeholder="Search" list="navbar-search-suggestions" />
          <datalist id="navbar-search-suggestions">
            {/*{this.props.suggestions.map((s, idx) => <option value={s} key={s}></option>)}*/}
          </datalist>
        </div>
      </form>
    );
  }
}

function mapStateToProps(state) {
    return {
        suggestions: state.VideoReducer.suggestions,
        fields: state.VideoReducer.fields,
    };
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        handleSearchSubmit: () => {

        },
        handleSearchChange: () => {

        }
    }
}

const SearchBox = connect(
    mapStateToProps,
    mapDispatchToProps
)(SearchBoxContainer);

export default SearchBox