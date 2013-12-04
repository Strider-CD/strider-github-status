module.exports = {
  init: function (config, job, context, callback) {
    return callback(null, {
      listen: function (emitter) {
        emitter.once('job.doneAndSaved', function (job) {
          emitter.emit('plugin.emailNotifier.send', job, config)
        })
      }
    })
  }
}