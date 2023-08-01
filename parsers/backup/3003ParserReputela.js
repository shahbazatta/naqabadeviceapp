/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 25/1/23
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
      return '01'; // ackowlegemenet for 1 record         no_of_rec ==1
   }
   if (recordCount > 1) {
      return '02'; // ackowlegemenet for 2 or more record      no_of_rec>=2
   }
   return '01';
};

/**********
 * Reputela Device data parser for port 3003
 * @param data
 * @returns {*}
 */

/*
03d3  --- 979 -- DATA LENGTH
0003166d66ca0d72 -- 869084061896050 -- IMEI
44 -- 68 COMMAND ID
01 --1 REcord Left
08 -- 8 NUMBER of record  1966
63cf5d9200000017c4b6860cbb6a490a3437d20d00000b000710019901008202008600008700008800000200002024000300000400000500019501019601001b1f00ad0000b00001a201080083000000890078008b0078001600db02300000001700dc001d4999001e10850200410000005200960000a41100
63cf5e0a00000017c4b6860cbb6a490a7537d20f00000a000710019901008202008600008700008800000200002024000300000400000500019501019601001b1f00ad0000b00001a201080083000000890078008b0078001600dd02300000001700dd001d499f001e10850200410000005200960000a41100
63cf5e8200000017c4b6860cbb6a490a7137d20d00000a000710019901008202008600008700008800000200002024000300000400000500019501019601001b1f00ad0000b00001a201080083000000890078008b0078001600db02300000001700db001d4998001e10850200410000005200960000a41100
63cf5efa00000017c4b6860cbb6a490a7737d210000009000710019901008202008600008700008800000200002024000300000400000500019501019601001b1f00ad0000b00001a201080083000000890078008b0078001600de02300000001700dc001d499f001e10860200410000005200960000a41100
63cf5f7200000017c4b6860cbb6a490a9e37d21000000a000710019901008202008600008700008800000200002023000300000400000500019501019601001b1f00ad0000b00001a201080083000000890078008b0078001600dc02300000001700db001d499f001e10860200410000005200960000a41100
63cf5fea00000017c4b6860cbb6a490a5f37d20e00000a000710019901008202008600008700008800000200002023000300000400000500019501019601001b0000ad0000b00001a200080083000000890078008b0078001600db02300000001700de001d4994001e10860200410000005200960000000000
63cf606200000017c4b6860cbb6a490a7c37d21100000a000710019901008202008600008700008800000200002023000300000400000500019501019601001b1f00ad0000b00001a201080083000000890078008b0078001600dd02300000001700dd001d4998001e10850200410000005200960000a41100
63cf60da00000017c4b6860cbb6a490a7a37d21100000b000710019901008202008600008700008800000200002023000300000400000500019501019601001b1f00ad0000b00001a201080083000000890078008b0078001600de02300000001700dd001d499e001e10850200410000005200960000a41100
be62 --- 48738 ----CRC 16


63cf5d92  --time
00 -- time extention
00 --priority
00
17c4b686
0cbb6a49
0a34   ---- alt .1
37d2   ----- angle .01
0d    ------ satelite
0000  ----- speed
0b000710019901008202008600008700008800000200002024000300000400000500019501019601001b1f00ad0000b00001a201080083000000890078008b0078001600db02300000001700dc001d4999001e10850200410000005200960000a41100

4,16,2,2,2
"DATA LENGTH","IMEI","COMMAND ID","REcord Left","NUMBER of record","ALL RECORDS","CRC 16",
// each record like
8,2,2,2,8,8,4,4,2,4
"TIME","Time extension","Record extension","priority","lng","lat","alt 0.1","angle .01","satelite","speed"


*/
function parseData(data) {
   console.log("Data received: ", data);
   let dataArr = [];
   if (!data) {
      return dataArr;
   }
   try {
      const precision = 0.0000001;
      let dataJson = {
         imei: 0,
         avltm: 0,
         location: {
            type: "Point",
            coordinates: [0, 0] //[long, latitude] must be in same order
         },
         alt: 0,
         ang: 0,
         spd: 0,
         odata: '',
         createdon: Date.now(),
         updatedon: Date.now(),
         resp:'0002640113BC'
      };

      let l = 4;
      let ll = 16;
      let hexData = data.substr(l, ll);
      let dataVal = parseInt(hexData, 16);
      console.log(hexData, 'IMEI', dataVal);
      dataJson.imei = dataVal;

      l = 24;
      ll = 2;
      hexData = data.substr(l, ll);
      let no_of_rec = parseInt(hexData, 16);
      console.log(hexData, 'NO OF RECORD', no_of_rec);
      l = 26;
      ll = data.length - l - 4;	 // 4 CRC
      let allRec = data.substr(l, ll);
     // allRec = parseInt(allRec);
      //console.log('RECORD',allRec);
      //no_of_rec in loop

      //8,2,2,2,8,8,4,4,2,4  "TIME", "Time extension", "Record extension", "priority", "lng", "lat", "alt 0.1", "angle .01", "satelite", "speed"
      for (let i = 0; i < 1; i++) {
         l = 0;
         ll = 8;
         hexData = allRec.substr(l, ll);
         dataVal = parseInt(hexData, 16);
         console.log(hexData, 'Time', dataVal);
         dataJson.avltm = dataVal;

         l = 14;
         ll = 8;
         hexData = allRec.substr(l, ll);
         dataVal = hexToInt(hexData);
         let lng = dataVal * precision;
         if (isNegativeNum(lng)) {
            lng = lng * -1;
         }
         dataJson.location.coordinates[0] = lng;

         l = 22;
         ll = 8;
         hexData = allRec.substr(l, ll);
         dataVal = hexToInt(hexData);
         let lat = dataVal * precision;
         if (isNegativeNum(lat)) {
            lat = lat * -1;
         }
         dataJson.location.coordinates[1] = lat;

         ///altitude
         l = 30;
         ll = 4;
         hexData = allRec.substr(l, ll);
         dataVal = parseInt(hexData, 16) * 0.1;
         dataJson.alt = dataVal;
         //angle
         l = 34;
         ll = 4;
         hexData = allRec.substr(l, ll);
         dataVal = parseInt(hexData, 16) * 0.01;
         dataJson.ang = dataVal;
         //speed
         l = 40;
         ll = 4;
         hexData = allRec.substr(l, ll);
         dataVal = parseInt(hexData, 16);
         dataJson.spd = dataVal;
         dataJson.odata = 3003;

         console.log(dataJson);
         dataArr.push(dataJson);
      }

   } catch (e) {
      console.error(e.message, e);
   }
   return dataArr;
}


function hexToInt(hex) {
   if (hex.length % 2 != 0) {
      hex = "0" + hex;
   }
   let num = parseInt(hex, 16);
   let maxVal = Math.pow(2, hex.length / 2 * 8);
   if (num > maxVal / 2 - 1) {
      num = num - maxVal
   }
   return num;
}

function isNegativeNum(x) {
   let binary = x.toString(2);
   if (binary.startsWith('0')) { //check first bit
      return true; //-ve
   }
   return false; //+ve
}


// let deviceData = "03d30003166d66ca0d7244010863cf5d9200000017c4b6860cbb6a490a3437d20d00000b000710019901008202008600008700008800000200002024000300000400000500019501019601001b1f00ad0000b00001a201080083000000890078008b0078001600db02300000001700dc001d4999001e10850200410000005200960000a4110063cf5e0a00000017c4b6860cbb6a490a7537d20f00000a000710019901008202008600008700008800000200002024000300000400000500019501019601001b1f00ad0000b00001a201080083000000890078008b0078001600dd02300000001700dd001d499f001e10850200410000005200960000a4110063cf5e8200000017c4b6860cbb6a490a7137d20d00000a000710019901008202008600008700008800000200002024000300000400000500019501019601001b1f00ad0000b00001a201080083000000890078008b0078001600db02300000001700db001d4998001e10850200410000005200960000a4110063cf5efa00000017c4b6860cbb6a490a7737d210000009000710019901008202008600008700008800000200002024000300000400000500019501019601001b1f00ad0000b00001a201080083000000890078008b0078001600de02300000001700dc001d499f001e10860200410000005200960000a4110063cf5f7200000017c4b6860cbb6a490a9e37d21000000a000710019901008202008600008700008800000200002023000300000400000500019501019601001b1f00ad0000b00001a201080083000000890078008b0078001600dc02300000001700db001d499f001e10860200410000005200960000a4110063cf5fea00000017c4b6860cbb6a490a5f37d20e00000a000710019901008202008600008700008800000200002023000300000400000500019501019601001b0000ad0000b00001a200080083000000890078008b0078001600db02300000001700de001d4994001e1086020041000000520096000000000063cf606200000017c4b6860cbb6a490a7c37d21100000a000710019901008202008600008700008800000200002023000300000400000500019501019601001b1f00ad0000b00001a201080083000000890078008b0078001600dd02300000001700dd001d4998001e10850200410000005200960000a4110063cf60da00000017c4b6860cbb6a490a7a37d21100000b000710019901008202008600008700008800000200002023000300000400000500019501019601001b1f00ad0000b00001a201080083000000890078008b0078001600de02300000001700dd001d499e001e10850200410000005200960000a41100be62";
// console.log('deviceData length', deviceData.length);
// let res = parseData(deviceData);
// console.log('result', res);
