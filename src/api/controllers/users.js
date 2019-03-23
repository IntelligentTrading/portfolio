const UserModel = require('../models/Users')
const DistributionModel = require('../models/Distributions')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const mailer = require('../util/mailer')
const sec = require('../../lib/security/keymanager')
const allocationCtrl = require('../controllers/allocation')
const packsCtrl = require('../controllers/packs')
const tradingClient = require('../trading/client')
const q = require('../trading/q')

const ctrl = (module.exports = {
  create: async info => {
    info.signupToken = crypto.pseudoRandomBytes(8).toString('hex')
    return UserModel.create(info).then(newUser => {
      return { statusCode: 201, object: newUser }

      // for v2
      /* return mailer.confirm(newUser.email, newUser.signupToken).then(() => {
        return { statusCode: 201, object: newUser }
      }) */
    })
  },
  confirm: async signupToken => {
    return UserModel.findOne({ signupToken: signupToken }).then(user => {
      if (user) {
        user.enabled = true
        return { statusCode: 200 }
      } else return { statusCode: 404 }
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
      return ctrl.rebalanceUser(user)
    })
  },
  rebalanceUser: async user => {
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
          .then(distributions => {
            distributions.forEach(desired_allocation => {
              desired_allocation.credentials = user.exchanges.find(
                x => x.label == desired_allocation.exchange
              ).credentials
            })
            return tradingClient.set(distributions).then(portfolioResult => {
              portfolioResult.portfolio_processing_request = portfolioResult.portfolio_processing_request.replace(
                '/api/portfolio_process/',
                ''
              )

              q.enqueue(
                user.id,
                portfolioResult.portfolio_processing_request,
                portfolioResult.retry_after
              ).catch(err => console.log(err))

              distributions = distributions.map(distribution => {
                return new DistributionModel({
                  allocations: distribution.allocations,
                  exchange: distribution.exchange,
                  status: 'pending',
                  pid: portfolioResult.portfolio_processing_request
                })
              })

              user.portfolio.lastDistributionRequest = distributions
              user.save()

              return portfolioResult.status
            })
          })
          .catch(err => {
            console.log(err)
            return Promise.reject({
              statusCode: err.statusCode,
              message: err.error.detail
            })
          })
      })
    }

    return Promise.resolve({ statusCode: 400, object: 'User not found' })
  },
  exchanges: {
    add: async (id, exchange) => {
      return ctrl.getById(id).then(user => {
        if (user) {
          if (
            !user.exchanges.some(
              x => x.label.toLowerCase() === exchange.label.toLowerCase()
            )
          ) {
            exchange.label = exchange.label.toLowerCase()
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
  toggleAutorebalancing: async (id) => {
    return ctrl.getById(id).then(user => {
      if (user) {
        user.portfolio.autorebalance = !user.portfolio.autorebalance
        user.save()
        return { statusCode: 200, object: user }
      }
    })
  },
  portfolio: async id => {
    return ctrl.getById(id).then(user => {
      if (user) {
        let statusPromises = []
        user.exchanges.map(exchange => {
          statusPromises.push(tradingClient.status(exchange))
        })

        return Promise.all(statusPromises)
          .then(results => {
            results = results.filter(result => result != null)
            if (results.length > 0) {
              let portfolio = results[0]
              portfolio.pending = user.portfolio
                ? user.portfolio.lastDistributionRequest
                : {}
              return portfolio
            }
            return {}
          })
          .catch(exception => {
            console.log(exception)
            if (
              exception.error &&
              exception.error.detail &&
              exception.error.detail.includes('APIError')
            ) {
              Object.getOwnPropertyNames(exception.options.body)
                .filter(p => p != 'api_key')
                .forEach(exchange => {
                  const exIdx = user.exchanges.findIndex(
                    x => x.label == exchange
                  )
                  user.exchanges[exIdx].credentials.valid = false
                })
              user.save()
            }
            return Promise.reject(exception)
          })
      }
    })
  }
})
