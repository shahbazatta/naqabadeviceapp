/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 30/12/22
 ***************************/
const net = require('net');
const reqCtrl = require('./controllers/tcpRequestController');

const PORT = 4005;
const HOST = '127.0.0.1';
let sockets = []; //connections list


const server = net.createServer();
server.listen(PORT, HOST, () => {
   console.log('TCP Server is running on port ' + PORT + '.');
   reqCtrl.loadParser(PORT);
});


server.on('connection', (sock) => {
   console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
   sockets.push(sock);
   console.log('live connections', sockets.length);
   reqCtrl.resetParser(); // reset IMEI if required
   sock.on('data', (msg) => {
      console.log('DATA ' + sock.remoteAddress + ': ', msg.toString('hex'));
      //Write the data back to all the connected, the client will receive it as data from the server
      try {
         console.log('Received %d bytes from %s : %d\n', msg.length, sock.remoteAddress, sock.remotePort);
         //handle device request
         reqCtrl.handleRequest(sock, msg.toString('hex'));
      } catch (e) {
         console.error(e);
      }
   });
// Add a 'close' event handler to this instance of socket
   sock.on('close', (data) => {
      let index = sockets.findIndex(function (o) {
         return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
      });
      if (index !== -1) sockets.splice(index, 1);
      console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
      console.log('live connections', sockets.length)
   });
});

