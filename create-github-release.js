var path = require('path');
var fs = require('fs');
var GitHubApi = require('github');
var packageData = require('./package.json');

// Make sure we have a GitHub API token
var token = process.env['npm_config_KILLRVIDEO_GITHUB_TOKEN'];
if (!token) {
  throw new Error('The npm config KILLRVIDEO_GITHUB_TOKEN is not present.');
}

// Find the release tarball
var tarballName = 'killrvideo-web-' + packageData.version + '.tgz';
var tarballPath = path.resolve(__dirname, tarballName);
var tarballStats = fs.statSync(tarballPath);
if (!tarballStats.isFile()) {
  throw new Error('Could not find package at ' + tarballPath);
}

// Some constants for GitHub details
var GITHUB_OWNER = 'luketillman';
var GITHUB_REPO = 'killrvideo-web';

// Create API and set auth token
var github = new GitHubApi({
  version: '3.0.0',
  protocol: 'https'
});

github.authenticate({
  type: 'oauth',
  token: token
});

// Since we follow semver, this is a prerelease package if it contains a '-' in the version number
var prerelease = packageData.version.indexOf('-') !== -1;

// Create the release
github.releases.createRelease({
  owner: GITHUB_OWNER,
  repo: GITHUB_REPO,
  tag_name: 'v' + packageData.version,
  prerelease: prerelease
}, function(err, data) {
  if (err) {
    throw err;
  }
  
  var id = data.id;
  console.log('Successfully created GitHub release [%s] with id [%d]', data.tag_name, id);
  
  // Use the ID of the release that was just created, to upload the tarball of the package
  github.releases.uploadAsset({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    id: id,
    name: tarballName,
    filePath: tarballPath
  }, function(uploadErr, uploadData) {
    if (uploadErr) {
      throw uploadErr;
    }
    
    console.log('Successfully added asset [%s] to release', uploadData.name);
  });
});