var debug = require('debug')('strider-github-status');
var setStatus = require('./lib/handler');

function jobStatus(job) {
  if (job.errored) return 'error';
  return job.test_exitcode === 0 ? 'success' : 'failure';
}

// TODO: give information here as to why it errored/failed?
function jobDescription(job) {
  if (job.errored) return 'Strider tests errored';
  return 'Strider tests ' + (job.test_exitcode === 0 ? 'succeeded' : 'failed');
}

module.exports = {
  // global events
  listen: function (io, context) {
    io.on('plugin.github-status.started', function (jobId, projectName, token, data) {
      debug('got', jobId, projectName, token, data);
      var url = context.config.server_name + '/' + projectName + '/job/' + jobId;
      setStatus(token, url, data, 'pending', 'Strider test in progress');
    });

    io.on('plugin.github-status.done', function (jobId, projectName, token, data) {
      function onDoneAndSaved(job) {
        if (job._id.toString() !== jobId.toString()) return;
        debug('plugin done', jobId, projectName, token, data);

        io.removeListener('job.doneAndSaved', onDoneAndSaved);
        var url = context.config.server_name + '/' + projectName + '/job/' + jobId
          , status = jobStatus(job)
          , description = jobDescription(job);
        setStatus(token, url, data, status, description);
      }
      io.on('job.doneAndSaved', onDoneAndSaved);
    });
  }
};

