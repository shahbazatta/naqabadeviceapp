/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 21/1/23
 ***************************/

module.exports = class ResponseWriter {

   constructor(client, rinfo) {
      this.client = client;
      this.rinfo = rinfo;
   }

   write(data, type = 'hex') {
      if (data != undefined)
         try {
            this.client.send(Buffer.from(data.toString(), type), this.rinfo.port, this.rinfo.address, function (err, bytes) {
               if (err) {
                  throw err;
               }
            });
         } catch (e) {
            console.info('unable to send response to', this.rinfo.address, this.rinfo.port);
            console.error(e);
         }
   }
};