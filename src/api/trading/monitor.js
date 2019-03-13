const redis = require('redis')
const notifier = require('../util/socketServer')
const tradingClient = require('./client')

const listener = redis.createClient(process.env.REDIS_URL)
const emitter = redis.createClient(process.env.REDIS_URL)
listener.subscribe('__keyevent@0__:expired')
listener.on('message', notify)

function notify (err, key) {
  console.log(key)

  tradingClient.progress(key.split('|')[1]).then(progress => {
    if (progress.status.includes('complete')) {
      notifier.dispatch(key.split('|')[0], {
        type: 'rebalancing',
        data: progress.status
      })
    } else {
      emitter.set(key_value, '', 'PX', 10000, notify)
    }
  })
}

module.exports = {
  schedule: (key_value, timeout) => {
    emitter.set(key_value, '', 'PX', timeout)
  }
}
