/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 23/1/23
 ***************************/

exports.getAvlDataArr = (strHexBuffer) => {
   try {
      return parseData(strHexBuffer);
   } catch (e) {
      console.error("Error: ", e);
   }
};


function parseData(data) {
   let dataArr = [];
   if (!data) {
      return dataArr;
   }
   try {
      console.log('Data Received:',data);
      let len = data.length;
      let l = 0;
      let ll = 2;
      let gpsdata = '';
      for (let i = 0; i < len; i += ll) {
         let str = data.substr(l, ll);
         str = String.fromCharCode(parseInt(str, 16));
         l += ll;
         gpsdata += str;
      }
    //  console.log(gpsdata);
      let fileds = gpsdata.split(",");
      if (fileds[0] != '+RESP:GTFRI')
         return null;


      let date = new Date(fileds[13].replace(
         /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
         '$4:$5:$6 $2/$3/$1'
      ));
      let dataJson = {
         imei: parseInt(fileds[2]),
         avltm: Math.floor(date / 1000),
         location: {
            type: "Point",
            coordinates: [parseFloat(fileds[11]), parseFloat(fileds[12])] //[long, latitude] must be in same order
         },
         alt: parseInt(fileds[10]),
         ang: parseInt(fileds[9]),
         spd: parseFloat(fileds[8]),
         odata: 3004,
         createdon: Date.now(),
         updatedon: Date.now()
      };

      console.log(dataJson);
      dataArr.push(dataJson);
   } catch (e) {
      console.error(e.message, e);
   }
   return dataArr;
}


// let deviceData = "2b524553503a47544652492c4631383030302c3836323539393035303233343639372c47563335304d5f4848502c2c35312c312c312c31392e392c3135372c332e362c33382e3039343338322c32342e3039373830382c32303233303132323131313234372c303432302c303030312c303332342c373836352c2c302e302c2c2c38382c3232303130302c2c2c32303233303132323131313234382c3537393724";
// console.log('deviceData length', deviceData.length);
// let res = parseData(deviceData);
// console.log('result', res);
