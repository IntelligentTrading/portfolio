const UserModel = require('../api/models/Users')
const moment = require('moment')
const usersCtrl = require('../api/controllers/users')
const db = require('../../database')

db.connect()

const scheduler = (module.exports = {
  rebalanceStalePortfolios: (olderThanMinutes = 240) => {
    return UserModel.find().then(users => {
      let usersToRebalance = users.filter(
        user =>
          user.exchanges.length > 0 &&
          (!user.portfolio.lastDistributionRequest ||
            (user.portfolio.lastDistributionRequest &&
              user.portfolio.lastDistributionRequest[0] &&
              // it will always be the first for now
              moment(user.portfolio.lastDistributionRequest[0].updatedAt)
                .add(olderThanMinutes, 'minutes')
                .isBefore(moment())))
      )

      let promises = []
      usersToRebalance.forEach(user => {
        promises.push(usersCtrl.rebalanceUser(user))
      })

      return Promise.all(promises)
    })
  }
})

console.log('Running scheduled rebalancing check...')
scheduler
  .rebalanceStalePortfolios(process.env.REBALANCING_FREQUENCY)
  .then(results => {
    console.log(
      `Rebalance operations enqueued. (${
        results ? results.length : 0
      } portfolios waiting for rebalancing)`
    )
  })
