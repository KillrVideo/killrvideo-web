var React = require('react');

class SearchResults extends React.Component {
  render() {
    return (
      <div>
        Search Results for {this.props.location.query.query}
      </div>
    );
  }
}

export default SearchResults;