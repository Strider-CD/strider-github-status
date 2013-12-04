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
    io.on('plugin.emailNotifier.send', function (job, pluginConfig) {
      context.pluginConfig = pluginConfig
      context.createMailer =  createMailer
      jobHandler(job, context)
    })
  }
}
