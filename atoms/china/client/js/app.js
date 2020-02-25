import * as d3B from 'd3'
import * as topojson from 'topojson'
import * as geoProjection from 'd3-geo-projection'
import { $, getDataUrlForEnvironment } from "shared/js/util"
import asiaMap from 'assets/asia_china_extent.json'
import loadJson from 'shared/js/load-json'

let dataurl = getDataUrlForEnvironment();

const d3 = Object.assign({}, d3B, topojson, geoProjection);

const headline = d3.select(".interactive-china-wrapper").append("h2").attr('class', 'headline');
const standfirst = d3.select(".interactive-china-wrapper").append("div").attr('class', 'china-standfirst');

const atomEl = d3.select('.interactive-china-wrapper').node()

const isMobile = window.matchMedia('(max-width: 600px)').matches;

let width = atomEl.getBoundingClientRect().width;
let height =  isMobile ? width : width * 3.5 / 5;

let projection = d3.geoMiller()

let path = d3.geoPath()
.projection(projection)

let radius = d3.scaleSqrt()
.range([0, isMobile ? 40 : 85]);


topojson.feature(asiaMap, asiaMap.objects.asia_china_extent).features

const asiaChinaExtent = topojson.feature(asiaMap, {
	type: "GeometryCollection",
	geometries: asiaMap.objects.asia_china_extent.geometries.filter(d => d.properties.NAME_0 == 'China' || d.properties.ISO_A3 == 'JPN' || d.properties.ISO_A3 == 'MYS')
});

const map = d3.select('.interactive-china-wrapper')
.append('svg')
.attr('id', 'coronavirus-asia-map-svg')
.attr('width', width)
.attr('height', height);


const geo = map.append('g');
const bubbles = map.append('g');
const labels = map.append('g');


projection.fitExtent([[0, 10], [width, height - 20]], asiaChinaExtent);


geo.selectAll('path')
.data(topojson.feature(asiaMap, asiaMap.objects.asia_china_extent).features.filter(d => d.properties.ISO_A3 != 'extent'))
.enter()
.append('path')
.attr('d', path)
.attr('class', d => 'country ' + d.properties.ISO_A3.split(' ').join(''))


const parseData = (data) => {

	let max = d3.max(data, d => +d.cases );

	radius.domain([0, max])

	data.map(d => {

		let area = d3.select('.' + d.ISO_A3.split(' ').join(''))
		.classed(' selected', true);

		//let feature = topojson.feature(asiaMap, asiaMap.objects.asia_china_extent).features.find(c => c.properties.ISO_A3.split(' ').join('') === d.ISO_A3.split(' ').join(''))

		let centroid = projection([d.lat, d.lon]);

		bubbles
		.append('circle')
		.attr("class", "bubble")
		.attr("r", radius(+d.cases))
		.attr("cx", centroid[0])
		.attr("cy", centroid[1])

		if(!isMobile && d.display == 'block')
		{
			makeLabel(d, centroid)
			
		}

		if(isMobile && d.display == 'block')
		{
			if(d.cases > 9){
				makeLabel(d, centroid)
			}
		}
		
	})

}


const makeLabel = (d, centroid) =>{

	let label = labels.append('text')
	.attr('transform', 'translate(' + centroid[0] + ',' + centroid[1] + ')')

	label
	.append("tspan")
	.attr('class','country-label')
	.text(d.NAME)
	.attr('x', d.offset_horizontal || 0) 
	.attr('y', -(d.offset_vertical) )

	label
	.append('tspan')
	.attr('class','country-cases')
	.text(d.text)
	.attr('x', d.offset_horizontal || 0)
	.attr('dy', '15' )

}



loadJson(dataurl)
.then( fileRaw => {

	headline.html(fileRaw.sheets.asia_furniture[0].text)
	standfirst.html(fileRaw.sheets.asia_furniture[2].text)
	
	parseData(fileRaw.sheets.asia_cases);
	window.resize();
})