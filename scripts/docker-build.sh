#!/bin/bash

# Get the package version from the package.json then build with docker build
PACKAGE_VERSION=$(node -p -e "require('./package.json').version")
docker build -t killrvideo/killrvideo-web:$PACKAGE_VERSION --build-arg KILLRVIDEO_YOUTUBE_API_KEY=$KILLRVIDEO_YOUTUBE_API_KEY .
