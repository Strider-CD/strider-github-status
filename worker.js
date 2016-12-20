var debug = require('debug')('strider-github-status');

module.exports = {
  init: function (config, job, context, callback) {
    var sha;
    debug('initing', job._id, job.plugin_data);
    if (job.plugin_data && job.plugin_data.github && job.plugin_data.github.pull_request) {
      debug('found pr!', job.plugin_data.github.pull_request);
      sha = job.plugin_data.github.pull_request.sha;
    } else if (job.trigger.type === 'commit') {
      debug('found commit!', job.ref);
      sha = job.ref.id;
    } else {
      debug('No github PR data nor github commit', job.plugin_data, job);
      return callback(null, {});
    }
    var projectName = job.project.name;
    var creator = job.project.creator;
    var account;
    var token;
    account = creator.account(job.project.provider);
    if (!account || !account.config.accessToken) {
      console.error('Account not found for', job.project.provider);
      debug(job.project.provider, creator.accounts, account);
      return;
    }
    token = account.config.accessToken;
    debug('Token', account, token);

    return callback(null, {
      listen: function (emitter) {
        debug('listening');
        var github_repo_data = {
          user: job.project.provider.config.owner,
          repo: job.project.provider.config.repo,
          sha: sha
        };
        emitter.emit('plugin.github-status.started', job._id, projectName, token, github_repo_data, config);
        emitter.once('job.status.tested', function (jobId) {
          debug('job was tested', jobId);
          emitter.emit('plugin.github-status.done', jobId, projectName, token, github_repo_data, config);
        });
      }
    });
  }
};
