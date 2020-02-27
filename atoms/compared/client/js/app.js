import * as d3B from 'd3'
import loadJson from 'shared/js/load-json'
import * as topojson from 'topojson'
import countries from 'assets/ne_10m_admin_0_countries.json'
import * as geo from 'd3-geo-projection'
import { $, numberWithCommas, getDataUrlForEnvironment  } from 'shared/js/util'

let dataurl = getDataUrlForEnvironment();

const d3 = Object.assign({}, d3B, geo);

const dates = [];

const parseTime = d3.timeParse("%m/%d/%y");	

const mapEl = $(".interactive-compared-wrapper");

let isMobile = window.matchMedia('(max-width: 420px)').matches;

let width = mapEl.getBoundingClientRect().width;
let height = isMobile ? width * 5 / 3: width * 3 / 5;

let canvas = d3.select('.interactive-compared-wrapper').append('canvas')
.attr('width', width)
.attr('height', height)

let context = canvas.node().getContext('2d')
context.clearRect(0, 0, width, height);

let simulation = d3.forceSimulation()
.force("charge", d3.forceManyBody().strength(d => d.strength ))
.force("x1",d3.forceX().x(d => d.migrated ? endCenter[0] : startCenter[0] ).strength(0.05))
.force("y1",d3.forceY().y(d => d.migrated ? endCenter[1] : startCenter[1] ).strength(0.05))
.alphaDecay(0)
.velocityDecay(0.3)
.on("tick", ticked);


simulation.stop();



loadJson(dataurl)
.then(fileRaw => {

	let obj = fileRaw.sheets.main_cases[0];


	Object.entries(obj).map(e => {

		if(e[0].indexOf('/20') > -1 || e[0].indexOf('/21') > -1)dates.push(e[0])

	})

	let lastDate = dates[dates.length -1];


	fileRaw.sheets.main_cases.map((place, i)=> {
		console.log(place.ISO_A3, place[lastDate], fileRaw.sheets.main_recovered[i][lastDate], fileRaw.sheets.main_deaths[i][lastDate])
	})

	simulation.alpha(1).restart();


})


const nodes = 1000;

const ticked = () => {

	console.log('t')

	context.clearRect(0,0,width,height);
	
	nodes.forEach(d => {

		context.beginPath();
		
		context.fillStyle = "#7E57BB";
		context.arc(d.x,d.y,3,0,Math.PI*2);

		context.fill();
	})
}


