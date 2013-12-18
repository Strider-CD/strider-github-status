var setStatus = require('./lib/handler')

function jobStatus(job) {
  if (job.errored) return 'error'
  return job.test_exitcode === 0 ? 'success' : 'failure'
}

function getToken(models, projectName, done) {
  models.Project.findOne({name: projectName}, function (err, project) {
    if (err) return done(err)
    models.User.findById(project.creator, function (err, user) {
      if (err) return done(err)
      var account = user.account(project.provider)
      if (!account) {
        return done(new Error('no account found for ' + user._id))
      }
      if (!account.accessToken) {
        return done(new Error('account misconfigured; no access token ' + user._id))
      }
      done(null, account.accessToken)
    })
  })
}

module.exports = {
  // global events
  listen: function (io, context) {
    io.on('plugin.github-status.started', function (jobId, projectName, data) {
      getToken(context.models, projectName, function (err, token) {
        if (err) return console.error('Failed to get access token', err.message)
        var url = context.config.server_name + '/' + projectName + '/job/' + jobId
        setStatus(token, url, data, 'pending')
      })
    })

    io.on('plugin.github-status.done', function (jobId, pluginConfig, data) {
      var onDoneAndSaved = function (job) {
        if (job._id.toString() !== jobId.toString()) return
        console.log('yeah', job.project)

        io.removeListener('job.doneAndSaved', onDoneAndSaved)
        getToken(context.models, job.project, function (err, token) {
          if (err) return console.error('Failed to get access token', err.message)
          var url = context.config.server_name + '/' + job.project + '/job/' + jobId
          setStatus(token, url, data, jobStatus(job))
        })
      }
      io.on('job.doneAndSaved', onDoneAndSaved)
    })
  }
}

