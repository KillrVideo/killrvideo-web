# KillrVideo Web UI

[![Build Status](https://travis-ci.org/KillrVideo/killrvideo-web.svg?branch=master)](https://travis-ci.org/KillrVideo/killrvideo-web)

This project is the web front-end (UI) for KillrVideo, a sample web application for developers looking
to learn more about Apache Cassandra and DataStax Enterprise. This project contains:
- A single page app that runs in the browser and makes heavy use of:
  - [React][1]
  - [Redux][2]
  - [Falcor][3]
- A web server that makes heavy use of:
  - [Express][4]
  - [Falcor Router][3]
  - [Grpc][5]
  
The web server calls out to backend services using Grpc. Those backend services are provided in separate
repos, for example the [C# implementation][6], [Java implementation][7] or [node.js implementation][8].

## Setting up a Development Environment

All assets for the front-end are built using webpack and the backend is all transpiled with 
babel. After cloning the repo, you'll need to pull images, install all dependencies and build code:
```
> # Prepare images
> docker-compose pull
> docker-compose build
> 
> # Install dependencies & build code for the server & client parts
> docker-compose run --no-deps -e NODE_ENV=development web npm install
> docker-compose run --no-deps -e NODE_ENV=development web npm run install:client
> docker-compose run --no-deps web npm run build
>
> # Run the project
> docker-compose up -d
```

## Developing

There is a developer task included in the `package.json` scripts. You can run this task with:
```
> npm run watch
```
This will clean, do a build with webpack and babel, and watch the files for changes. If using
VS Code for development, the tasks checked into the repo should allow you to start the server
with debugging using `F5`.

## Environment Variables

To change behaviour of the application you can configure environment variables in docker-compose file. For example, you can configure the application to work with your own cassandra cluster instead of the 'built-in' dockerized one. Add the variable to a docker-compose file like here:
```
version: '3'
services:
  web:
    ...
    environment:
      KILLRVIDEO_DSE_CONTACT_POINTS: 192.168.15.17
```

### Available Environment Variables
```
Logging Level       KILLRVIDEO_LOGGING_LEVEL          verbose
YouTube API Key     KILLRVIDEO_YOUTUBE_API_KEY        REPLACE_WITH_YOUR_KEY
Session Secret      KILLRVIDEO_SESSION_SECRET         THE_INTERNET_IS_FULL_OF_CAT_VIDEOS
Cassandra Host      KILLRVIDEO_DSE_CONTACT_POINTS     dse
Replication Factor  KILLRVIDEO_CASSANDRA_REPLICATION  "{ 'class' : 'SimpleStrategy', 'replication_factor' : 1 }"
Username            KILLRVIDEO_DSE_USERNAME           Null
Password            KILLRVIDEO_DSE_PASSWORD           Null
```

## Releasing

The app is released as a docker image for consumption by service project implementations. We
try to follow semantic versioning and to tag all releases in Git. First, you'll want to
version the project with `npm` by doing:
```
> npm version <specific_version | major | minor | patch | prerelease>
```
The `postversion` script will automatically push the newly created tag and any commits to the
Git repository. The `/scripts` directory contains the scripts necessary to build/publish the
Docker image. 

We use Travis CI for doing continuous integration builds and it will use those scripts to 
automatically publish any tagged Git commits to Docker Hub. You can, of course, manually
build and publish Docker images with those scripts as well.


[0]: http://www.killrvideo.com
[1]: https://facebook.github.io/react/index.html
[2]: http://redux.js.org/
[3]: http://netflix.github.io/falcor
[4]: http://expressjs.com/
[5]: http://www.grpc.io/
[6]: https://github.com/luketillman/killrvideo-csharp
[7]: https://github.com/killrvideo/killrvideo-java
[8]: https://github.com/killrvideo/killrvideo-nodejs
