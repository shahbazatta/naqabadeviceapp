
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

exports.reset=()=>{
//  imei = -1;
};


var degug=false;
function parseData(cdata) {
	
	var m = new Date(Date.now());
	var dt=m.toLocaleString();
	console.log('Data received:',dt,':3002-Machinestalk:',cdata);
	 let dataArr = [];
   if (!cdata) {
      return dataArr;
   }
   try {

	   
	const precision = 0.000001;
	var imeistr='';
	var cctstr='';
	let identifierhex1='';
	let imei;
	let recno=0;
	while(cdata.length>0){
	var n1=cdata.indexOf('2a')+2;
	var nn=cdata.indexOf('0d0a',n1)+4;
	var data=cdata.substr(0,nn);
	cdata=cdata.substr(nn);
	//console.log('===',data);
	
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
		 odata:3002,
         createdon: new Date().getTime(),
         updatedon: new Date().getTime()
      };

	 
	  

	
	var l=0;
	var ll=4;
	let str=data.substr(l, ll);	
	if(str=='2424'){//$$ is okay return null
		l=4;
		ll=2;
		
		var identifierhex=data.substr(l, ll);	
		//if(identifierhex1=='')
			identifierhex1=identifierhex;
		let identifier = parseInt(identifierhex, 16);
	    if(degug)
		console.log(identifierhex, 'hex', identifierhex, "IDENTIFIER", identifier);
		if(identifier>=65 && identifier<=122){	//return null
		
		
		    l=data.lastIndexOf('2a')+2;
			let checksum1=data.substr(0,l);
			let cksum = CHECKSUM(checksum1);
			ll=data.indexOf('0d0a',l)-l;
			if(degug)
			console.log("-----",l ,'-',ll);
			let hexcheck=data.substr(l, ll);	
			let rec_cksum=hexttochar(hexcheck);
			
			if(degug)
			console.log("CHECKSUM===",hexcheck ,'-',checksum1);
			
			if(degug)
			console.log("CHECKSUM---", rec_cksum,'-',cksum);// b9 dec-9857 hex-6239
			if(cksum==rec_cksum){// checksum should be equal
		
			l=6;
			ll=data.indexOf('2c',l);
			let str1=data.substr(ll);	
			if(degug)
			console.log(str1,'=====',data.length,'--',ll,'--------',str1,'--',str1.length);
			ll=ll-l;			
			str=data.substr(l, ll);	
			let datalen = hexttochar(str);
			if(degug)
			console.log(str, 'hex', str, "DATALENGTH", datalen);
			
			l=l+ll+2;
			ll=data.indexOf('2c',l)-l;
			imeistr=data.substr(l, ll);	
			imei = hexttochar(imeistr);
			if(degug)
			console.log(imeistr, "IMEI============", imei);
			
			dataJson.imei=parseInt(imei);
			
			
			l=l+ll+2;
			ll=data.indexOf('2c',l)-l;
			cctstr=data.substr(l, ll);	
			let ctype = hexttochar(cctstr);
			
			if(degug)
			console.log(cctstr, 'hex', cctstr, "Command type", ctype);
			
			
			l=l+ll+2;
			ll=8;
			str=data.substr(l, ll);	
			let rec_no = hexttoLengthCal(str);
			if(degug)
			console.log(str, 'hex', str, "remaining cache record=====", rec_no);
			
			
			l=l+ll;
			ll=4;
			str=data.substr(l, ll);	
			let pkt_no = hexttoLengthCal(str);
			if(degug)
			console.log(str, 'hex', str, "Number of data packets====", pkt_no);
			
			l=l+ll;
			ll=4;
			str=data.substr(l, ll);	
			let pkt_len = hexttoLengthCal(str);
			if(degug)
			console.log(str, 'hex', str, "Length of the current data packet===", pkt_len);
			
			l=l+ll;
			ll=4;
			str=data.substr(l, ll);	
			let tot_ids = hexttoLengthCal(str);
			if(degug)
			console.log(str, 'hex', str, "Total number of ID in the current data packet===", tot_ids);
			
			l=l+ll;
			ll=2;
			str=data.substr(l, ll);	
			let one_byte_param_no = hexttoLengthCal(str);
			if(degug)
			console.log(str, 'hex', str, "Number of 1-byte parameter ID", one_byte_param_no);
			
			
			for(let i=0;i<one_byte_param_no;i++){
				l=l+ll;
				ll=4;
				str=data.substr(l, ll);				
				if(degug)
				console.log(str, 'hex', str, "field", str);
			}
			
			l=l+ll;
			ll=2;
			str=data.substr(l, ll);	
			let two_byte_param_no = hexttoLengthCal(str);
			if(degug)
			console.log(str, 'hex', str, "Number of 2-byte parameter ID", two_byte_param_no);
			
			let speed=0; // 08
			let altitude=0;//0b
			let angle=0; // 09
			
			for(let i=0;i<two_byte_param_no;i++){
				l=l+ll;
				ll=6;
				str=data.substr(l, ll);				
				if(degug)
				console.log(str, 'hex', str, "field", str);
				let s=str.substr(0,2);
				let s1=str.substr(2,4);
				
			if(s=='08')
				speed=uInt16(s1);
			else if(s=='09')
				angle=uInt16(s1);
			else if(s=='0b')
				altitude=uInt16(s1);
				
			}
			if(degug)
			console.log(speed, '-', angle,'-' , altitude);
			
			dataJson.spd=speed;
			dataJson.ang=angle;
			dataJson.alt=altitude;
			
			l=l+ll;
			ll=2;
			str=data.substr(l, ll);	
			let four_byte_param_no = hexttoLengthCal(str);
			if(degug)
			console.log(str, 'hex', str, "Number of 4-byte parameter ID", four_byte_param_no);
			
			
			let lat=0; // 02
			let lng=0;//03
			let datetime=0; // 04
			
			for(let i=0;i<four_byte_param_no;i++){
				l=l+ll;
				ll=10;
				str=data.substr(l, ll);				
				if(degug)
				console.log(str, 'hex', str, "field", str);
				let s=str.substr(0,2);
				let s1=str.substr(2,8);
				
			if(s=='02')
				lat=uInt32(s1)*precision;
			else if(s=='03')
				lng=uInt32(s1)*precision;
			else if(s=='04')
				datetime=uInt16(s1)+946684804;//+946708560;
				if(datetime<10000000000)
				datetime=datetime*1000;

				
			}
			if(degug)
			console.log(lat, '-', lng,'-' , datetime);
			dataJson.location.coordinates[1]=lat;
			dataJson.location.coordinates[0]=lng;
			dataJson.avltm=datetime;
			dataArr.unshift(dataJson);
			recno++;
			if(degug)
			console.log(dataJson);
		 }
		}
	
	
	
	
	
	}
	
	//break;
	}
	
	
	let ack='';
	ack+='2c';
	ack+=imeistr;///imei
	ack+='2c';
	ack+=cctstr;// cc type
	ack+='2c';
	ack+=chartohex(''+recno)+'2a';//
	
	ack='4040'+'53'+'3237'+ack;//identifierhex1
	ack=ack+chartohex(CHECKSUM(ack))+'0d0a';
	if(degug)
		console.log("ACKNOWLEDGEMENT===",ack);
	ackData=ack;//hexttochar(ack)+'\r\n';
	//46+8=54/2=27 3237
	//40406732372c3836373639383034333336353630332c4346462c2a45370d0a
console.log("IMEI",imei,' REC NO: ',recno);//CHECKSUM(chartohex('@@S27,867698040889019,CFF,9*'))
	
   } catch (e) {
      console.error(e);
      if(degug)
		console.log(e.message);
   }
  return dataArr;
}

function CHECKSUM(hexstring) {
	if(hexstring==null || hexstring=='' || hexstring.length<2)
		return '00';
	//console.log('---',hexstring);
   let s = hexstring.match(/../g);
    let sum = 0;
   //if(s!=null){
  
   s.forEach(function (hexbyte) {
      let n = 1 * ('0x' + hexbyte); // convert hex to number
      sum += n;
   });
  //}
   sum = (sum & 0xff).toString(16);
   if (sum.length % 2)
      sum = '0' + sum;
   return sum.toUpperCase();
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
function hexttochar(dhex){
	let len=dhex.length/2;
	let hch='';
	for(let ii=0;ii<len; ii+=1){
		hch+=String.fromCharCode(parseInt(dhex.substr(ii*2,2),16));
	}
	
	return hch;

}


function hexttoLengthCal(dhex){
	let len=dhex.length;
	let hch=0;
	for(let ii=0;ii<len-1; ii+=2){
		hch+=parseInt(dhex.substr(ii,2),16);
	}
	
	return hch;

}
function chartohex(dch){
let hch='';
let len=dch.length;
	for(let ii=0;ii<len; ii+=1){
	hch+=dch.charCodeAt(ii).toString(16);
	}
	return hch;
}

