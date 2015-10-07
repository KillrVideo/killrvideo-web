const React = require('react');
const App = require('./components/app');

const AppFactory = React.createFactory(App);

// Could pass props here
const app = AppFactory({});

// Render the app
React.render(app, document.getElementById('killrvideo'));