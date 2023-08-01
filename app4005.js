/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 29/12/22
 ***************************/

const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const reqCtrl = require('./controllers/udpRequestController');

const PORT = 4005;

server.on('listening', () => {
   let address = server.address();
   //let port = address.port;
   console.log('Server is listening at ', address);
   reqCtrl.loadParser(PORT);
});
//====== if data received
server.on('message', function (msg, rinfo) {
   console.log('Data received at port : ', PORT, msg);
   console.log('Received %d bytes from %s : %d\n', msg.length, rinfo.address, rinfo.port);
   try {
      reqCtrl.handleRequest(server, rinfo, msg.toString('hex'));
   } catch (e) {
      console.error(e);
   }

});

//====== if an error occurs
server.on('error', function (error) {
   console.error('Error: ' , error);
   server.close();
});

server.bind(PORT);
