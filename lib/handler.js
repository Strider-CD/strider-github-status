var url = require('url');
var GithubApi = require('github');
var debug = require('debug')('strider-github-status');

var GITHUB_DOMAIN = process.env.PLUGIN_GITHUB_API_DOMAIN;
var GITHUB_API_ENDPOINT = process.env.PLUGIN_GITHUB_API_ENDPOINT;

var config = {
  version: '3.0.0'
};

if (GITHUB_DOMAIN) {
  config.host = url.parse(GITHUB_DOMAIN).host;
}

if (GITHUB_API_ENDPOINT) {
  config.pathPrefix = url.parse(GITHUB_API_ENDPOINT).path;
}

module.exports = function (token, url, data, status, description) {
  debug('Setting status', token, url, data, status, description);
  var github = new GithubApi(config);
  github.authenticate({
    type: 'oauth',
    token: token
  });
  github.statuses.create({
    target_url: url,
    user: data.user,
    repo: data.repo,
    state: status,
    sha: data.sha,
    description: description
  }, function (err) {
    if (err) console.error('failed to set github status', url, data, err.message);
  });
};

