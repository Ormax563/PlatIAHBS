const fs = require('fs');
var axios = require("axios");
let csvToJson = require('convert-csv-to-json');

let conv = (fileIn, fileOu) => {
    csvToJson.generateJsonFileFromCsv(fileIn,fileOu);
   
}

module.exports = {
    conv
};