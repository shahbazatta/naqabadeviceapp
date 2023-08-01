/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 29/12/22
 ***************************/

const dgram = require('dgram');
const dataCtrl = require('./controllers/dataController');
const server = dgram.createSocket('udp4');
const PORT = 3000;

server.on('listening',function(){
   let address = server.address();
   //var port = address.port;
   console.log('Server is listening at ',address);
});
//====== if data received
server.on('message',function(msg,rinfo){
   console.log('Data received at port : ',PORT , msg);
   try{
    parseData(msg);
/*     var line;

  if (/\ufffd/.test(msg) === true) {

    line = msg.toString('hex');

  } else {

    line = msg.toString();

  }

  const parser=new Parser(line);

  //send response to the device

  const response = "0005" + line.substr(4, 8) + line.substr(48, 2);

  var resBuffer = new Buffer(response);

  server.send(resBuffer, 0, resBuffer.length, rinfo.port, rinfo.address, function (err, bytes) {

    if (err) {

      throw err;

    }

  }); */
   }catch(e){
     console.log(e);
   }
   console.log('Received %d bytes from %s : %d\n',msg.length, rinfo.address, rinfo.port);
//   dataCtrl.saveData(msg.toString('hex'));
});
//====== if an error occurs
server.on('error',function(error){
   console.log('Error: ' + error);
   server.close();
});

server.bind(PORT);

function parseData(dataBuffer){
   let length = dataBuffer.length
   let d= dataBuffer.toString('hex');
   console.log('data string: ',d)
}
