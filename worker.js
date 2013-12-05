module.exports = {
  init: function (config, job, context, callback) {
    return callback(null, {
      listen: function (emitter, context) {
        emitter.once('job.status.tested', function (jobId, result) {
          emitter.emit('plugin.emailNotifier.send', jobId, config)
        })
      }
    })
  }
}