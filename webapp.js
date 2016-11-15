var debug = require('debug')('strider-github-status');
var setStatus = require('./lib/handler');

// TODO: give information here as to why it errored/failed?
function jobInfo(job, config) {
  var info = {};

  if (job.errored) info.status = 'error';
  else if (job.test_exitcode === 0) info.status = 'success';
  else info.status = 'failure';

  info.description = config.messages[info.status];
  info.context = config.context;

  return info;
}

module.exports = {
  config: {
    'github-status': {
      messages: {
        pending: {type: String, default: 'Strider test in progress'},
        success: {type: String, default: 'Strider tests succeeded'},
        failure: {type: String, default: 'Strider tests failed'},
        error: {type: String, default: 'Strider tests errored'},
      },
      context: {type: String, default: 'default'},
    }
  },
  // global events
  listen: function (io, context) {
    io.on('plugin.github-status.started', function (jobId, projectName, token, data, config) {
      debug('got', jobId, projectName, token, data);
      var url = context.config.server_name + '/' + projectName + '/job/' + jobId;
      setStatus(token, url, data, 'pending', config.messages.pending, config.context);
    });

    io.on('plugin.github-status.done', function (jobId, projectName, token, data, config) {
      function onDoneAndSaved(job) {
        if (job._id.toString() !== jobId.toString()) return;
        debug('plugin done', jobId, projectName, token, data);

        io.removeListener('job.doneAndSaved', onDoneAndSaved);
        var url = context.config.server_name + '/' + projectName + '/job/' + jobId
          , info = jobInfo(job, config);
        setStatus(token, url, data, info.status, info.description, info.context);
      }
      io.on('job.doneAndSaved', onDoneAndSaved);
    });
  }
};

