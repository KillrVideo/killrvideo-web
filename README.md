# KillrVideo Web UI

This project is the web front-end (UI) for KillrVideo, a sample web application for developers looking
to learn more about Apache Cassandra and DataStax Enterprise. This is a single page app written in
JavaScript and makes heavy use of [React][1], [Redux][2], and [Falcor][3] (among other libraries).

You can see a live demo of the site at [killrvideo.com][0].

## Developing

All assets for the front-end are built using webpack. After cloning the repo, you'll need to install
all dependencies first:
```
> npm install
```
You can then start a default "developer" task with:
```
> npm start
```
This will clean, do a build with webpack, and watch the files for changes (causing the webpack build
to run when changes are detected).

## Releases

Releases use the [release-it][4] tool to publish releases to GitHub. Before you can publish a release,
you'll need to get a [GitHub access token][5] and make it available to `npm` as the config variable
`KILLRVIDEO_GITHUB_TOKEN`. You can do this by running:
```
> npm config set KILLRVIDEO_GITHUB_TOKEN <your_token_from_github>
```
You can then run the interactive release process by doing this:
```
> npm run release -- --increment <major|minor|patch|premajor|preminor|prepatch>
```


[0]: http://www.killrvideo.com
[1]: https://facebook.github.io/react/index.html
[2]: http://redux.js.org/
[3]: http://netflix.github.io/falcor
[4]: http://webpro.github.io/release-it/
[5]: https://github.com/settings/tokens