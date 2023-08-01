/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 21/1/23
 ***************************/

exports.getAvlDataArr = (strHexBuffer) => {
   return parseData(strHexBuffer);
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


/***
 * this is default parser it should not have any logic of parsing avl data
 * @param data
 */
function parseData(data) {
   console.log(data);
   return []; //empty data array
}
