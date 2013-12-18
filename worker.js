var debug = require('debug')('strider-github-status')

function getAccount(user, project) {
  for (var i=0; i<user.accounts.length; i++) {
    if (user.accounts[i].provider === project.provider.id &&
        user.accounts[i].id === project.provider.account) {
      return user.accounts[i]
    }
  }
}

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
        var projectName = job.project.name
          , creator = job.project.creator
          , account
          , token
        if (creator.account) {
          debug('Full account!')
          account = creator.account(job.project.provider)
        } else {
          account = getAccount(creator, job.project)
        }
        if (!account || account.accessToken) {
          console.error('Account not found for', job.project.provider)
          debug(job.project.provider, creator.accounts, account)
          return
        }
        token = account.accessToken
        debug('Token', account, token)
        emitter.emit('plugin.github-status.started', job._id, projectName, token, job.plugin_data.github.pull_request)
        emitter.once('job.status.tested', function (jobId) {
          debug('job was tested', jobId)
          emitter.emit('plugin.github-status.done', jobId, projectName, token, job.plugin_data.github.pull_request)
        })
      }
    })
  }
}
