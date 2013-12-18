var debug = require('debug')('strider-github-status')

module.exports = {
  init: function (config, job, context, callback) {
    debug('initing', job._id, job.plugin_data)
    return callback(null, {
      listen: function (emitter) {
        debug('listening')
        if (!job.plugin_data || !job.plugin_data.github || !job.plugin_data.github.pull_request) {
          debug('No github PR data', job.plugin_data, job)
          return // context.comment('No pull request data found')
        } else {
          debug('found pr!', job.plugin_data.github.pull_request)
        }
        emitter.emit('plugin.github-status.started', job._id, job.project, job.plugin_data.github.pull_request)
        emitter.once('job.status.tested', function (jobId) {
          debug('job was tested', jobId)
          emitter.emit('plugin.github-status.done', jobId, job.project, job.plugin_data.github.pull_request)
        })
      }
    })
  }
}
