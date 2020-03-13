import * as d3B from 'd3'
import loadJson from 'shared/js/load-json'
import { $, numberWithCommas, getDataUrlForEnvironment, getDeathsDataUrlForEnvironment, getRecoveredDataUrlForEnvironment} from 'shared/js/util'

const dataurl = 'https://interactive.guim.co.uk/docsdata-test/1ErpXeufokUQ4U_M41ZdoQyF5fwQ0lq-17esQMIABbXU.json';

const d3 = Object.assign({}, d3B);

let isMobile = window.matchMedia('(max-width: 620px)').matches;

const atomEl = d3.select('.interactive-compared-external-wrapper').node();

let isPage = false;

if (window) {
    if (window.location) {
        if (window.location.href) {
            if (window.location.href.indexOf("coronavirus-map-cases-how-covid-19-is-spreading") > -1)
            isPage = true;
        }
    }
}

if (!isPage) {
    d3.select('.gv-button-container')
    .classed('render', true)
}

let width = atomEl.getBoundingClientRect().width;
let height = isMobile ? width * 1.6 : 752 * width / 1260;

let dates = [];

let latestDate;

let latestCases = 0;
let latestDeaths = 0;
let latestRecovered = 0;

let recoveredDiv = d3.select('.interactive-compared-external-wrapper .gv-totals-container')
.append('div')
.attr('class', 'gv-total-container')

let casesDiv = d3.select('.interactive-compared-external-wrapper .gv-totals-container')
.append('div')
.attr('class', 'gv-total-container')

let deathsDiv = d3.select('.interactive-compared-external-wrapper .gv-totals-container')
.append('div')
.attr('class', 'gv-total-container')

loadJson(dataurl)
.then(

    fileRaw => {

        let obj = fileRaw.sheets.countryData[0];

        console.log(obj.Positive)

        console.log(obj.Total)

        casesDiv.append('p')
        .html('Confirmed cases')
        .style('color', '#333')

        casesDiv.append('span')
        .html(obj.Positive)
        .style('color', '#333')

        deathsDiv.append('p')
        .html('Deaths')
        .style('color', '#c70000')

        deathsDiv
        .append('span')
        .html(obj.Death)
        .style('color', '#c70000')

        recoveredDiv.append('p')
        .html('Total tested')
        .style('color', '#236925')

        recoveredDiv.append('span')
        .html(obj.Total)
        .style('color', '#236925')

        window.resize();
    }
)
