const React = require('react');
const ReactRouter = require('react-router');
const Router = ReactRouter.Router;
const Route = ReactRouter.Route;
const IndexRoute = ReactRouter.IndexRoute;

// History used by the router
const history = require('../history');

// Components rendered by router
const Layout = require('./layout/layout');
const Views = require('./views');

class App extends React.Component {
  render() {
    return (
      <Router history={history}>
        <Route path="/" component={Layout}>
          <IndexRoute component={Views.Home} />
          <Route path="/account/info(/:userId)" component={Views.Account.Info} />
          <Route path="/account/register" component={Views.Account.Register} />
          <Route path="/account/signin" component={Views.Account.SignIn} />
          <Route path="/sampledata" component={Views.SampleData} />
          <Route path="/search/results" component={Views.Search.Results} />
          <Route path="/videos/add" component={Views.Videos.Add} />
          <Route path="/view/:videoId" component={Views.Videos.View} />
        </Route>
      </Router>
    );
  }
}

export default App;