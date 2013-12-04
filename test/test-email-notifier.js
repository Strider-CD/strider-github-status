var expect = require('expect.js')
  , handler = require('../lib/handler')
  , defaultConfig = {}

describe('Email Notifier', function () {

  function createContext(jobModelFunction, pluginConfig, sendState) {
    return {
      models:
      { Job: { find: jobModelFunction }
      , User: { collaborators: function (a, callback) { callback(null, [ { emailAddress: '' } ]) } }
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
      _id: 1234
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
      , context = createContext(
          function (a, b, c, callback) {
            callback()
          }
    , { always_notfiy: true }
    )
    handler(job, context)
  })

  it('should send success email when always_notfiy is true and job exit code is zero', function (done) {
    var job = createJob(0)
      , context = createContext(
          function (a, b, c, callback) {
            callback()
          }
    , { always_notfiy: true }
    )
    handler(job, context, function (error, response) {
      expect(response.state).to.be('successSent')
      done()
    })
  })

  it('should send success email when always_notfiy is true and job exit code is > zero', function (done) {
    var job = createJob(1)
      , context = createContext(
          function (a, b, c, callback) {
            callback()
          }
    , { always_notfiy: true }
    )
    handler(job, context, function (error, response) {
      expect(response.state).to.be('failureSent')
      done()
    })
  })

  it('should send success email when always_notfiy is false and there is no previous job', function (done) {
    var job = createJob(0)
      , context = createContext(
          function (a, b, c, callback) {
            callback()
          }
    , { always_notfiy: false }
    )
    handler(job, context, function (error, response) {
      expect(response.state).to.be('successSent')
      done()
    })
  })

  it('should send success email when always_notfiy is false and job state has changed', function (done) {
    var job = createJob(0)
      , context = createContext(
          function (a, b, c, callback) {
            callback(null, [ createJob(0), createJob(1) ])
          }
    , { always_notfiy: false }
    )
    handler(job, context, function (error, response) {
      expect(response.state).to.be('successSent')
      done()
    })
  })

  it('should not send any emails when job state has not changed (both failed)', function (done) {
    var job = createJob(1)
      , context = createContext(
          function (a, b, c, callback) {
            callback(null, [ createJob(1), createJob(1) ])
          }
    , { always_notfiy: false }
    )
    handler(job, context, function (error, response) {
      expect(response.state).to.be('didNotSend')
      done()
    })
  })

  it('should not send any emails when job state has not changed (both failed, different codes)', function (done) {
    var job = createJob(1)
      , context = createContext(
          function (a, b, c, callback) {
            callback(null, [ createJob(1), createJob(2) ])
          }
    , { always_notfiy: false }
    )
    handler(job, context, function (error, response) {
      expect(response.state).to.be('didNotSend')
      done()
    })
  })

  it('should not send any emails when job state has not changed (both successful)', function (done) {
    var job = createJob(0)
      , context = createContext(
          function (a, b, c, callback) {
            callback(null, [ createJob(0), createJob(0) ])
          }
    , { always_notfiy: false }
    )
    handler(job, context, function (error, response) {
      expect(response.state).to.be('didNotSend')
      done()
    })
  })

})