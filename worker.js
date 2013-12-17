module.exports = {
  init: function (config, job, context, callback) {
    return callback(null, {
      listen: function (emitter) {
        emitter.once('job.status.tested', function (jobId) {
          emitter.emit('plugin.emailNotifier.send', jobId, config)
        })
      }
    })
  }
}