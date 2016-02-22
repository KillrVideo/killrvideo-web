import React from 'react';
import { Router, IndexRoute, Route, browserHistory } from 'react-router';
import * as Views from 'views';

export default (
  <Router history={browserHistory}>
    <Route path="/" component={Views.Layout}>
      <IndexRoute component={Views.Home} />
      <Route path="/account/signin" component={Views.Account.SignIn} />
      <Route path="/account/signout" component={Views.Account.SignOut} />
      <Route path="/account/register" component={Views.Account.Register} />
      <Route path="/account/info(/:userId)" component={Views.Account.Info} />
      <Route path="/search/results" component={Views.Search.Results} />
      <Route path="/view/:videoId" component={Views.Videos.View} />
      <Route path="/videos/add" component={Views.Videos.Add} />
      <Route path="/chat" component={Views.Chat} wrapperClassName="chat" />
    </Route>
  </Router>
);