var GithubApi = require('github')

module.exports = function (token, url, data, status) {
  var github = new GithubApi({ version: '3.0.0', })
  github.authorize({
    type: 'oauth',
    token: token
  })
  github.statuses.create({
    target_url: url,
    user: data.user,
    repo: data.repo,
    state: status,
    sha: data.sha
  }, function (err) {
    if (err) console.error('failed to set github status', url, data, err.message)
  })
}

