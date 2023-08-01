/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 27/11/22
 ***************************/


exports.getAvlDataArr = (strHexBuffer) => {
   try {
      return parseData(strHexBuffer);
   } catch (e) {
      //console.log("Error: ", e);
   }
};

let ackData = '01'; // default response
exports.getResponseData = (recordCount) => {
   if (recordCount >= 1) {
      return ackData;
   }
   return '00';
};

/**********
 * BCE Device dara parser for port 3000
 * @param data
 * @returns {*}
 */

var degug=false;
function parseData(data) {
	var m = new Date(Date.now());
	var dt=m.toLocaleString();
	console.log('Data received:',dt,':3000-BCE:',data);
   let dataArr = [];
   if (!data) {
      return dataArr;
   }
   try {
	   var tm=0;
      //IMEI 8, 2, 1,1, 1(length)
      var l = 0;
      var ll = 16;
      let imeistr = data.substr(l, ll);
      let hexData = getHexData(imeistr);
      let imei = parseInt(hexData, 16);
     //if(degug)
	 console.log(imeistr, 'hex', hexData, "IMEI", imei);


      l = 16;
      ll = 4;
      let str = data.substr(l, ll);
      hexData = getHexData(str);
      let dataVal = parseInt(hexData, 16);
	  if(degug)
      console.log(str, 'hex', hexData, "DATA LENGTH", dataVal);

      l = 20;
      ll = 2;
      str = data.substr(l, ll);
      dataVal = parseInt(str, 16);
      if(degug)
	  console.log(str, 'hex', str, "AsynckStack", dataVal);

      l = 22;
      ll = 2;
      str = data.substr(l, ll);
      let confimkey = parseInt(str, 16);
	  if(degug)
      console.log(str, 'hex', str, "Confimration Key", confimkey);

  
	  l=l+2;
	  var z=0;
	  while (true) {
	  z++;
	  ll=2;
	  str = data.substr(l, ll);
      var reclen = parseInt(str, 16);
	  if(degug)
      console.log(str, 'hex', str, "structure len", reclen);
	  l=l+ll;
	  ll=reclen*2;
		  
	  let rec = data.substr(l, ll);
	  if(degug)
	  console.log(reclen, 'hex', rec, "-", rec.length);
         if (rec.length < ll)
            break;
		else{
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
			
			
            dataJson.imei = imei;
			var i = 0;
            var ii = 8;
            var recstr1 = rec.substr(i, ii);
            var recstr = recstr1.substr(0, 1) + '' + recstr1.substr(2, 8);
            hexData = getHexData(recstr);
            dataVal = parseInt(hexData, 16) * 2 + parseInt('47798280', 16);
			if(degug)
            console.log(recstr1, 'hex', hexData, "Time", dataVal);
			if(dataVal<10000000000)
			dataVal=dataVal*1000;
            dataJson.avltm = dataVal;
			
			
			 i = 8;
            ii = 4;
            var isgps = 0;
            var count = 0;
			var o=0;
            while (true) {
               recstr1 = rec.substr(i, ii);
               hexData = getHexData(recstr1);
               dataVal = hex2bin(hexData);
               //console.log(recstr1, 'hex', hexData, "MASK", dataVal);
               i = i + ii;
               if (count == 0) {
                  if (dataVal.endsWith('1'))
                     isgps = 1;
               }
               count++;
               if (dataVal.startsWith('0'))
                  break;

               o++;
               if(o>10)
               	break;

            }

            if (isgps == 1) {
			 ii = 34;
               let gps = rec.substr(i, ii);
               if(degug)
			   console.log('GPS', gps);
			   i = 0;
               ii = 8;
               recstr1 = gps.substr(i, ii);
               hexData = getHexData(recstr1);
               dataVal = HexToFloat32(hexData);
             //  //console.log(recstr1, 'hex', hexData, "LONGITUDE", dataVal);
               dataJson.location.coordinates[0] = dataVal;

               i = 8;
               ii = 8;
               recstr1 = gps.substr(i, ii);
               hexData = getHexData(recstr1);
               dataVal = HexToFloat32(hexData);
              // //console.log(recstr1, 'hex', hexData, "LATITUDE", dataVal);
               dataJson.location.coordinates[1] = dataVal;

               i = 16;
               ii = 2;
               recstr1 = gps.substr(i, ii);
               hexData = getHexData(recstr1);
               dataVal = parseInt(hexData, 16);
               ////console.log(recstr1, 'hex', hexData, "SPEED", dataVal);
               dataJson.spd = dataVal;

               i = 18;
               ii = 2;
               recstr1 = gps.substr(i, ii);
               hexData = getHexData(recstr1);
               dataVal = parseInt(hexData, 16)*2;
               ////console.log(recstr1, 'hex', hexData, "COURSE", dataVal);
               dataJson.ang = dataVal;

               i = 20;
               ii = 2;
               recstr1 = gps.substr(i, ii);
               hexData = getHexData(recstr1);
               dataVal = parseInt(hexData, 16);
              // //console.log(recstr1, 'hex', hexData, "Altitude", dataVal);
               dataJson.alt = dataVal;
			   //dataArr.pop();
			   if(isValidData(dataJson)){
				   if(tm<dataJson.avltm){
					   tm=dataVal;
					dataArr.unshift(dataJson);
				   }
				   else{
					dataArr.push(dataJson);
				   }
			   }
			   if(degug)
			  console.log(dataJson);
			   
			}
			
			
			
			
			
			
		
		}
		l=l+ll;
		//console.log('========',l);
		if(l>=data.length || z>100)
		break;
	  }
	  
    

      //////////////////*********/////////////////////////////////
      //Acknowlegement
	  var ckey=bitwiseand(confimkey,127).toString(16);
	  //console.log(ckey.toString(16), 'ckey');
      let ack = imeistr + '0200' + '19'+ckey;
      ack = ack + CHECKSUM(ack);
      ackData = ack;
	  if(degug)
      console.log(ack, 'ack');
      //////////////////*********////////////////////////////////
	  

   } catch (e) {
      console.error(e);
      //console.log(e.message);
   }
   return dataArr;
}

function isValidData(data){
	if(data.imei!=null && (''+data.imei).length==15){
		if(data.location.coordinates[0]!=null && data.location.coordinates[1]>10 && data.location.coordinates[1]<36 && data.location.coordinates[0]>28 && data.location.coordinates[0]<70)
		return true;
	}
return false;
}

function bitwiseand(a,b) {
	var x=a & b;
	if (x<10)
      x = '0' + x;
	return x;
}

function CHECKSUM(hexstring) {

   let s = hexstring.match(/../g);
   let sum = 0;
   s.forEach(function (hexbyte) {
      let n = 1 * ('0x' + hexbyte); // convert hex to number
      sum += n;
   });
   sum = (sum & 255).toString(16);
   if (sum.length % 2)
      sum = '0' + sum;
   return sum;
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

