import * as topojson from 'topojson'
import * as d3b from 'd3'
import * as geoProjection from 'd3-geo-projection'
import { $, getAmericaDataUrlForEnvironment } from "shared/js/util"
import americaMap from 'assets/america.json'
import americaStatesMap from 'assets/america-states.json'
import lakes from 'assets/great-lakes.json'
import loadJson from 'shared/js/load-json'

let dataurl = getAmericaDataUrlForEnvironment();

const d3 = Object.assign({}, d3b, topojson, geoProjection);

const headline = d3.select(".interactive-america-wrapper").append("h2").attr('class', 'headline');
const standfirst = d3.select(".interactive-america-wrapper").append("div").attr('class', 'america-standfirst');

const atomEl = d3.select('.interactive-america-wrapper').node()

const isMobile = window.matchMedia('(max-width: 600px)').matches;

let width = atomEl.getBoundingClientRect().width;
let height =  width * 0.7

const statesFc = {
	type : 'FeatureCollection',
	features : topojson.feature(americaStatesMap, americaStatesMap.objects['america-states'])
		.features.filter( f => f.properties.gu_a3 === 'USA' )
}

const stateCodes = statesFc.features.map( f => f.properties.postal )

const stateObjects = statesFc.features.map( f => {
	return {
		name : f.properties.name,
		code : f.properties.postal
	}
})

console.log(JSON.stringify(stateObjects))

const clean = str => {
	return str.replace('D.C.', 'DC')
}

console.log(statesFc)

let projection = d3.geoAlbersUsa()

.fitSize([ width, height ], statesFc)

//.rotate([0.0, 0.0])
//.center([0.0, 52.0])
//.parallels([35.0, 65.0])
//.rotate([-155,0,0])

let path = d3.geoPath()
.projection(projection)

const map = d3.select('.interactive-america-wrapper')
.append('svg')
.attr('id', 'coronavirus-america-map-svg')
.attr('width', width)
.attr('height', height);

const source = d3.select(".interactive-america-wrapper").append("div").attr('class', 'america-source');

const geo = map.append('g');
const states = map.append('g');
const bubbles = map.append('g');
const labels = map.append('g');

const americaExtent = topojson.feature(americaMap, {
	type: "GeometryCollection",
	geometries: americaMap.objects.america.geometries.filter(d => d.properties.ISO_A3 === 'USA' || d.properties.ISO_A3 === 'DOM' || d.properties.ISO_A3 === 'MEX')
});

const radius = d3.scaleSqrt()

.range([0, 20])

//projection.fitExtent([[isMobile ? -200 : -400, isMobile ? -150 : -200], [width - 20 	, height]], americaExtent);

// geo.selectAll('path')
// .data(topojson.feature(americaMap, americaMap.objects.america).features)
// .enter()
// .filter(d => d.properties.ISO_A3 != '-99')
// .append('path')
// .attr('d', path)
// .attr('class', d => 'country ' + d.properties.NAME.replace(' ', '').replace('.', ''))

states.selectAll('path')
.data(statesFc.features)
.enter()
.append('path')
.attr('d', path)
.attr('class', d => 'state ' + d.properties.postal)

states.selectAll('lakes')
.data(topojson.feature(lakes, lakes.objects['great-lakes']).features)
.enter()
.append('path')
.attr('d', path)
.attr('fill', 'white')

const validUSCase = str => {
	return stateCodes.indexOf(str.split(', ').slice(-1)[0]) >= 0
}

const parseData = (data) => {

	let max = d3.max(data, d => +d.cases );

	radius.domain([0, max])

	data

		.map( row => {

			return Object.assign({}, row, { 'Province/State' : clean(row['Province/State']) })

		} )

		.filter( row => validUSCase(row['Province/State']) )

		.forEach(d => {


		if(!isNaN(+d.cases) && +d.cases > 0)
		{

			if(d['Country/Region'] != "")
			{
				d3.selectAll('.interactive-america-wrapper .' + d['Country/Region'].replace(' ', '').replace('.', ''))
				.classed('selected', true);
			}
			else {

				const str = '.interactive-america-wrapper .' + d['Province/State'].split(', ')[1]
				console.log(str)
				d3.selectAll(str)
				.classed('selected', true);
			}
			

			let centroid = projection([d.lon, d.lat]);

			if(centroid) {

			bubbles
			.append('circle')
			.attr("class", "bubble")
			.attr("r", radius(+d.cases))
			.attr("cx", centroid[0])
			.attr("cy", centroid[1])

			if(!isMobile && d.display == 'block')
			{
				if(d.cases > 1){
					makeLabel(d)
				}
			}

			if(isMobile && d.display == 'block')
			{
				if(d.cases > 2){
					makeLabel(d)
				}
			}

			} else {

				console.log("no centroid")
				console.log(d)
			}

		}
	})

}

const makeLabel = (d) =>{

	let txt

	if(d['Province/State'] != '')
	{
		txt = d['Province/State'].replace('County', '').replace(' ,', ',')
	}
	else
	{
		txt = d['Country/Region'];
	}

	let centroid = projection([d.lon, d.lat]);

	let labelWhite = labels.append('text')
	.attr('transform', 'translate(' + centroid[0] + ',' + centroid[1] + ')')

	labelWhite
	.append("tspan")
	.attr('class','country-label country-label--white')
	.text(txt)
	.attr('x', +d.offset_horizontal || 0) 
	.attr('y', -(d.offset_vertical) )

	labelWhite
	.append('tspan')
	.attr('class','country-cases country-cases--white')
	.text(d.text)
	.attr('x', d.offset_horizontal || 0)
	.attr('dy', '15' )

	let label = labels.append('text')
	.attr('transform', 'translate(' + centroid[0] + ',' + centroid[1] + ')')

	label
	.append("tspan")
	.attr('class','country-label')
	.text(txt)
	.attr('x', +d.offset_horizontal || 0) 
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
	
	parseData(fileRaw.sheets.america_cases);

	headline.html(fileRaw.sheets.america_furniture[0].text)
	standfirst.html(fileRaw.sheets.america_furniture[2].text)
	source.html(fileRaw.sheets.america_furniture[1].text)

	window.resize();
})