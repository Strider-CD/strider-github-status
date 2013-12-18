var jobHandler = require('./lib/handler')

function jobStatus(job) {
  if (job.errored) return 'error'
  return job.test_exitcode === 0 ? 'success' : 'failure'
}

module.exports = {
  // global events
  listen: function (io, context) {
    io.on('plugin.github-status.started', function (jobId) {
      console.log('started', jobId)
    })

    io.on('plugin.github-status.done', function (jobId, pluginConfig) {
      var onDoneAndSaved = function (job) {
        console.log('doneandsaved', job)
        /*
        if (job._id.toString() === jobId.toString()) {
          io.removeListener('job.doneAndSaved', onDoneAndSaved)
          context.pluginConfig = pluginConfig
          jobHandler(job, context, jobStatus(job))
        }
        */
      }
      io.on('job.doneAndSaved', onDoneAndSaved)
    })
  }
}

