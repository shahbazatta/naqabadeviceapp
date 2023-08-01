/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 29/1/23
 ***************************/
const dbCon = require("../db/conn");
const redis = require("../db/redis");

exports.saveData = (avlDataArr) => {
   let record = avlDataArr[0];
   let coordinates = record.location.coordinates;
   let longitude = coordinates[0], latitude = coordinates[1];
   let promise = new Promise((resolve, reject) => {
      if (longitude > 180 || longitude < -180 || latitude > 90 || latitude < -90) {
//         console.error('Out of range values', longitude, latitude);
         reject('long, lat out of range values ' + longitude + " " + latitude);
         return;
      }
      this.getGeoFenceInfo(coordinates[0], coordinates[1]).then(result => {
         record.pt = result;
         dbCon.gpsLive.updateOne({imei: record.imei.toString()}, {$set: {data: record}}, {upsert: true});
         checkAndUpdateLastGeoFence(record);
         dbCon.gpsHistory.insertMany(avlDataArr)
            .then(data => {
               resolve(data);
            }).catch(e => {
            reject(e);
         });
      });
   });

   return promise;
};

/**
 * Redis Key to Save and Fetch data of pt for an IMEI
 * @type {string}
 */
const RedImeiKey = "IMEI";
const RedTimeKey = "TIME";

/**
 * Check and Save Record only if geo fence changed
 * @param record
 */
async function checkAndUpdateLastGeoFence(record) {
   try {
      if (record && record.pt && record.imei) {
         let KEY = record.imei.toString();
         let geoL = await redis.hGet(RedImeiKey, KEY);
         let time = await redis.hGet(RedTimeKey, KEY);
         let geoC = record.pt;
         console.log('Key', KEY, 'geoLast', geoL, 'geoCurrent', geoC);
         if (geoC.toString() === "" || (geoL && geoL.toString() === geoC.toString())) {
            return; // same
         } else {
            //store previous geo fence for finding the path
            if (geoL) {
               record.lpt = geoL.split(',');// convert back to array from string
            } else {
               record.lpt = []; // no previous record at this du is 0 & no lpt
            }
            let len = record.lpt.length;
            for (let i = 0; i < len; ++i) {
               if (record.pt.indexOf(record.lpt[i]) > -1) {
                  return; //skip this geo fence, no need to save it
               }
            }
            //update redis cache for latest geofence

            console.log('Saving Key', KEY, 'geoC', geoC);
            //Store last geo fence
            redis.hSet(RedImeiKey, KEY, geoC.toString());
            //Store last entry time
            redis.hSet(RedTimeKey, KEY, record.updatedon.toString());
            if (!time) {
               record.du = 0;
               record.lpttm = 0;
            } else {
               let previousTime = parseInt(time); //previous geofence entry time
               record.du = record.updatedon - previousTime;
               record.lpttm = previousTime;
            }

            dbCon.busRouts.insertOne(record).catch(e => {
               console.error('unable to save data changed geo fence data', e);
            });
         }
      }
   } catch (e) {
      console.error('while saving data change for geo fence', e, 'data', record);
   }
}

/********
 This API returns the geo fence / location for any given coordinate
 */
exports.getGeoFenceInfo = async (longitude, latitude) => {

   try {
      if (!longitude || isNaN(longitude) || !latitude || isNaN(latitude)) {
         console.error('Invalid lat,long values', latitude, longitude);
         return
      }
      if (longitude > 180 || longitude < -180 || latitude > 90 || latitude < -90) {
         console.error('Out of range values', latitude, longitude);
         return;
      }
      longitude = parseFloat(longitude);
      latitude = parseFloat(latitude);
   } catch (e) {
      console.error('Invalid request inputs');
      return;
   }
   let query = {
      geometry: {
         $geoIntersects: {
            $geometry: {
               type: 'Point',
               coordinates: [longitude, latitude]
            }
         }
      }
   };
   let data = dbCon.geoFences.find(query, {_id: 0, 'attributes.Code_ID': 1, 'properties.Code_ID': 1});
   let records = [];
   let prop;
   await data.forEach(r => {
      prop = r.properties || r.attributes;
      if (prop) {
         records.push(prop.Code_ID);
      }
   });

   return records;
};

