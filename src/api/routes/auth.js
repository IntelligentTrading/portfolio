let router = require('express').Router()
const userCtrl = require('../controllers/users')
const resolver = require('../util/resolver')

router.get('/serviceStatus', (req, res) => {
  resolver(Promise.resolve('Healthy!'), res)
})

router.post('/login', (req, res) => {
  resolver(userCtrl.authenticate(req.body), res)
})

router.get('/register/confirm/:signupToken', (req, res) => {
  resolver(userCtrl.confirm(req.params.signupToken), res)
})

router.post('/register', (req, res) => {
  resolver(userCtrl.create(req.body), res)
})

router.post('/forgot', (req, res) => {
  resolver(userCtrl.forgot(req.body), res)
})

router.put('/reset/:token', (req, res) => {
  resolver(userCtrl.reset(req.params.token, req.body.newPassword), res)
})

module.exports = router
