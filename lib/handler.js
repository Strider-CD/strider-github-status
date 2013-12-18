/*
var async = require('async')
  , GithubApi = require('github')

module.exports = function (token, url, user, repo, sha, state) {
}
*/

    
/*
function doit(payload, token, name, appConfig, done) {
  var head = payload.pull_request.head
    , github = new GithubApi({ version: '3.0.0', })
  github.authorize({
    type: 'oauth',
    token: token
  })
  github.statuses.create({
    target_url: appConfig.hostname + '/' + name,
    user: head.repo.owner.login,
    repo: head.repo.name,
    state: 'pending',
    sha: head.sha
  }, done)
}
*/

/*
module.exports = function (job, context, status, callback) {

  context.pluginConfig = context.pluginConfig || {}

  async.waterfall
  (
    [ function (waterCallback) {
        var query = { project: job.project.name }
          , options = { sort: { finished: -1 }, limit: 2 }
        context.models.Job.find(query, null, options, function (error, jobs) {
          var previousJob = jobs && jobs.length > 1 && jobs[1] ? jobs[1] : false
          previousJob.success = determineSuccess(previousJob)
          waterCallback(error, job, previousJob)
        })
      }
    ]
  , function (error, job, previousJob) {
      if (error) {
        throw error
      }

      job.success = determineSuccess(job)

      var pluginConfig = context.pluginConfig
      , sendEmail = createMailer(context)

      // Send email if this is the first ever job for this project, or if the state of the build has changed
      // or if always notify is set for this project
      if (pluginConfig.always_notify || !previousJob || job.success !== previousJob.success) {
        sendEmail(job, callback)
      } else {
        if (callback) callback(null, { state: 'didNotSend' })
      }
    }
  )
}

function determineSuccess(job) {
  return job.test_exitcode === 0 ? true : false
}
*/
