

exports.getAvlDataArr = (strHexBuffer) => {
   try {
      return parseData(strHexBuffer);
   } catch (e) {
      //console.log("Error: ", e);
   }
};

exports.reset=()=>{

};

let ackData = '0002640113BC'; // default response
exports.getResponseData = (recordCount) => {
   if (recordCount >= 1) {
      return ackData;
   }
   return '00';
};

var degug=false;
function parseData(data) {
	var m = new Date(Date.now());
	var dt=m.toLocaleString();
	console.log('Data received:',dt,':3003-Ruptela:',data);
	 let dataArr = [];
   if (!data) {
      return dataArr;
   }
try {
	

//check CRC
    var reccrc=data.substr(data.length-4);	   
	var x=data.substr(4, data.length-8);
	let bufdt = Buffer.from(x, 'hex');
	var datacrc=crc_16_rec(bufdt,bufdt.length);
	if(degug)	
	console.log('CRC CHECK===',datacrc,'---',reccrc);
	if(datacrc!=reccrc)
		return dataArr;
const precision = 0.0000001;

	 
var l=4;
var ll=16;	 
let hexData=data.substr(l, ll);	   
let imei = parseInt(hexData, 16);	
//if(degug)	
	console.log(hexData,'IMEI',imei);

var l=20;
var ll=2;	 
hexData=data.substr(l, ll);	   
let command = parseInt(hexData, 16);	
if(degug)	
	console.log(hexData,'command',command);

var l=24;
var ll=2;	 
let no_of_rechex=data.substr(l, ll);	   
let no_of_rec = parseInt(no_of_rechex, 16);	

//if(degug)	
	console.log(no_of_rechex,'NO OF RECORD',no_of_rec);
var l=26;
var ll=data.length-l-4;	 // 4 CRC
let allRecs=data.substr(l, ll);	   

let reclen=allRecs.length/no_of_rec;

for(let i=0;i<no_of_rec;i++){
	var allRec=allRecs.substr(reclen*i, reclen);
	if(degug)	
	console.log('reclen',reclen,' ',allRec);
var dataJson = {
		imei: 0,
		avltm:0,
		location: {
		type: "Point",
		coordinates: [0,0] //[long, latitude] must be in same order
		},
		alt: 0,
		ang: 0,
		spd: 0,
		odata:3003,
		createdon: new Date().getTime(),
		updatedon: new Date().getTime()
};
dataJson.imei=imei;


		var l=0;
		var ll=8;	 
		hexData=allRec.substr(l, ll);	   
		dataVal = parseInt(hexData, 16);	
		if(degug)	
		console.log(hexData,'Time',dataVal);
		if(dataVal<10000000000)
		dataVal=dataVal*1000;
		dataJson.avltm=dataVal;
		var ex=0;
		if(command==1)
			ex=2;
		else if(command==68)
			ex=0;
		
		var l=14-ex;
		var ll=8;	 
		hexData=allRec.substr(l, ll);
		dataVal = hexToInt(hexData);
		var lng = dataVal*precision;
		if(isNegativeNum(lng)){
		lng = lng *  -1;
		}
		dataJson.location.coordinates[0]=lng;
		if(degug)	
		console.log('lng',hexData,' ',lng);
		
		var l=22-ex;
		var ll=8;	 
		hexData=allRec.substr(l, ll);
		dataVal = hexToInt(hexData);
		var lat = dataVal*precision;
		if(isNegativeNum(lat)){
		lat = lat *  -1;
		}
		dataJson.location.coordinates[1]=lat;
		if(degug)	
		console.log('lat',hexData,' ',lat);
		
		///altitude
		var l=30-ex;
		var ll=4;	 
		hexData=allRec.substr(l, ll);	   
		dataVal = parseInt(hexData, 16)*0.1;	
		dataJson.alt=dataVal.toFixed(2)*1;
		if(degug)	
		console.log('alt',hexData,' ',dataVal);
		//angle
		var l=34-ex;
		var ll=4;	 
		hexData=allRec.substr(l, ll);	   
		dataVal = parseInt(hexData, 16)*0.01;	
		dataJson.ang=dataVal.toFixed(2)*1;
		if(degug)	
		console.log('ang',hexData,' ',dataVal);
		//speed
		var l=40-ex;
		var ll=4;	 
		hexData=allRec.substr(l, ll);	   
		dataVal = parseInt(hexData, 16);	
		dataJson.spd=dataVal;
		if(degug)	
		console.log('spd',hexData,' ',dataVal);
		dataJson.odata=3003;
		if(degug)	
		console.log(dataJson);
		
	dataArr.unshift(dataJson);	
}

ackData = '64'+no_of_rechex; 
let buffData = Buffer.from(ackData, 'hex');
var crc=crc_16_rec(buffData,buffData.length);
ackData='0002'+ackData+crc;
if(degug)	
console.log("=================",ackData);
//ackData = '0002640113BC'; 
//acknowlegement 0002640113BC
return dataArr;	   
	   
   } catch (e) {
      console.error(e);
      //console.log(e.message);
   }
   return dataArr;
}

function crc_16_rec(pucData, ucLen) {
  let usPoly = 0x8408;
  let usCRC = 0;
  for (let i = 0; i < ucLen; i++) {
    usCRC ^= pucData[i];
    for (let ucBit = 0; ucBit < 8; ucBit++) {
      let ucCarry = usCRC & 1;
      usCRC >>= 1;
      if (ucCarry) {
        usCRC ^= usPoly;
      }
    }
  }
 var x=usCRC.toString(16) ;
 while(x.length<4)
	 x='0'+x;
  return x;
}



function hexToInt(hex) {
    if (hex.length % 2 != 0) {
        hex = "0" + hex;
    }
    var num = parseInt(hex, 16);
    var maxVal = Math.pow(2, hex.length / 2 * 8);
    if (num > maxVal / 2 - 1) {
        num = num - maxVal
    }
    return num;
}
function isNegativeNum(x){
   let binary = x.toString(2);
   if(binary.startsWith('0')){ //check first bit
      return true; //-ve
   }
   return false; //+ve
}


