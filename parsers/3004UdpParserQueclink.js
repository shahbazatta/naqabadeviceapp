

exports.getAvlDataArr = (strHexBuffer) => {
   try {
      return parseData(strHexBuffer);
   } catch (e) {
      //console.log("Error: ", e);
   }
};

let ackData = '00'; // default response
exports.getResponseData = (recordCount) => {
   if (recordCount >= 1) {
      return ackData;
   }
   return '00';
};
//Queclink parser port 3004
var degug=false;
function parseData(data) {
	 let dataArr = [];
   if (!data) {
      return dataArr;
   }
   try {
	   
	var m = new Date(Date.now());
	var dt=m.toLocaleString();
	//console.log('Data received:',dt,':3004-Queclink:',data);
	   
	let len=data.length;
	var l=0;
	var ll=2;
	var gpsdata='';
	for(let i=0;i<len;i+=ll){
	let str=data.substr(l, ll);	
	str=String.fromCharCode(parseInt(str, 16));
	l+=ll;
	gpsdata+=str;
	}
	//if(degug)
	console.log('Data received:',dt,':3004-Queclink:',gpsdata);
//+RESP:GTCAN
	const protocols = ['+RESP:GTTOW', '+RESP:GTEPS', '+RESP:GTDIS','+RESP:GTIOB','+RESP:GTFRI', '+RESP:GTSPD', '+RESP:GTSOS','+RESP:GTPNL', '+RESP:GTRTL', '+RESP:GTDOG', '+RESP:GTAIS', '+RESP:GTIGL',
	'+RESP:GTHBM', '+RESP:GTGES',  '+RESP:GTGIN', '+RESP:GTGOT', '+RESP:GTLBC', '+RESP:GTIDA','+BUFF:GTTOW', '+BUFF:GTEPS', '+BUFF:GTDIS','+BUFF:GTIOB','+BUFF:GTFRI', '+BUFF:GTSPD', '+BUFF:GTSOS','+BUFF:GTPNL', '+BUFF:GTRTL', '+BUFF:GTDOG', '+BUFF:GTAIS', '+BUFF:GTIGL','+BUFF:GTHBM', '+BUFF:GTGES',  '+BUFF:GTGIN', '+BUFF:GTGOT', '+BUFF:GTLBC', '+BUFF:GTIDA'];//,  '+RESP:GTSTT'
	const protocols_2 = [ '+RESP:GTERI','+BUFF:GTERI'];//,  '+RESP:GTSTT'
	const protocols_3 = [  '+BUFF:GTPPF', '+BUFF:GTSTC', '+BUFF:GTBPL', '+BUFF:GTIGN', '+BUFF:GTIDN', '+BUFF:GTIDF', '+BUFF:GTGSS', '+BUFF:GTSTR', '+BUFF:GTSTP', '+BUFF:GTLSP', '+BUFF:GTFLA', '+BUFF:GTDOS', '+BUFF:GTCRA', '+BUFF:GTTMP', '+BUFF:GTUPC', '+BUFF:GTGPJ',  '+BUFF:GTRMD', '+BUFF:GTEXP', '+BUFF:GTCLT', '+BUFF:GTASC', '+RESP:GTPPF', '+RESP:GTSTC', '+RESP:GTBPL', '+RESP:GTIGN', '+RESP:GTIDN', '+RESP:GTIDF', '+RESP:GTGSS', '+RESP:GTSTR', '+RESP:GTSTP', '+RESP:GTLSP', '+RESP:GTFLA', '+RESP:GTDOS', '+RESP:GTCRA', '+RESP:GTTMP', '+RESP:GTUPC', '+RESP:GTGPJ', '+RESP:GTRMD', '+RESP:GTEXP', '+RESP:GTCLT', '+RESP:GTASC'];//,  '+RESP:GTSTT'
	const protocols_4 = [ '+RESP:GTCAN','+BUFF:GTCAN'];//,  '+RESP:GTSTT'
	//const protocols_5= [ '+RESP:GTOBD','+BUFF:GTOBD'];//,  '+RESP:GTSTT'
	const protocols_6= [ '+RESP:GTBTC','+BUFF:GTBTC'];//,  '+RESP:GTSTT'
	var fileds = gpsdata.split(",");
	//+RESP:GTTOW, +RESP:GTEPS, +RESP:GTDIS , +RESP:GTIOB,  +RESP:GTFRI, +RESP:GTSPD, +RESP:GTSOS
	//+RESP:GTPNL, +RESP:GTRTL, +RESP:GTDOG, +RESP:GTAIS, +RESP:GTIGL,
	//+RESP:GTHBM, +RESP:GTGES, +RESP:GTERI,  +RESP:GTGIN, +RESP:GTGOT, +RESP:GTLBC, +RESP:GTIDA
	
	let arr_pos=[0,1,2,3,-1,-1,6,-1,8,9,10,11,12,13];
	if(protocols_2.includes(fileds[0])){
		arr_pos=[0,1,2,3,-1,-1,7,-1,9,10,11,12,13,14];
	}else if(protocols.includes(fileds[0])){
		arr_pos=[0,1,2,3,-1,-1,6,-1,8,9,10,11,12,13];
	}else if(protocols_3.includes(fileds[0])){
		arr_pos=[0,1,2,3,-1,-1,5,-1,6,7,8,9,10,11];
	}else if(protocols_4.includes(fileds[0])){
		arr_pos=[0,1,2,3,-1,-1,8,-1,30,31,32,33,34,35];
	}
	//else if(protocols_5.includes(fileds[0])){
		//arr_pos=[0,1,2,3,-1,-1,10,-1,26,27,28,29,30,31];
//	}
	else if(protocols_6.includes(fileds[0])){
		arr_pos=[0,1,2,3,-1,-1,4,-1,5,6,7,8,9,10];
	}else{
  //	if(degug)
	console.log("NOT SAVED DATA: ",gpsdata);
	return dataArr;
	}
	//0,1,2,3,6,26,27
//	if(degug)
	//console.log("=========",fileds[0],'--',fileds.length);
	
	var pro=fileds[0].split(":");
	var flen=fileds.length
	
	let ack='+ACK:'+pro[1]+','+fileds[arr_pos[1]]+','+fileds[arr_pos[2]]+','+fileds[arr_pos[3]]+','+fileds[arr_pos[6]]+','+fileds[flen-2]+','+fileds[flen-1];
   	ackData=chartohex(ack);
	if(degug)
	console.log("=========",ack,'--',ackData);
   var date = new Date(fileds[arr_pos[13]].replace(
    /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
    '$4:$5:$6 $2/$3/$1'
));

   	console.log("IMEI === ",fileds[arr_pos[2]]);	

   
    let dataJson = {
         imei: parseInt(fileds[arr_pos[2]]),
         avltm: Math.floor(date),
         location: {
            type: "Point",
            coordinates: [parseFloat(fileds[arr_pos[11]]),parseFloat(fileds[arr_pos[12]])] //[long, latitude] must be in same order
         },
         alt: parseInt(fileds[arr_pos[10]]),
         ang: parseInt(fileds[arr_pos[9]]),
         spd: parseFloat(fileds[arr_pos[8]]),
		 odata:3004,
         createdon: new Date().getTime(),
         updatedon: new Date().getTime()
      };
	  dataArr.push(dataJson);
	

	
	   return dataArr;
	   
   } catch (e) {
      console.error(e);
	  if(degug)
      console.log(e.message);
   }
   return dataArr;
}
function chartohex(dch){
let hch='';
let len=dch.length;
	for(let ii=0;ii<len; ii+=1){
	hch+=dch.charCodeAt(ii).toString(16);
	}
	return hch;
}


