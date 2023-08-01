/**************************
 * Description:
 * @Author: Mohammad Idris
 * @Created On: 21/1/23
 ***************************/
const glob = require("glob");
const PARSER_PATH = './parsers/';

exports.getPortMapper = function () {
   const portMapping = {
      4000: 3000, // BCE
      4001: 3001, // Teltonika
      4002: 3002, // Machinestalk
      4003: 3003,
      4004: 3004,
      4005: 3005,
      4006: 3006,
      4007: 3007,
      4008: 3008,
      4009: 3009   // continue new port entries here
   };
   return portMapping;
};

exports.getDataParser = function (port, parserType) {
   let files = glob.sync(`${PARSER_PATH + port + parserType}Parser*`);
   if (files.length < 1) {
      console.log("No parser found for port", port);
      files = glob.sync(`${PARSER_PATH}defaultParser*`);
   }
   console.log("parser found", files[0]);
   return files[0]; // return first matched parser
};

//for testing add . in path at begning
//this.getDataParser(5001)