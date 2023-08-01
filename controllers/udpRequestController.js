/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 29/1/23
 ***************************/
const dataCtrl = require('./dbController');
const Writer = require('./udpResponseWriter');
const portMapper = require('../mapper/portMapper');
const parserType = 'Udp';
let dataParser;

exports.loadParser = (port) => {
   let mappedPort = portMapper.getPortMapper()[port];
   let parserName = portMapper.getDataParser(mappedPort, parserType);
   dataParser = require('.' + parserName);
};

exports.handleRequest = (sock, rinfo, inputHexData) => {
   let errResponse = '00';
   let respWriter = new Writer(sock, rinfo);
   let avlDataArr = dataParser.getAvlDataArr(inputHexData);
   if (!avlDataArr || avlDataArr.length < 1) {
      console.log('Unable to save data, sending error response', errResponse);
      respWriter.write(errResponse);//send failed
      return;
   }
   let record = avlDataArr[0];
   if (!record.imei) {
      console.log('ignoring invalid record', record);
      respWriter.write(errResponse);//send failed
   }
   dataCtrl.saveData(avlDataArr).then(result => {
      console.log('avl data saved successfully');
      let response = dataParser.getResponseData(avlDataArr.length);
      if (response) {
         console.log('sending response to device', response);
         respWriter.write(response, 'hex');
      } else {
         console.log('sending response to device', '00');
         respWriter.write(errResponse);
      }
   }).catch(e => {
      console.error(e,inputHexData);
      respWriter.write(errResponse);
   });
};
