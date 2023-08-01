/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 29/1/23
 ***************************/
const dataCtrl = require('./dbController');
const Writer = require('./tcpResponseWriter');
const portMapper = require('../mapper/portMapper');

let dataParser;

function loadParser(port) {
   let mappedPort = portMapper.getPortMapper()[port];
   let parserName = portMapper.getDataParser(mappedPort);
   return require('.'+parserName);
}

exports.handleRequest = (PORT, sock, inputHexData) => {
   if (!dataParser) {
      dataParser = loadParser(PORT);
   }
   let respWriter = new Writer(sock);
   let avlDataArr = dataParser.getAvlDataArr(inputHexData);
   if (!avlDataArr || avlDataArr.length < 1) {
      console.log('Unable to save data');
      respWriter.write('01', 'hex');//send failed
      return;
   }
   dataCtrl.saveData(avlDataArr).then(result => {
      console.log('avl data saved successfully');
      let response = dataParser.getResponseData(avlDataArr.length);
      if (response) {
         console.log('sending response to device', response);
         respWriter.write(response,'hex');
      } else {
         console.log('sending response to device', '00');
         respWriter.write('00', 'hex');
      }
   }).catch(e => {
      console.error(e);
      respWriter.write('00', 'hex');
   });
}
