var expect = require('expect.js')
  , handler = require('../lib/handler')

describe('Email Notifier', function () {

  function createContext(jobs, pluginConfig, collaborators) {
    if (!collaborators) collaborators = [ { email: '' } ]
    return {
      models:
      { Job:
        { find: function (a, b, c, callback) {
            callback(null, jobs)
          }
        }
      , User: { collaborators: function (a, callback) { callback(null, collaborators) } }
      }
    , pluginConfig: pluginConfig
    , config: {}
    , createMailer: function () {
        return {
          elapsed_time: function () { return '' }
        , format_stdmerged: function  () { return '' }
        , send: function (a, b, c, d, e, callback) { callback() }
        }
      }
    }
  }

  function createJob(exitCode) {
    return {
      _id: '51a752e1b2e17d6810000001'
    , project: { name: 'test/project' }
    , test_exitcode: exitCode
    , started: new Date()
    , finished: new Date()
    , created: new Date()
    , std: { merged: '' }
    }
  }

  it('should not break when no callback is set', function () {
    var job = createJob(0)
      , context = createContext([job], { always_notify: true })
    handler(job, context)
  })

  it('should send success email when always_notify is true and job exit code is zero', function (done) {
    var job = createJob(0)
      , context = createContext([job], { always_notify: true })
    handler(job, context, function (error, response) {
      expect(response.state).to.be('successSent')
      done()
    })
  })

  it('should send success email when always_notify is true and job exit code is > zero', function (done) {
    var job = createJob(1)
      , context = createContext([job], { always_notify: true })
    handler(job, context, function (error, response) {
      expect(response.state).to.be('failureSent')
      done()
    })
  })

  it('should send success email when always_notify is false and there is no previous job', function (done) {
    var job = createJob(0)
      , context = createContext([job], { always_notify: false })
    handler(job, context, function (error, response) {
      expect(response.state).to.be('successSent')
      done()
    })
  })

  it('should send success email when always_notify is false and job state has changed', function (done) {
    var job = createJob(0)
      , context = createContext([job, createJob(1)], { always_notify: false })
    handler(job, context, function (error, response) {
      expect(response.state).to.be('successSent')
      done()
    })
  })

  it('should not send any emails when job state has not changed (both failed)', function (done) {
    var job = createJob(1)
      , context = createContext([job, createJob(1)], { always_notify: false })
    handler(job, context, function (error, response) {
      expect(response.state).to.be('didNotSend')
      done()
    })
  })

  it('should not send any emails when job state has not changed (both failed, different codes)', function (done) {
    var job = createJob(1)
      , context = createContext([job, createJob(2)], { always_notify: false })
    handler(job, context, function (error, response) {
      expect(response.state).to.be('didNotSend')
      done()
    })
  })

  it('should not send any emails when job state has not changed (both successful)', function (done) {
    var job = createJob(0)
      , context = createContext([job, createJob(0)], { always_notify: false })
    handler(job, context, function (error, response) {
      expect(response.state).to.be('didNotSend')
      done()
    })
  })

  it('should not crash when no config has been set', function (done) {
    var job = createJob(0)
      , context = createContext([job, createJob(0)])
    handler(job, context, function (error, response) {
      expect(response.state).to.be('didNotSend')
      done()
    })
  })

  it('should correctly send email to multiple people', function (done) {
    var job = createJob(0)
      , collaborators =
        [ { email: 'test1@example.com' }
        , { email: 'test2@example.com' }
        , { email: 'test3@example.com' }
        ]
      , context = createContext([job, createJob(0)], { always_notify: true }, collaborators)
    handler(job, context, function (error, response) {
      expect(response.state).to.be('successSent')
      expect(response.numEmailsSent).to.be(3)
      done()
    })
  })

})