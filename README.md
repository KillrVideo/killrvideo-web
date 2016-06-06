# KillrVideo Web UI

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
repos, for example the [C# implementation][6].

## Developing

All assets for the front-end are built using webpack and the backend is all transpiled with babel. After cloning 
the repo, you'll need to install all dependencies first:
```
> npm install
```
All environment dependencies can be spun up using `docker-compose` (this includes Etcd and DataStax Enterprise). Use
the scripts under the `/scripts` folder to create a `.env` file for `docker-compose`. This will point `docker-compose`
at the compose file under `/lib/killrvideo-docker-common`. You can then start environment dependencies with:
```
> docker-compose up -d
```
You can then start a default "developer" task with:
```
> npm run watch
```
This will clean, do a build with webpack and babel, and watch the files for changes. If using VS Code for development,
the tasks checked into the repo should allow you to start the server with debugging using `F5`.

## Releasing

The app is released as a docker image for consumption by service project implementations. First, you'll want to
version the project with `npm` by doing:
```
> npm version <specific_version | major | minor | patch | prerelease>
```
The `postversion` tasks will push commits and the new tag to GitHub. Then run a release build:
```
> npm run release
```
Next, build the docker image using the helper scripts provided in the root folder of the repository (for example
on Windows):
```
> .\docker-build.ps1
```
Lastly, push the docker image to the Docker Hub:
```
> docker login --username=myusername
...
> docker push luketillman/killrvideo-web
```


[0]: http://www.killrvideo.com
[1]: https://facebook.github.io/react/index.html
[2]: http://redux.js.org/
[3]: http://netflix.github.io/falcor
[4]: http://expressjs.com/
[5]: http://www.grpc.io/
[6]: https://github.com/luketillman/killrvideo-csharp
