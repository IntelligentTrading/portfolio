const redis = require('redis')
const tradingClient = require('./client')
const bluebird = require('bluebird')
const UserModel = require('../models/Users')

bluebird.promisifyAll(redis)

const listener = redis.createClient(process.env.REDIS_URL)
const emitter = redis.createClient(process.env.REDIS_URL)

listener.subscribe('__keyevent@0__:expired')
listener.on('message', getProgress)

function getProgress (err, key) {
  emitter.get(key, () => {
    tradingClient.progress(key.split('|')[1]).then(progress => {
      if (!progress.status.includes('complete')) {
        emitter.set(key, 'pending', 'PX', 20000, getProgress)
      } else {
        UserModel.findById(key.split('|')[0]).then(user => {
          user.portfolio.lastDistributionRequest
            .filter(d => d.pid == key.split('|')[1])
            .forEach(d => {
              d.status = 'complete'
            })
          user.save()
          // save to history
        })
      }
    })
  })
}

module.exports = {
  schedule: (key_value, timeout) => {
    emitter.set(key_value, 'pending', 'PX', timeout)
  }
}
