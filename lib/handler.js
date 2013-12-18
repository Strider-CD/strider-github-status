var GithubApi = require('github')
  , debug = require('debug')('strider-github-status')

module.exports = function (token, url, data, status, description) {
  debug('Setting status', token, url, data, status, description)
  var github = new GithubApi({ version: '3.0.0', })
  github.authenticate({
    type: 'oauth',
    token: token
  })
  github.statuses.create({
    target_url: url,
    user: data.user,
    repo: data.repo,
    state: status,
    sha: data.sha,
    description: description
  }, function (err) {
    if (err) console.error('failed to set github status', url, data, err.message)
  })
}

