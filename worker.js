module.exports = {
  init: function (config, job, context, callback) {
    return callback(null, {
      listen: function (emitter) {
        console.log(job)
        emitter.emit('plugin.github-status.started', job._id)
        emitter.once('job.status.tested', function (jobId) {
          emitter.emit('plugin.github-status.done', jobId, config)
        })
      }
    })
  }
}
