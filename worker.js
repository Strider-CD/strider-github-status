module.exports = {
  init: function (config, job, context, callback) {
    return callback(null, {
      listen: function (emitter) {
        if (!job.plugin_data || !job.plugin_data.pull_request) {
          console.log(context)
          return // context.comment('No pull request data found')
        }
        emitter.emit('plugin.github-status.started', job._id, job.project, job.plugin_data.pull_request)
        emitter.once('job.status.tested', function (jobId) {
          emitter.emit('plugin.github-status.done', jobId, job.project, job.plugin_data.pull_request)
        })
      }
    })
  }
}
