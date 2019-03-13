var Scheduler = require('redis-scheduler')
const notifier = require('../util/socketServer')
const tradingClient = require('./client')

var scheduler = new Scheduler()

function notify (err, key) {
  console.log(key)

  tradingClient.progress(key.split('|')[1]).then(progress => {
    if (progress.status.includes('complete')) {
      notifier.dispatch(key.split('|')[0], {
        type: 'rebalancing',
        data: progress.status
      })
    } else {
      scheduler.schedule({ key: key, expire: 10000, handler: notify })
    }
  })
}

module.exports = {
  schedule: (key_value, timeout) => {
    scheduler.schedule(
      { key: key_value, expire: timeout, handler: notify },
      err => {
        if (err) console.log(err)
      }
    )
  }
}
