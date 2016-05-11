FROM node:6.1-slim

# Add killrvideo group and user
RUN groupadd -r killrvideo --gid=999 \
    && useradd -r -g killrvideo --uid=999 killrvideo

# Default to production environment
ENV NODE_ENV production
    
# Add dependencies for node-gyp
RUN set -x \
    && apt-get update \
    && apt-get install -y python \
                          make \
                          g++ \
    && rm -rf /var/lib/apt/lists/*

# Create directory for app
RUN mkdir -p /opt/killrvideo-web \
    && chown -R killrvideo:killrvideo /opt/killrvideo-web

WORKDIR /opt/killrvideo-web

# Install the dependencies
COPY package.json /opt/killrvideo-web/
RUN npm install

# Copy the app itself
COPY . /opt/killrvideo-web

# Expose the default port
EXPOSE 3000

# Run the npm start script for the app by default
USER killrvideo
CMD [ "node", "/opt/killrvideo-web/dist/server/index.js" ]