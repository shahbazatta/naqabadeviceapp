/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 27/11/22
 ***************************/

exports.getAvlDataArr = (strHexBuffer) => {
   try {
      return parseData(strHexBuffer);
   } catch (e) {
      console.log("Error: ", e);
   }
};

/**********
 * BCE Device dara parser for port 3000
 * @param data
 * @returns {*}
 */


function parseData(data) {
   let dataArr = [];
   if (!data) {
      return dataArr;
   }
   try {

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
         odata: 3000,
         createdon: Date.now(),
         updatedon: Date.now()
      };


      console.log("Data received: ", data);
      //IMEI
      var l = 0;
      var ll = 16;
      let str = data.substr(l, ll);
      let hexData = getHexData(str);
      let dataVal = parseInt(hexData, 16);
      //console.log(str, 'hex', hexData, "IMEI", dataVal);
      dataJson.imei = dataVal;


      var l = 16;
      var ll = 4;
      str = data.substr(l, ll);
      hexData = getHexData(str);
      dataVal = parseInt(hexData, 16);
      //console.log(str, 'hex', hexData, "DATA LENGTH", dataVal);

      var l = 20;
      var ll = 2;
      str = data.substr(l, ll);
      dataVal = parseInt(str, 16);
      //console.log(str, 'hex', str, "AsynckStack", dataVal);


      var l = 22;
      var ll = 2;
      str = data.substr(l, ll);
      dataVal = parseInt(str, 16);
      //console.log(str, 'hex', str, "Confimration Key", dataVal);


      var l = 24;
      var ll = 2;
      str = data.substr(l, ll);
      let reclen = parseInt(str, 16);
      //console.log(str, 'hex', str, "structure len", reclen);


      var ll = reclen * 2;
      var l = 26;
      while (true) {
         let rec = data.substr(l, ll);

         var i = 0;
         var ii = 8;
         var recstr1 = rec.substr(i, ii);
         var recstr = recstr1.substr(0, 1) + '' + recstr1.substr(2, 8);
         hexData = getHexData(recstr);
         dataVal = parseInt(hexData, 16) * 2 + parseInt('47798280', 16);
         //console.log(recstr1, 'hex', hexData, "Time", dataVal);
         dataJson.avltm = dataVal;

         i = 8;
         ii = 4;
         while (true) {
            recstr1 = rec.substr(i, ii);
            hexData = getHexData(recstr1);
            dataVal = hex2bin(hexData);
            console.log(recstr1, 'hex', hexData, "MASK", dataVal);
            i = i + ii;
            if (dataVal.startsWith('0'))
               break
         }
         ii = 34;
         let gps = rec.substr(i, ii);
         console.log('GPS', gps);

         i = 0;
         ii = 8;
         recstr1 = gps.substr(i, ii);
         hexData = getHexData(recstr1);
         dataVal = HexToFloat32(hexData);
         //console.log(recstr1, 'hex', hexData, "LONGITUDE", dataVal);
         dataJson.location.coordinates[0] = dataVal;

         i = 8;
         ii = 8;
         recstr1 = gps.substr(i, ii);
         hexData = getHexData(recstr1);
         dataVal = HexToFloat32(hexData);
         //console.log(recstr1, 'hex', hexData, "LATITUDE", dataVal);
         dataJson.location.coordinates[1] = dataVal;

         i = 16;
         ii = 2;
         recstr1 = gps.substr(i, ii);
         hexData = getHexData(recstr1);
         dataVal = parseInt(hexData, 16);
         //console.log(recstr1, 'hex', hexData, "SPEED", dataVal);
         dataJson.spd = dataVal;

         i = 18;
         ii = 2;
         recstr1 = gps.substr(i, ii);
         hexData = getHexData(recstr1);
         dataVal = parseInt(hexData, 16);
         //console.log(recstr1, 'hex', hexData, "COURSE", dataVal);
         dataJson.ang = dataVal;

         i = 20;
         ii = 2;
         recstr1 = gps.substr(i, ii);
         hexData = getHexData(recstr1);
         dataVal = parseInt(hexData, 16);
         //console.log(recstr1, 'hex', hexData, "Altitude", dataVal);
         dataJson.alt = dataVal;
         //if(rec.length<ll)
         break;
         //else{
         //	parseRecord(rec);
         //	l=l+ll;
         //}
      }

      dataArr.push(dataJson);
   } catch (e) {
      console.error(e.message, e);
   }
   return dataArr;
}


function getHexData(token) {
   if (token.length <= 2) {
      return token;
   }
   let hexData = '';
   for (let i = token.length; i >= 1; i -= 2) {
      hexData += token.substring(i - 2, i)
   }
   return hexData;
}


function hex2bin(hex) {
   hex = hex.replace("0x", "").toLowerCase();
   let out = "";
   for (let c of hex) {
      switch (c) {
         case '0':
            out += "0000";
            break;
         case '1':
            out += "0001";
            break;
         case '2':
            out += "0010";
            break;
         case '3':
            out += "0011";
            break;
         case '4':
            out += "0100";
            break;
         case '5':
            out += "0101";
            break;
         case '6':
            out += "0110";
            break;
         case '7':
            out += "0111";
            break;
         case '8':
            out += "1000";
            break;
         case '9':
            out += "1001";
            break;
         case 'a':
            out += "1010";
            break;
         case 'b':
            out += "1011";
            break;
         case 'c':
            out += "1100";
            break;
         case 'd':
            out += "1101";
            break;
         case 'e':
            out += "1110";
            break;
         case 'f':
            out += "1111";
            break;
         default:
            return "";
      }
   }

   return out;
}

const HexToFloat32 = (str) => {
   let int = parseInt(str, 16);
   if (int > 0 || int < 0) {
      let sign = int >>> 31 ? -1 : 1;
      let exp = ((int >>> 23) & 0xff) - 127;
      let mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
      let float32 = 0;
      for (let i = 0; i < mantissa.length; i += 1) {
         float32 += parseInt(mantissa[i]) ? Math.pow(2, exp) : 0;
         exp--;
      }
      return float32 * sign;
   } else return 0;
};

// console.log('length',"416712aee18ac0ffc2078044009288772f4e10a40103a20a59a900390000000000000000000000000000000000000000000000000000000000000000000000000000".length)
// let deviceData = "9b427a25121003004b02a5df2667797de28b40e82a1e42cc4dc341001c2b730200000000d0806d6ccf0fa401035311c1a3004326577a7de28b40e82a1e42cc4dc341001c2b730200000000d0804a6ccf0fa401035311c3a3004426477b7de28b40e82a1e42cc4dc341001c2b730200000000d080156ccf0fa401035311c3a3004426377c7de28b40e82a1e42cc4dc341001c2b730200000000d080386ccf0fa401035311c3a3004726277d7de28b40e82a1e42cc4dc341001c2b730200000000d0806d6ccf0fa401035311c3a3004726177e7de28b40e82a1e42cc4dc341001c2b730200000000d0802f6ccf0fa401035311c3a3004726077f7de28b40e82a1e42cc4dc341001c2b730200000000d080386ccf0fa401035311c3a3004726f77f7de28b40e82a1e42cc4dc341001c2b730200000000d0801e6ccf0fa401035311c1a3004426e7807de28b40e82a1e42cc4dc341001c2b730200000000d080156ccf0fa401035311c1a3003e26d7817de28b40e82a1e42cc4dc341001c2b730200000000d0802f6ccf0fa401035311c1a3003e26c7827de28b40e82a1e42cc4dc341001c2b730200000000d0802f6ccf0fa401035311c1a3003e26b7837de28b40e82a1e42cc4dc341001c2b730200000000d0806d6ccf0fa401035311c1a3003e26a7847de28b40e82a1e42cc4dc341001c2b730200000000d080386cce0fa401035311c1a3003c2697857de28b40e82a1e42cc4dc341001c2b730200000000d0802f6ccf0fa401035311c1a3003f2687867de28b40e82a1e42cc4dc341001c2b730200000000d080656ccf0fa401035311c1a3003f98";
// console.log('deviceData length',deviceData.length);
// let res=parseData(deviceData);
// console.log('result',res);
