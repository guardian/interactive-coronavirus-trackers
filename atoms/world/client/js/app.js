import * as d3B from 'd3'
import * as topojson from 'topojson'
import * as geoProjection from 'd3-geo-projection'
import loadJson from 'shared/js/load-json'

const d3 = Object.assign({}, d3B, topojson, geoProjection);

const atomEl = d3.select('.interactive-world-wrapper').node()

const isMobile = window.matchMedia('(max-width: 600px)').matches;

let width = atomEl.getBoundingClientRect().width;
let height =  width * 0.7


let projection = d3.geoMercator()


let path = d3.geoPath()
.projection(projection)

const map = d3.select('.interactive-world-wrapper')
.append('svg')
.attr('id', 'coronavirus-world-map-svg')
.attr('width', width)
.attr('height', height);

const geo = map.append('g');
const states = map.append('g');
const meshG = map.append('g')
const bubbles = map.append('g');
const labels = map.append('g');


const radius = d3.scaleSqrt()
.range([0, 20])


loadJson('https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=Confirmed%20%3E%200&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Confirmed%20desc%2CCountry_Region%20asc%2CProvince_State%20asc&resultOffset=0&resultRecordCount=250&cacheHint=true')
.then( fileRaw => {
	let cases = 0;
	fileRaw.features.map((d,i) => {
		console.log(i,d.attributes.Province_State, d.attributes.Country_Region, d.attributes.Confirmed)

		cases += +d.attributes.Confirmed
	})

	console.log('cases', cases)
})