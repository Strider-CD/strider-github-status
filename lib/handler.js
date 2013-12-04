var async = require('async')
  , ObjectID = require('bson').ObjectID
  , createMailer = require('./mailer')

module.exports = function (job, context, callback) {
  // Find previous job for this project
  var query = { project: job.project.name }
  context.models.Job.find(query, null, { sort: { finished: -1 }, limit: 2 }, function (error, jobs) {
    if (error) {
      throw error
    }

    job.success = determineSuccess(job)

    var previousJob = jobs && jobs.length > 1 && jobs[1] ? jobs[1] : false
      , pluginConfig = context.pluginConfig
      , sendEmail = createMailer(context)

    previousJob.success = determineSuccess(previousJob)

    // Send email if this is the first ever job for this project, or if the state of the build has changed
    // or if always notify is set for this project
    if (pluginConfig.always_notify || !previousJob || job.success !== previousJob.success) {
      sendEmail(job, callback)
    } else {
      if (callback) callback(null, { state: 'didNotSend' })
    }
  })
}

function determineSuccess(job) {
  return job.test_exitcode === 0 ? true : false
}