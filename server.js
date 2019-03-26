const express = require('express')
const router = express.Router()
const app = express()
const boot = require('./boot')
const fs = require('fs')
const morgan = require('morgan')
const enforce = require('express-sslify')
var jwt = require('jsonwebtoken')

app.use(enforce.HTTPS({ trustProtoHeader: true }))

require('./database').connect()
boot(app)

app.use(morgan('dev'))
app.use(express.static('public'))

const apiRouterFiles = fs.readdirSync('./src/api/routes')
apiRouterFiles.forEach(rf => {
  const route = `/api/${rf.replace('.js', '')}`
  app.use(route, validateToken, require(`./src/api/routes/${rf}`))
})

app.listen(app.get('port'), function () {
  console.log('Listening on ' + app.get('port'))
})

module.exports = app

function validateToken (request, response, next) {
  if (!request.baseUrl.startsWith('/api/auth')) {
    let token = request.headers['authorization']
    if (token && token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length)
      if (token.length <= 0) {
        return response
          .status(401)
          .send({ success: false, message: 'Malformed bearer token' })
      } else {
        jwt.verify(token, process.env.JWT_SECRET, function (error, decoded) {
          if (error) {
            return response
              .status(401)
              .send({ success: false, error: 'Invalid authorization token' })
          }
          else next()
        })
      }
    } else {
      return response
        .status(401)
        .send({ success: false, message: 'Missing authorization header' })
    }
  } else {
    next()
  }
}
