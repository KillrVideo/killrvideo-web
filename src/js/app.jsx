var React = require('react');

var App = React.createClass({
  render: function() {
    return (
      <h1>Welcome to KillrVideo</h1>
    )
  }
});

// Render the app
React.render(<App/>, document.getElementById('killrvideo'));