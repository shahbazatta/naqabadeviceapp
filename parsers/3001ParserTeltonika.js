/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 9/1/23
 ***************************/

exports.getAvlDataArr = (strHexBuffer) => {
   try {
      return parseData(strHexBuffer);
   } catch (e) {
      console.error("Error: ", e);
   }
};

exports.getResponseData = (recordCount) => {
   if (recordCount == 1) {
      return '00000001'; // ackowlegemenet for 1 record  	no_of_rec ==1
   }
   if (recordCount > 1) {
      return '00000002'; // ackowlegemenet for 2 or more record      no_of_rec>=2
   }
   return '00';
};

function parseData(data) {
   let dataArr = [];
   if (!data) {
      return dataArr;
   }
   try {
      const precision = 0.0000001;
      //console.log("Data received: ",data);
      let len = [4, 4, 2, 2, 4, -1, 2, 2, 16, 2, 8,8, 4,4,2,4];// last 0 is for extra
      // let key = ["Data length", "packet identification", "packet type", "packet id", "IMEI length",
      //    "IMEI", "Codec id", "Number of record", "Timestamp", "Priority", "Longitude", "Latitude",
      //    "Altitude", "Angle", "Visible sattelites", "speed"];


      let dataJson = {
         imei: '',
         avltm: 0,
         location: {
            type: "Point",
            coordinates: [] //[long, latitude] must be in same order
         },
         alt: 0,
         ang: 0,
         spd: 0,
         odata:3001,
         createdon: Date.now(),
         updatedon: Date.now()
      };

      // reading data
      let l = 0;
      let hexData = data.substr(l, len[0]);
      let dataVal = parseInt(hexData, 16);
      //dataJson.dl = dataVal;
      l += len[0];
      //
      hexData = data.substr(l, len[1]);
      dataVal = parseInt(hexData, 16);
      //dataJson.pi = dataVal;
      l += len[1];
      //
      hexData = data.substr(l, len[2]);
      dataVal = parseInt(hexData, 16);
      // dataJson.pt = dataVal;
      l += len[2];
      //
      hexData = data.substr(l, len[3]);
      dataVal = parseInt(hexData, 16);
      //dataJson.pid = dataVal;
      l += len[3];
      //
      hexData = data.substr(l, len[4]);
      dataVal = parseInt(hexData, 16);
      // dataJson.imei = dataVal;
      l += len[4];
      if (len[(4 + 1)] < 0) {
         len[4 + 1] = dataVal*2; //imei length 30 chars
      }
      //
      //hexData = data.substr(l, len[5]);
      let imeiData = data.substr(l, len[5]);
      hexData = ''
      for(let i=1;i<imeiData.length;i+=2){
         hexData += imeiData.charAt(i);
      }
      //dataVal = BigInt(parseInt(hexData, 16)).toString();
      dataJson.imei = hexData;
      console.log(hexData,'IMEI',dataVal)
      l += len[5];
      //
      console.log('l = ',l)
      hexData = data.substr(l, len[6]);
      dataVal = parseInt(hexData, 16);
      console.log(hexData,'cid',dataVal)
      //dataJson.cid = dataVal;
      l += len[6];
      hexData = data.substr(l, len[7]);
      dataVal = parseInt(hexData, 16);
      //dataJson.nr = dataVal;
      console.log(hexData,'nr',dataVal)
      l += len[7];
      //
      hexData = data.substr(l, len[8]);
      dataVal = parseInt(hexData, 16);
      dataJson.avltm = dataVal;
      console.log(hexData,'time',dataVal)
      console.log('time',new Date(dataVal))
      l += len[8];
      //
      hexData = data.substr(l, len[9]);
      dataVal = parseInt(hexData, 16);
      //dataJson.p = dataVal;
      console.log(hexData,'p',dataVal)
      l += len[9];
      //
      hexData = data.substr(l, len[10]);
      dataVal = parseInt(hexData, 16);
      console.log(hexData,'lat',dataVal)
      let latitude = dataVal*precision;
      l += len[10];
      //
      hexData = data.substr(l, len[11]);
      dataVal = parseInt(hexData, 16);
      console.log(hexData,'long',dataVal)
      let longitude = dataVal*precision;
      // store coordinates
      if(isNegativeNum(longitude)){
         longitude = longitude * -1;
      }
      if(isNegativeNum(latitude)){
         latitude = latitude *  -1;
      }
      dataJson.location.coordinates = [latitude,longitude]; // here latitude contains longitude value so changed it
      l += len[11];
      //
      hexData = data.substr(l, len[12]);
      dataVal = parseInt(hexData, 16);
      dataJson.alt = dataVal;
      l += len[12];
      //
      hexData = data.substr(l, len[13]);
      dataVal = parseInt(hexData, 16);
      dataJson.ang = dataVal;
      l += len[13];
      //
      hexData = data.substr(l, len[14]); //sattelite
      dataVal = parseInt(hexData, 16);
      //dataJson.spd = dataVal;
      l += len[14];
      hexData = data.substr(l, len[15]);
      dataVal = parseInt(hexData, 16);
      dataJson.spd = dataVal;
      console.log(hexData,'speed',dataVal)
      //l += len[14];
      console.log("\n");
      console.log(dataJson);
      dataArr.push(dataJson);
   } catch (e) {
      console.error(e.message, e);
   }
   return dataArr;
}


/*
Note:
To determine if the coordinate is negative, convert it to binary format and check the very rst bit. If it is 0, coordinate is positive, if it is 1, coordinate is
negative.
 */
function isNegativeNum(x){
   let binary = x.toString(2);
   if(binary.startsWith('0')){ //check first bit
      return true; //-ve
   }
   return false; //+ve
}


// let data = "0072cafe0102000f3335303534343530343934333931340802000001858d55499800000000000000000000000000000000000603ef010101716403424afc4310240900570000000001858d50b5b800000000000000000000000000000000000603ef010101716303424afc431015090057000002"
// data = "00cccafe0103000f3335303534343530343934333931340804000001858d5b06580017c47e880cbb7622010f0113050002000603ef010101716403424afc4310320900570000000001858d59e16000000000000000000000000000000000000603ef010101716403424afc43102d0900570000000001858d55499800000000000000000000000000000000000603ef010101716403424afc4310240900570000000001858d50b5b800000000000000000000000000000000000603ef010101716303424afc431015090057000004"
// parseData(data)