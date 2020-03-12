const fs = require('fs');
const gulp = require('gulp');

console.log('running')

const urls = [
'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=Confirmed%20%3E%200&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22Confirmed%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&cacheHint=true',
'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=Confirmed%20%3E%200&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22Recovered%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&outSR=102100&cacheHint=true',
'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/ArcGIS/rest/services/ncov_cases/FeatureServer/1/where=&objectIds='
];

const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];

/* NodeJS version */
//uses the `request` package which makes working with Node's native http methods easier
const request = require('request');

var requestAsync = function(url) {
    return new Promise((resolve, reject) => {
        var req = request(url, (err, response, body) => {
            if (err) return reject(err, response, body);
            resolve(JSON.parse(body));
        });
    });
};

/* Works as of Node 7.6 */
var getParallel = async function() {
    //transform requests into Promises, await all
    try {
        var data = await Promise.all(urls.map(requestAsync));
    } catch (err) {
        console.error(err);
    }


    let date = new Date();

    let month = monthNames[date.getMonth()];

    let day = date.getDate();

    let hours = date.getHours();
    let minutes = date.getMinutes();
    minutes = minutes < 10 ? '0'+minutes : minutes;
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours < 10 ? '0'+hours : hours;
    let timestamp = hours + ':' + minutes + ampm + ' ' + day + ' ' + month;

    let n = new Date().getTime()

    fs.writeFileSync('./assets/timestamp.json', JSON.stringify(timestamp));
    fs.writeFileSync('./assets/confirmed.json', JSON.stringify(data, null, 2));

}

getParallel();