const io = require('socket.io')(9991)
//const PORT = 9991

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
