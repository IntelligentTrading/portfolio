const UserModel = require('../models/Users')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const mailer = require('../util/mailer')
const sec = require('../../lib/security/keymanager')
const allocationCtrl = require('../controllers/allocation')
const packsCtrl = require('../controllers/packs')
const tradingClient = require('../trading/client')
const monitor = require('../trading/monitor')

const ctrl = (module.exports = {
  create: async info => {
    return UserModel.create(info).then(newUser => {
      return { statusCode: 201, object: newUser }
    })
  },
  getById: async id => {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return UserModel.findById(id).then(user => {
        if (user) return user
        return Promise.reject(new Error('User not found'))
      })
    }
    return Promise.reject(new Error('Invalid object id'))
  },
  getByEmail: email => {
    return UserModel.findOne({ email: email })
  },
  all: () => {
    return UserModel.find()
  },
  authenticate: async credentials => {
    if (!credentials.email || !credentials.password) {
      return Promise.resolve({
        statusCode: 401,
        object: 'Email/Username and password required.'
      })
    }

    return UserModel.findOne({ email: credentials.email }).then(userInfo => {
      if (!userInfo) {
        return Promise.resolve({ statusCode: 401, object: 'User not found.' })
      }

      return userInfo.comparePassword(credentials.password).then(match => {
        if (!match) {
          return Promise.resolve({
            statusCode: 401,
            object: 'Invalid credentials.'
          })
        }

        const token = jwt.sign({ id: userInfo._id }, process.env.JWT_SECRET, {
          expiresIn: '4h'
        })

        return {
          user: userInfo.getShareableProperties(),
          pubKey: sec.publicKey().toString('base64'),
          token: token
        }
      })
    })
  },
  forgot: async userData => {
    if (!userData.email) {
      return Promise.resolve({ statusCode: 400, object: 'Email not provided' })
    }

    return UserModel.findOne({ email: userData.email }).then(user => {
      if (!user) {
        return Promise.resolve({ statusCode: 400, object: 'User not found' })
      }

      user.resetToken = crypto.randomBytes(48).toString('hex')
      user.save()
      return mailer.send(userData.email, user.resetToken)
    })
  },
  reset: (token, newPassword) => {
    if (!token) {
      return Promise.resolve({ statusCode: 400, object: 'Token not provided' })
    }

    return UserModel.findOne({ resetToken: token }).then(user => {
      if (!user) Promise.resolve({ statusCode: 400, object: 'User not found' })

      user.resetToken = null
      user.password = newPassword
      user.save()
    })
  },
  rebalance: async id => {
    return ctrl.getById(id).then(user => {
      if (user) {
        if (user.exchanges.length <= 0) {
          return Promise.resolve({
            statusCode: 500,
            object: 'No exchange has been set.'
          })
        }
        if (user.portfolio.packs.length <= 0) {
          return Promise.resolve({
            statusCode: 500,
            object: 'No package has been set.'
          })
        }
        return packsCtrl.list().then(dbpacks => {
          let userPacks = dbpacks.filter(dbp =>
            user.portfolio.packs.includes(dbp.label)
          )
          return allocationCtrl
            .allocate(user.exchanges, userPacks)
            .then(desired_allocations => {
              desired_allocations.forEach(desired_allocation => {
                desired_allocation.credentials = user.exchanges.find(
                  x => x.label == desired_allocation.exchange
                ).credentials
              })
              return tradingClient
                .set(desired_allocations)
                .then(portfolioResult => {
                  portfolioResult.portfolio_processing_request = portfolioResult.portfolio_processing_request.replace(
                    '/api/portfolio_process/',
                    ''
                  )
                  monitor.schedule(
                    `${id}|${portfolioResult.portfolio_processing_request}`,
                    portfolioResult.retry_after
                  )

                  return portfolioResult.status
                })
                .catch(err => {
                  console.log(err.message)
                  // 400 - {"detail":"Another rebalance task from this api key is in progress."}
                  console.log(err)
                  return Promise.resolve({
                    statusCode: 500,
                    object: 'Rebalancing failed, please retry.'
                  })
                })
            })
        })
      }

      return Promise.resolve({ statusCode: 400, object: 'User not found' })
    })
  },
  exchanges: {
    add: async (id, exchange) => {
      return ctrl.getById(id).then(user => {
        if (user) {
          if (!user.exchanges.some(x => x.label === exchange.label)) {
            user.exchanges.push(exchange)
            user.save()
            return {
              statusCode: 200,
              object: user.exchanges.map(exchange =>
                exchange.getShareableProperties()
              )
            }
          } else {
            return {
              statusCode: 418,
              object: "Exchange already present in user's list"
            }
          }
        }
        return { statusCode: 418, object: 'User not found' }
      })
    },
    edit: async (id, exchange) => {
      return ctrl.getById(id).then(user => {
        if (user) {
          let index = user.exchanges.findIndex(x => x.label === exchange.label)
          if (index < 0) message = 'Exchange not found for this user.'
          else {
            user.exchanges[index].credentials = exchange.credentials
            user.save()
          }
        }

        return {
          statusCode: 200,
          object: user.exchanges.map(exchange =>
            exchange.getShareableProperties()
          )
        }
      })
    },
    delete: async (id, exchange) => {
      return ctrl.getById(id).then(user => {
        if (user) {
          let index = user.exchanges.findIndex(x => x.label === exchange.label)
          if (index < 0) {
            return {
              statusCode: 418,
              object: 'Exchange not found for this user.'
            }
          } else {
            user.exchanges.splice(index, 1)
            user.save()
            return {
              statusCode: 200,
              object: user.exchanges.map(exchange =>
                exchange.getShareableProperties()
              )
            }
          }
        }
        return { statusCode: 418, object: 'User not found' }
      })
    }
  },
  packs: {
    switch: async (id, pack) => {
      let message = ''
      return ctrl.getById(id).then(user => {
        if (user) {
          if (!user.portfolio.packs.some(x => x.label === pack)) {
            user.portfolio.packs = [pack]
            message = 'Package switched.'
            user.save()
            return { statusCode: 200, object: message }
          } else {
            return {
              statusCode: 418,
              object: "Package already present in user's portfolio"
            }
          }
        }
        return { statusCode: 418, object: 'User not found' }
      })
    },
    add: async (id, pack) => {
      let message = ''
      return ctrl.getById(id).then(user => {
        if (user) {
          if (!user.portfolio.packs.some(x => x.label === pack)) {
            user.portfolio.packs.push(pack)
            message = 'Package added.'
            user.save()
            return { statusCode: 200, object: message }
          } else {
            return {
              statusCode: 418,
              object: "Package already present in user's portfolio"
            }
          }
        }
        return { statusCode: 418, object: 'User not found' }
      })
    },
    delete: async (id, pack) => {
      return ctrl.getById(id).then(user => {
        if (user) {
          let index = user.portfolio.packs.findIndex(
            x => x.label === pack.label
          )
          if (index < 0) {
            return {
              statusCode: 418,
              object: 'Pack not found for this user.'
            }
          } else {
            user.portfolio.packs.splice(index, 1)
            user.save()
            return { statusCode: 200, object: 'Pack deleted.' }
          }
        }
        return { statusCode: 418, object: 'User not found' }
      })
    }
  },
  portfolio: async id => {
    return ctrl.getById(id).then(user => {
      if (user) {
        let statusPromises = [monitor.checkPending(id)]
        user.exchanges.map(exchange => {
          statusPromises.push(tradingClient.status(exchange))
        })

        return Promise.all(statusPromises)
          .then(results => {
            let keys = results[0]
            results = results.slice(1).filter(result => result != null)
            if (results) {
              let portfolio = results[0]
              portfolio.pending = keys
              return portfolio
            }
            return {}
          })
          .catch(err => {
            console.log(err)
          })
      }
    })
  },
  checkPending: async id => {
    return monitor.checkPending(id, keys => {
      return { status: 200, object: keys }
    })
  }
})
