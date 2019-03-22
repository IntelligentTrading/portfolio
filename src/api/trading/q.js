const Queue = require('bull')
const rebalancingQ = new Queue('rebalancing-tasks', process.env.REDIS_URL)
const tradingClient = require('../trading/client')
const UserModel = require('../models/Users')

const q = (module.exports = {
  enqueue: async (uid, pid, timeout) => {
    console.log(`${uid} added to the rebalancing queue.`)
    await rebalancingQ.add({ uid: uid, pid: pid }, { delay: timeout })
  }
})

rebalancingQ.process(job => {
  return tradingClient.progress(job.data.pid).then(progress => {
    if (!progress.status.includes('complete')) {
      return q.enqueue(job.data.uid, job.data.pid, 30000)
    } else {
      UserModel.findById(job.data.uid).then(user => {
        user.portfolio.lastDistributionRequest
          .filter(d => d.pid == job.data.pid)
          .forEach(d => {
            d.status = 'complete'
          })
        user.save()
        // save to history
      })
    }
  })
})

rebalancingQ.on('completed', job => {
  console.log(`${job.data.uid} rebalancing task completed.`)
})
