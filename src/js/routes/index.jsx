import React from 'react';
import { IndexRoute, Route } from 'react-router';
import * as Views from 'views';

export default (
  <Route path="/" component={Views.Layout}>
    <IndexRoute component={Views.Home} />
    <Route path="/account/signin" component={Views.Account.SignIn} />
    <Route path="/account/register" component={Views.Account.Register} />
    <Route path="/search/results" component={Views.Search.Results} />
    <Route path="/view/:videoId" component={Views.Videos.View} />
  </Route>
);