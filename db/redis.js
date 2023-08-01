/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 31/3/23
 ***************************/
const redis = require('redis');
const conString = 'redis://192.168.11.221:6379';
const redisSecret = 'nQabA@2023';

const redisClient = redis.createClient({
   url: conString
});
redisClient.connect();
redisClient.on('error', err => console.log('Redis error: ', err.message));
redisClient.on('connect', () => console.log('Connected to redis server'));
module.exports = redisClient;
