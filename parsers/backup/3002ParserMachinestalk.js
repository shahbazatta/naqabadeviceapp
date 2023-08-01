/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 27/11/22
 ***************************/

exports.getAvlDataArr = (strHexBuffer) => {
   try {
      return parseData(strHexBuffer);
   } catch (e) {
      console.error("Error: ", e);
   }
};

/**********
 * Machinestalk Device dara parser for port 3002
 * @param data
 * @returns {*}
 */

function parseData(data) {
   let dataArr = [];
   if (!data) {
      return dataArr;
   }
   try {
      console.log("Data received: ", data);
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
         odata: 3002,
         createdon: Date.now(),
         updatedon: Date.now()
      };

      var l = 0;
      var ll = 4;
      let str = data.substr(l, ll);
      if (str == '2424') {//$$ is okay
         l = 4;
         ll = 2;
         let str = data.substr(l, ll);
         let identifier = parseInt(str, 16);
         console.log(str, 'hex', str, "IDENTIFIER", identifier);
         if (identifier >= 71 && identifier <= 122) {
            l = 6;
            ll = data.indexOf('2c', l) - l;
            str = data.substr(l, ll);
            let datalen = hexttochar(str);
            console.log(str, 'hex', str, "DATALENGTH", datalen);


            l = l + ll + 2;
            ll = data.indexOf('2c', l) - l;
            str = data.substr(l, ll);
            let imei = hexttochar(str);
            console.log(str, 'hex', str, "IMEI", imei);
            dataJson.imei = parseInt(imei);

            l = l + ll + 2;
            ll = data.indexOf('2c', l) - l;
            str = data.substr(l, ll);
            let ctype = hexttochar(str);
            console.log(str, 'hex', str, "Command type", ctype);


            l = l + ll + 2;
            ll = 8;
            str = data.substr(l, ll);
            let rec_no = hexttoLengthCal(str);
            console.log(str, 'hex', str, "remaining cache record", rec_no);


            l = l + ll;
            ll = 4;
            str = data.substr(l, ll);
            let pkt_no = hexttoLengthCal(str);
            console.log(str, 'hex', str, "Number of data packets", pkt_no);

            l = l + ll;
            ll = 4;
            str = data.substr(l, ll);
            let pkt_len = hexttoLengthCal(str);
            console.log(str, 'hex', str, "Length of the current data packet", pkt_len);

            l = l + ll;
            ll = 4;
            str = data.substr(l, ll);
            let tot_ids = hexttoLengthCal(str);
            console.log(str, 'hex', str, "Total number of ID in the current data packet", tot_ids);

            l = l + ll;
            ll = 2;
            str = data.substr(l, ll);
            let one_byte_param_no = hexttoLengthCal(str);
            console.log(str, 'hex', str, "Number of 1-byte parameter ID", one_byte_param_no);


            for (let i = 0; i < one_byte_param_no; i++) {
               l = l + ll;
               ll = 4;
               str = data.substr(l, ll);
               console.log(str, 'hex', str, "field", str);
            }

            l = l + ll;
            ll = 2;
            str = data.substr(l, ll);
            let two_byte_param_no = hexttoLengthCal(str);
            console.log(str, 'hex', str, "Number of 2-byte parameter ID", two_byte_param_no);

            let speed = 0; // 08
            let altitude = 0;//0b
            let angle = 0; // 09

            for (let i = 0; i < two_byte_param_no; i++) {
               l = l + ll;
               ll = 6;
               str = data.substr(l, ll);
               console.log(str, 'hex', str, "field", str);
               let s = str.substr(0, 2);
               let s1 = str.substr(2, 4);

               if (s == '08')
                  speed = uInt16(s1);
               else if (s == '09')
                  angle = uInt16(s1);
               else if (s == '0b')
                  altitude = uInt16(s1);

            }
            console.log(speed, '-', angle, '-', altitude);

            dataJson.spd = speed;
            dataJson.ang = angle;
            dataJson.alt = altitude;

            l = l + ll;
            ll = 2;
            str = data.substr(l, ll);
            let four_byte_param_no = hexttoLengthCal(str);
            console.log(str, 'hex', str, "Number of 4-byte parameter ID", four_byte_param_no);


            let lat = 0; // 02
            let lng = 0;//03
            let datetime = 0; // 04

            for (let i = 0; i < four_byte_param_no; i++) {
               l = l + ll;
               ll = 10;
               str = data.substr(l, ll);
               console.log(str, 'hex', str, "field", str);
               let s = str.substr(0, 2);
               let s1 = str.substr(2, 8);

               if (s == '02')
                  lat = uInt32(s1);
               else if (s == '03')
                  lng = uInt32(s1);
               else if (s == '04')
                  datetime = uInt32(s1);

            }
            console.log(lat, '-', lng, '-', datetime);
            const precision = 0.000001;
            dataJson.location.coordinates[0] = lng * precision;
            dataJson.location.coordinates[1] = lat * precision;
	    dataJson.avltm = datetime;

         }

      }
      console.log(dataJson);
      dataArr.push(dataJson);
   } catch (e) {
      console.error(e.message,e);
   }
   return dataArr;
}

function parseRecord(rec) {

}

function uInt32(dhex) {
   var data = dhex.match(/../g);
   var buf = new ArrayBuffer(4);
   var view = new DataView(buf);
   data.forEach(function (b, i) {
      view.setUint8(i, parseInt(b, 16));
   });
   var num = view.getInt32(0, 1);
   return num;
}

function uInt16(dhex) {
   var data = dhex.match(/../g);
   var buf = new ArrayBuffer(4);
   var view = new DataView(buf);
   data.forEach(function (b, i) {
      view.setUint8(i, parseInt(b, 16));
   });
   var num = view.getInt32(0, 1);
   return num;
}

function hexttochar(dhex) {
   let len = dhex.length;
   let hch = '';
   for (let ii = 0; ii < len - 1; ii += 2) {
      hch += String.fromCharCode(parseInt(dhex.substr(ii, 2), 16));
   }

   return hch;

}


function hexttoLengthCal(dhex) {
   let len = dhex.length;
   let hch = 0;
   for (let ii = 0; ii < len - 1; ii += 2) {
      hch += parseInt(dhex.substr(ii, 2), 16);
   }

   return hch;

}


let deviceData = "2424643134352c3836373639383034333936323230312c4343452c0100000001006f00170006012305000600071814001b00070800000900000a00000b000019a0011a9205290000070200000000030000000004b6745d2b0c000000000d6bb801001c0d0087654204000000030e0ca4010100960604d6a50608004b0a010107464444204c5445fe6e0803000100000000002a39310d0a";
console.log('deviceData length', deviceData.length);
let res = parseData(deviceData);
console.log('result', res);
