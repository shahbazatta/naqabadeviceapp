const dbCon = require("../db/conn");

exports.saveData = (avlDataArr, resp) => {
   try {
      if (!avlDataArr || avlDataArr.length < 1) {
         console.log('Unable to save data');
         resp.write(0x0);//send failed
         return;
      }
      let record = avlDataArr[0];
      if (!record.imei) {
         console.log('ignoring invalid record', record);
         resp.write(0x1);//send ok
         return;
      }
      let responseData = record.resp;
      delete record.resp ;
      dbCon.gpsLive.updateOne({imei: record.imei.toString()}, {$set: {data:record}}, {upsert: true})
         .catch(e => {
            console.error(e);
         });
      
      dbCon.gpsHistory.insertMany(avlDataArr)
         .then(data => {
            console.log('avl data saved successfully',avlDataArr);
            resp.write(responseData?responseData:1);//send ok
         }).catch(e => {
         console.error(e);
      });

   } catch (e) {
      console.error("Error: ", e);
   }

};
