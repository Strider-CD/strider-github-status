var async = require('async')
  , createMailer = require('./mailer')

module.exports = function (job, context, callback) {

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