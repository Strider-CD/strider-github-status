var _ = require('underscore')
  , path = require('path')
  , jade = require('jade')
  , fs = require('fs')
  , moment = require('moment')

module.exports = function (context) {

  var config = context.config
    , pluginConfig = context.pluginConfig
    , mailer = context.createMailer(config)
    , User = context.models.User
    , test_fail_plaintext = renderJade(
            path.join(__dirname, '../views', 'email_templates', 'plaintext','test_fail.jade'))
    , test_succeed_plaintext = renderJade(
              path.join(__dirname, '../views', 'email_templates', 'plaintext','test_succeed.jade'))
    , test_succeed_html = renderUnderscore(
              path.join(__dirname, '../views', 'email_templates', 'html','test_succeed.html'))
    , test_fail_html = renderUnderscore(
              path.join(__dirname, '../views', 'email_templates', 'html','test_fail.html'))

  function renderJade(filepath) {
    return jade.compile(fs.readFileSync(filepath, 'utf8'),{filename: filepath })
  }

  function renderUnderscore(filepath) {
    return _.template(fs.readFileSync(filepath, 'utf8'))
  }

  function getTemplateOptions (job, state, type) {
    var project = job.project
      , display_name = project.display_name
      , subject = '[STRIDER] - ' + display_name + ' test ' + state + ' - ' + job._id.toString().substr(0,8)
      , duration = mailer.elapsed_time(job.started.getTime(),job.finished.getTime())
      , url = config.server_name + '/' + display_name + '/job/' + job._id

    return { display_name:display_name,
      finish_time:moment(job.finished_timestamp).format('YYYY-MM-DD h:mm a'),
      elapsed_time:duration,
      url:url,
      subject:subject,
      log_tail:mailer.format_stdmerged(job.std.merged, type)
    }
  }

  function sendToCollaborators(job, htmlTemplate, plainTextTemplate, state, callback) {
    var project = job.project
      , htmlOptions = getTemplateOptions(job, state, 'html')
      , body_html = htmlTemplate(htmlOptions)
      , body_text = plainTextTemplate(getTemplateOptions(job, state, 'plaintext'))
      , complete = function (error) {
          if (callback) {
            callback(error, {state: state + 'Sent'})
          }
        }

    User.collaborators(project.name, function (err, users) {
      if (err) console.error('[email-ok] Error finding collaborators for project', err.message)
      for (var i=0; i<users.length; i++) {
        mailer.send(users[i].email, htmlOptions.subject, body_text, body_html, false, complete)
      }
    })
  }

  function sendSuccess(job, callback) {
    sendToCollaborators(job, test_succeed_html, test_succeed_plaintext, 'success', callback)
  }

  function sendFailure(job, callback) {
    sendToCollaborators(job, test_fail_html, test_fail_plaintext, 'failure', callback)
  }

  function send(currentJob, callback) {
    if (parseInt(currentJob.test_exitcode, 10) === 0) {
      sendSuccess(currentJob, callback)
    } else {
      sendFailure(currentJob, callback)
    }
  }

  return send
}