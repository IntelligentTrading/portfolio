var express = require('express')
const PORT = 9991
const server = express().listen(PORT, () =>
  console.log(`Socket listening on ${PORT}`)
)

const io = require('socket.io')(server)

setInterval(() => {
  io.emit('heartbeat', `Emitting heartbeat...`)
}, 20000)

io.on('connection', function (socket) {
  console.log(`User ${socket.handshake.query.user_id} connected`)
  socket.join(socket.handshake.query.user_id)
  io.to(socket.handshake.query.user_id).emit('message', 'Welcome')

  socket.on('disconnect', () => {})
})

module.exports = {
  dispatch: (userId, payload) => {
    io.to(userId).emit('message', payload)
  }
}
