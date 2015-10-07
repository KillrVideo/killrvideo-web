const React = require('react');
const _ = require('lodash');

const history = require('../../history');

class SearchBox extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      query: '',
      suggestions: []
    };
  }
  
  handleSearch(e) {
    // Go to search results
    e.preventDefault();
    history.pushState(null, '/search/results', { query: this.state.query });
  }
  
  handleQueryChange(e) {
    // TODO: Search suggestions (using debounce?)
    this.setState({ query: e.target.value });
  }
    
  render() {
    return (
      <form id="search-box" autoComplete="off" className="navbar-form navbar-left" role="search" method="GET" action="/search/results" 
            onSubmit={e => this.handleSearch(e)}>
        <div className="input-group">
          <span className="input-group-btn">
            <button className="btn btn-default" type="submit">
              <span className="glyphicon glyphicon-search" title="Search"></span><span className="hidden">Search</span>
            </button>
          </span>
          <input type="text" className="form-control" name="query" placeholder="Search"
                 list="navbar-search-suggestions" onChange={e => this.handleQueryChange(e)} />
          <datalist id="navbar-search-suggestions">
            {this.state.suggestions.map( s => <option>{s}</option> )}
          </datalist>
        </div>
      </form>
    );
  }
}

export default SearchBox;