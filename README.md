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

## Releasing

Before you can publish a release, you'll need to get a [GitHub access token][4] and make it available to 
`npm` as the config variable `KILLRVIDEO_GITHUB_TOKEN`. You can do this by running:
```
> npm config set KILLRVIDEO_GITHUB_TOKEN <your_token_from_github>
```
Then make sure you set the version (along with a tag in git) by using [`npm version`][5]:
```
> npm version <specific_version | major | minor | patch | prerelease>
```
The `postversion` script in `package.json` will automatically try to push the commit and new tag to GitHub.
Last, create a GitHub release and upload the package's tarball by running the `release` script from `npm`
like this:
```
> npm run release
```

[0]: http://www.killrvideo.com
[1]: https://facebook.github.io/react/index.html
[2]: http://redux.js.org/
[3]: http://netflix.github.io/falcor
[4]: https://github.com/settings/tokens
[5]: https://docs.npmjs.com/cli/version
