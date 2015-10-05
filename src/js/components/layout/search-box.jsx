const React = require('react');
const _ = require('lodash');

class SearchBox extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      suggestions: []
    };
  }
  
  handleQueryChange(e) {
    // TODO: Search suggestions
  }
  
  componentDidMount() {
    // Use debounce to trigger search suggestions only after the user has stopped typing for 1 second
    this.handleQueryChange = _.debounce(this.handleQueryChange, 1000);
  }
    
  render() {
    return (
      <form id="search-box" autoComplete="off" className="navbar-form navbar-left" role="search" method="GET" action="/search/results">
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