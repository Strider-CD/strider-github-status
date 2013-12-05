var jobHandler = require('./lib/handler')
  , createMailer = require('strider-mailer')

module.exports = {
  config: {
    alwaysNotify: {
      type: Boolean,
      default: false
    }
  },
  // global events
  listen: function (io, context) {
    io.on('plugin.emailNotifier.send', function (jobId, pluginConfig) {
      var onDoneAndSaved = function (job) {
        if (job._id.toString() === jobId.toString()) {
          io.removeListener('job.doneAndSaved', onDoneAndSaved)
          context.pluginConfig = pluginConfig
          context.createMailer =  createMailer
          jobHandler(job, context)
        }
      }
      io.on('job.doneAndSaved', onDoneAndSaved)
    })
  }
}

