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

exports.reset=()=>{

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

/*
+RESP:GTFRI, ----------------------------0
F18000, ----Protocol version--6----------------------------1
862599050234697, - 15 IMEI----------------------------2
GV350M_HHP,-- Device model----------------------------3
,----External power vcc----------------------------4
51,--Report Id /Report Type----------------------------5
1,---number----------------------------6
1, -- GPS Accuracy----------------------------7
19.9,--speed----------------------------8
157,--Azimuth----------------------------9
3.6,-- Altitube 10----------------------------10
38.094382,---longitude----------------------------11
24.097808,--- Latitude----------------------------12
20230122111247,-- GPS UTC Time YYYYMMDDHHMMSS----------------------------13
0420,---MCC----------------------------14
0001,---MNC----------------------------15
0324,---LAC----------------------------16
7865,--CellID----------------------------17
, --Reserved----------------------------18
0.0,---Milage----------------------------19
,-- Hour Meter Count----------------------------20
,---Analog Input 1----------------------------21
88,---Backup battery percent----------------------------22
220100,---Device Status----------------------------23
,---Reserved----------------------------24
,--Reserved----------------------------25
20230122111248,--- Send Time YYYYMMDDHHM----------------------------26
5797$ -- Counter number Tail Character $----------------------------27
*/

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
