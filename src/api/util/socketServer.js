var express = require('express')
const PORT = 9991
const server = express().listen(PORT, () =>
  console.log(`Socket listening on ${PORT}`)
)

const io = require('socket.io')(server)

io.on('connection', function (socket) {
  socket.join(socket.handshake.query.user_id)
  io.to(socket.handshake.query.user_id).emit('message', 'Welcome')

  socket.on('disconnect', () => {})
})

module.exports = {
  dispatch: (userId, payload) => {
    io.to(userId).emit('message', payload)
  }
}
