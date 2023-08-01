/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 21/1/23
 ***************************/

module.exports = class ResponseWriter {

   constructor(client) {
      this.client = client;
   }

   write(data, type = 'hex') {
      if (data != undefined)
         try {
            this.client.write(Buffer.from(data), type, this.client.remoteAddress, this.client.remotePort, function (err, bytes) {
               if (err) {
                  throw err;
               }
            });
         } catch (e) {
            console.info('unable to send response to', this.client.remoteAddress, this.client.remotePort);
            console.error(e);
         }
   }
};
