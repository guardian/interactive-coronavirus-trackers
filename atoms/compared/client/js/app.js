import * as d3B from 'd3'
import loadJson from 'shared/js/load-json'
import { $, numberWithCommas, getDataUrlForEnvironment, getDeathsDataUrlForEnvironment, getRecoveredDataUrlForEnvironment } from 'shared/js/util'

import data from 'assets/confirmed.json'
import timestamp from 'assets/timestamp.json'


//const fetch = require('node-fetch');

//let dataurl = getDataUrlForEnvironment();

const d3 = Object.assign({}, d3B);

/*let isMobile = window.matchMedia('(max-width: 620px)').matches;

const atomEl = d3.select('.interactive-compared-wrapper').node();

let width = atomEl.getBoundingClientRect().width;
let height = isMobile ? width * 1.6 : 752 * width / 1260;*/

let isPage = document.referrer && document.referrer.indexOf('coronavirus-map-cases-how-covid-19-is-spreading') > -1;

console.log(isPage, document.referrer)

let dates = [];

let latestDate;

let latestCases = 0;
let latestDeaths = 0;
let latestRecovered = 0;


let casesDiv = d3.select('.gv-totals-container')
.append('div')
.attr('class', 'gv-total-container')

let deathsDiv = d3.select('.gv-totals-container')
.append('div')
.attr('class', 'gv-total-container')

let recoveredDiv = d3.select('.gv-totals-container')
.append('div')
.attr('class', 'gv-total-container')


/*casesDiv.append('p')
		.html('Confirmed cases')
		.style('color', '#c70000')

casesDiv.append('span')
		.html(numberWithCommas(data[1].features[0].attributes.value))
		.style('color', '#c70000')

deathsDiv.append('p')
		.html('Deaths')
		.style('color', '#333')

deathsDiv
		.append('span')
		.html(numberWithCommas(data[0].features[0].attributes.value))
		.style('color', '#333')

recoveredDiv.append('p')
		.html('Recovered')
		.style('color', '#d6d6d6')

recoveredDiv.append('span')
		.html(numberWithCommas(data[2].features[0].attributes.value))
		.style('color', '#d6d6d6')

d3.select('.gv-totals-timestamp').html("Data correct at " + timestamp)*/


loadJson(getDataUrlForEnvironment())
.then(

	fileRaw => {

		let obj = fileRaw.sheets.main_cases[0];

		Object.entries(obj).map(e => {

			if(e[0].indexOf('/20') > -1 || e[0].indexOf('/21') > -1)dates.push(e[0])

		})

		dates.reverse(fileRaw.sheets.main_cases)

		latestDate = dates[0];

		fileRaw.sheets.main_cases.map((p,i) => {

			latestCases += +p[latestDate];

		})

		d3.select('.gv-totals-timestamp').html(fileRaw.sheets.cases_furniture[3].text)


		casesDiv.append('p')
		.html('Confirmed cases')
		.style('color', '#c70000')

		casesDiv.append('span')
		.html(numberWithCommas(latestCases))
		.style('color', '#c70000')


		loadJson(getDeathsDataUrlForEnvironment())
		.then(

			fileRaw => {

				fileRaw.sheets.main_deaths.map((p,i) => {

					latestDeaths += +p[latestDate];

				})


				deathsDiv.append('p')
				.html('Deaths')
				.style('color', '#333')

				deathsDiv
				.append('span')
				.html(numberWithCommas(latestDeaths))
				.style('color', '#333')


				loadJson(getRecoveredDataUrlForEnvironment())
				.then(

					fileRaw => {

						fileRaw.sheets.main_recovered.map((p,i) => {

							latestRecovered += +p[latestDate];

						})

						recoveredDiv.append('p')
						.html('Recovered')
						.style('color', '#d6d6d6')

						recoveredDiv.append('span')
						.html(numberWithCommas(latestRecovered))
						.style('color', '#d6d6d6')

						window.resize();

					}
				)
			}
		)
	}
)