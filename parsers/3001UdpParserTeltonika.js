

exports.getAvlDataArr = (strHexBuffer) => {
   try {
      return parseData(strHexBuffer);
   } catch (e) {
      console.log("Error: ", e);
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
 * Teltonika Device dara parser for port 3001
 * @param data
 * @returns {*}
 */

 
var degug=false;
function parseData(data) {
	var m = new Date(Date.now());
	var dt=m.toLocaleString();
	console.log('Data received:',dt,':3001-Teltonika:',data);
	
	  let dataArr = [];
   if(!data){
      return dataArr;
   }
   try {
	   
	   const precision = 0.0000001;
      
	  
	   
	  var ack='';
      //4,4,2,2,4
      let l = 0;
	  let ll = 4;
      let hexData = data.substr(l, ll);
      let dataVal = parseInt(hexData, 16);
	  ack+='0005';
      l += ll;
	  ll = 4;
      hexData = data.substr(l, ll);
      dataVal = parseInt(hexData, 16);
	   ack+=hexData;
      l += ll;
	  ll = 2;
      hexData = data.substr(l, ll);
      dataVal = parseInt(hexData, 16);
	   ack+=hexData;
	  l += ll;
	  ll = 2;
      hexData = data.substr(l, ll);
      dataVal = parseInt(hexData, 16);
	   ack+=hexData;
	  l += ll;
	  ll = 4;
      hexData = data.substr(l, ll);
      dataVal = parseInt(hexData, 16);
	  
	  l += ll;
	  ll = dataVal*2;
      hexData = data.substr(l, ll);
      //let imei = parseInt(hexData, 16);
	  let imei = ''
      for(let i=1;i<hexData.length;i+=2){
         imei += hexData.charAt(i);
      }
	 // if(degug)
	  console.log(hexData,'IMEI',imei*1);
	  
	  l += ll;
	  ll = 2;
      hexData = data.substr(l, ll);
      let codecval = parseInt(hexData, 16);// CODEC 8 abd 8E
	  
	  l += ll;
	  ll = 2;
      let  noofrec = data.substr(l, ll);
      let no_of_rec=parseInt(noofrec, 16);
	  
	  //if(degug)
	  console.log(hexData,'NUMBER OF RECORD ',no_of_rec);
	  
	  
	  
	l += ll;
	ll=data.length-l-2;	 // 1 byte no of rec 4 CRC
	let allRecs=data.substr(l, ll);	 

	let reclen=allRecs.length/no_of_rec;
if(degug)	
	console.log('RECORD LEN ',reclen);
var allRec=allRecs;//.substr(reclen*i, reclen);
	for(let i=0;i<no_of_rec;i++){

	if(degug)	
	console.log('RECORD',allRec);
	var dataJson = {
         imei: imei*1,
         avltm: 0,
         location: {
            type: "Point",
            coordinates: [] //[long, latitude] must be in same order
         },
         alt: 0,
         ang: 0,
         spd: 0,
		 odata:3001,
         createdon: new Date().getTime(),
         updatedon: new Date().getTime()
      };
	  

 
	//timestamp,priority,longitude,latitude,altitude,angle,satelite,speed
	l=0;
	ll=16;	 
	hexData=allRec.substr(l, ll);	   
	dataVal = parseInt(hexData, 16);	
	if(degug)
	console.log(hexData,'Time',dataVal);
			if(dataVal<10000000000)
			dataVal=dataVal*1000;

	dataJson.avltm=dataVal;
	l=l+ll;
	ll=2;	// priority
	l=l+ll;
	ll=8;	
	hexData=allRec.substr(l, ll);
	dataVal = parseInt(hexData, 16);
	var lng = dataVal*precision;
	if(isNegativeNum(lng)){
	lng = lng *  -1;
	}
	dataJson.location.coordinates[0]=lng;
	l=l+ll;
	ll=8;	
	hexData=allRec.substr(l, ll);
	dataVal = parseInt(hexData, 16);
	var lat = dataVal*precision;
	if(isNegativeNum(lat)){
	lat = lat *  -1;
	}
	dataJson.location.coordinates[1]=lat;
	
	l=l+ll;
	ll=4;	
	hexData=allRec.substr(l, ll);
	dataVal = parseInt(hexData, 16);
	dataJson.alt=dataVal;
	l=l+ll;
	ll=4;	
	hexData=allRec.substr(l, ll);
	dataVal = parseInt(hexData, 16);
	dataJson.ang=dataVal;
	l=l+ll;
	ll=2;	// satelite
	hexData=allRec.substr(l, ll);
	dataVal = parseInt(hexData, 16);
	
	l=l+ll;
	ll=4;	
	hexData=allRec.substr(l, ll);
	dataVal = parseInt(hexData, 16);
	dataJson.spd=dataVal;
	dataArr.push(dataJson);
	if(degug)	
	console.log(dataJson);
	
	if(codecval==8){
	l=l+ll;
	ll=2;
	
	l=l+ll;

	hexData=allRec.substr(l, ll);
	let total_ids=parseInt(hexData, 16);
	//console.log("xxxx==",hexData,'--',total_ids);
	
	let byte1_ids=0;
	let byte2_ids=0;
	let byte4_ids=0;
	let byte8_ids=0;
	if(total_ids>0){
	l=l+ll;

	hexData=allRec.substr(l, ll);
	byte1_ids = parseInt(hexData, 16);
	//console.log("xxxx==",hexData,'--',byte1_ids);
	l=l+ll+byte1_ids*4;
	}
	if(byte1_ids<total_ids){
	
	
	hexData=allRec.substr(l, ll);
	byte2_ids = parseInt(hexData, 16);
	//console.log("xxxx==",hexData,'--',byte2_ids);
	l=l+ll+byte2_ids*6;
	}
	if(byte1_ids+byte2_ids<total_ids){
	

	hexData=allRec.substr(l, ll);
	byte4_ids = parseInt(hexData, 16);
	//console.log("xxxx==",hexData,'--',byte4_ids);
	l=l+ll+byte4_ids*10;
	
	}
	
	if(byte1_ids+byte2_ids+byte4_ids<total_ids){
		
	hexData=allRec.substr(l, ll);
	byte8_ids = parseInt(hexData, 16);
	l=l+ll+byte8_ids*16;
	//console.log("xxxx==",hexData,'--',byte4_ids);
	}
	
	
	l=l+2;

	
	allRec=allRec.substr(l);
	
	
	
	
	}else if(codecval==142){//4,4,4*(4+1*2), 4// 6,8,12,20
				l=l+ll;
				ll=4;

				l=l+ll;
				
				hexData=allRec.substr(l, ll);
				let total_ids=parseInt(hexData, 16);
				//console.log("xxxx==",hexData,'--',total_ids);

				let byte1_ids=0;
				let byte2_ids=0;
				let byte4_ids=0;
				let byte8_ids=0;
				if(total_ids>0){
				l=l+ll;
	
				hexData=allRec.substr(l, ll);
				byte1_ids = parseInt(hexData, 16);
				//console.log("xxxx==",hexData,'--',byte1_ids);
				l=l+ll+byte1_ids*6;
				}
				if(byte1_ids<total_ids){


				hexData=allRec.substr(l, ll);
				byte2_ids = parseInt(hexData, 16);
				//console.log("xxxx==",hexData,'--',byte2_ids);
				l=l+ll+byte2_ids*8;
				}
				if(byte1_ids+byte2_ids<total_ids){


				hexData=allRec.substr(l, ll);
				byte4_ids = parseInt(hexData, 16);
				//console.log("xxxx==",hexData,'--',byte4_ids);
				l=l+ll+byte4_ids*12;

				}

				if(byte1_ids+byte2_ids+byte4_ids<total_ids){

				hexData=allRec.substr(l, ll);
				byte8_ids = parseInt(hexData, 16);
				l=l+ll+byte8_ids*20;
				//console.log("xxxx==",hexData,'--',byte4_ids);
				}


				l=l+4;


				allRec=allRec.substr(l);
	
	}

}
	  

     //*********** ACKNOWLEDGEMENT*************
     ackData=ack+''+noofrec;
    if(degug)	
	console.log(ackData);
	 //*******************************
   } catch (e) {
      console.error(e);
      console.log(e.message);
   }
    return dataArr;
}

function isNegativeNum(x){
   let binary = x.toString(2);
   if(binary.startsWith('0')){ //check first bit
      return true; //-ve
   }
   return false; //+ve
}
