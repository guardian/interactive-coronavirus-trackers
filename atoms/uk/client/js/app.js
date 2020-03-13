import loadJson from 'shared/js/load-json'
import covirMap from 'assets/covid-uk.json'
import * as d3B from 'd3'
import * as topojson from 'topojson'
import { $, getUKDataUrlForEnvironment } from "shared/js/util"
import {event as currentEvent} from 'd3-selection';

let dataurl = getUKDataUrlForEnvironment();

const d3 = Object.assign({}, d3B, topojson);

const headline = d3.select(".interactive-uk-wrapper").append("h2").attr('class', 'headline');
const standfirst = d3.select(".interactive-uk-wrapper").append("div").attr('class', 'standfirst');
const maps = d3.select(".interactive-uk-wrapper").append("div").attr('class', 'maps');

const atomEl = d3.select('.interactive-uk-wrapper').node()

const isMobile = window.matchMedia('(max-width: 620px)').matches;

console.log(isMobile)

let width = isMobile ? atomEl.getBoundingClientRect().width : (atomEl.getBoundingClientRect().width / 3) * 2;
let height =  width / 3 * 5;
let londonW =  isMobile ? 300 : atomEl.getBoundingClientRect().width - width;

const radius = d3.scaleSqrt()
.range([0, 10])

let projection = d3.geoMercator()
let projectionLondon = d3.geoMercator()

let path = d3.geoPath()
.projection(projection)

let pathLondon = d3.geoPath()
.projection(projectionLondon)

const mapUk = maps
.append('svg')
.attr('id', 'coronavirus-uk-map-svg')
.attr('width', width)
.attr('height', height)
.on('click',function (){mouse(this)} )

const mapLondon = maps
.append('svg')
.attr('id', 'coronavirus-london-map-svg')
.attr('width', londonW)
.attr('height', londonW)

const source = d3.select(".interactive-uk-wrapper").append("div").attr('class', 'source');

const geoUk = mapUk.append('g');
const bubblesUk = mapUk.append('g');
const labelsUk = mapUk.append('g');

const geoLondon = mapLondon.append('g');
const bubblesLondon = mapLondon.append('g');
const labelsLondon = mapLondon.append('g');

const london = topojson.feature(covirMap, {
	type: "GeometryCollection",
	geometries: covirMap.objects['covid-uk'].geometries.filter(d => d.properties.ctyua17cd.indexOf('E09') > -1)
});

projection.fitExtent([[0, -20], [width - 15, height]], topojson.feature(covirMap, covirMap.objects['covid-uk']));

geoUk.selectAll('path')
.data(topojson.feature(covirMap, covirMap.objects['covid-uk']).features)
.enter()
.append('path')
.attr('d', path)
.attr('class', d => 'area ' + d.properties.ctyua17cd)
 

const rectangle1 = topojson.feature(covirMap, {
	type: "GeometryCollection",
	geometries: covirMap.objects['covid-uk'].geometries.filter(d => d.properties.ctyua17cd == 'S08000026')
});

const rectangle2 = topojson.feature(covirMap, {
	type: "GeometryCollection",
	geometries: covirMap.objects['covid-uk'].geometries.filter(d => d.properties.ctyua17cd == 'S08000025')
});

let recBounds1 = d3.geoBounds(rectangle1);
let recBounds2 = d3.geoBounds(rectangle2);

let rec1X = projection(recBounds1[0])[0] - 5;
let rec1Y = projection(recBounds1[1])[1] - 5;
let rec1W = projection(recBounds1[1])[0] - rec1X;
let rec1H = projection(recBounds1[0])[1] - rec1Y;

geoUk.append('rect')
.attr("x", rec1X)
.attr("y", rec1Y)
.attr("width", rec1W)
.attr("height", rec1H)
.attr('class', 'islands-rectangle');

let rec2X = projection(recBounds2[0])[0] - 5;
let rec2Y = projection(recBounds2[1])[1] - 5;
let rec2W = projection(recBounds2[1])[0] - rec2X;
let rec2H = projection(recBounds2[0])[1] - rec2Y;

geoUk.append('rect')
.attr("x", rec2X)
.attr("y", rec2Y)
.attr("width", rec2W)
.attr("height", rec2H)
.attr('class', 'islands-rectangle');

projectionLondon.fitExtent([[0, 0], [londonW , londonW ]], london);

geoLondon.selectAll('path')
.data(london.features)
.enter()
.append('path')
.attr('d', pathLondon)
.attr('class', d => 'area ' + d.properties.ctyua17cd)


loadJson(dataurl)
.then(
	fileRaw => {

		headline.html(fileRaw.sheets.furniture[0].text)
		standfirst.html(fileRaw.sheets.furniture[3].text)
		source.html(fileRaw.sheets.furniture[1].text + ' ' + fileRaw.sheets.furniture[2].text)

		let eng = d3.max(fileRaw.sheets.england_cases, d => +d.cases );
		let sco = d3.max(fileRaw.sheets.scotland_cases, d => +d.cases );
		let wal = d3.max(fileRaw.sheets.wales_cases, d => +d.cases );
		let ni = d3.max(fileRaw.sheets.northern_ireland_cases, d => +d.cases );

		let max = d3.max([eng, sco, wal, ni])

		radius.domain([0, max])


		fileRaw.sheets.england_cases.map(d => {

			if(d.code != '#N/A' && d.cases > 0)
			{

				d3.select('#coronavirus-uk-map-svg .' + d.code)
				.classed(' selected', true);

				d3.select('#coronavirus-london-map-svg .' + d.code)
				.classed(' selected', true);


				let centroid = projection([d.lat, d.lon]);
				let centroidLondon = projectionLondon([d.lat, d.lon]);

				bubblesUk
				.append('circle')
				.attr("class", "bubble")
				.attr("r", radius(+d.cases))
				.attr("cx", centroid[0])
				.attr("cy", centroid[1])

				if(d.display === 'block' && d.code.indexOf('E09') == -1)makeLabel(d, centroid, labelsUk)

				if(d.code.indexOf('E09') > -1)
				{
					bubblesLondon
					.append('circle')
					.attr("class", "bubble")
					.attr("r", radius(+d.cases))
					.attr("cx", centroidLondon[0])
					.attr("cy", centroidLondon[1])

					if(d.display === 'block')makeLabel(d, centroidLondon, labelsLondon)
				}

				
			}

			
		})

		fileRaw.sheets.scotland_cases.map(d => {

			if(d.code != '#N/A' && d.cases != '#N/A')
			{
				d3.select('#coronavirus-uk-map-svg .' + d.code)
				.classed(' selected', true);

				let centroid = projection([d.lat, d.lon]);

				bubblesUk
				.append('circle')
				.attr("class", "bubble")
				.attr("r", radius(+d.cases))
				.attr("cx", centroid[0])
				.attr("cy", centroid[1])

				if(d.display === 'block' && d.code.indexOf('E09') == -1)makeLabel(d, centroid, labelsUk)
			}

			
		})

		fileRaw.sheets.northern_ireland_cases.map(d => {

			if(d.code != '#N/A' && d.cases != '#N/A')
			{
				d3.select('#coronavirus-uk-map-svg .' + d.code)
				.classed(' selected', true);

				let centroid = projection([d.lat, d.lon]);

				bubblesUk
				.append('circle')
				.attr("class", "bubble")
				.attr("r", radius(+d.cases))
				.attr("cx", centroid[0])
				.attr("cy", centroid[1])

				if(d.display === 'block' && d.code.indexOf('E09') == -1)makeLabel(d, centroid, labelsUk)
			}

			
		})

		fileRaw.sheets.wales_cases.map(d => {

			if(d.code != '#N/A' && d.cases != '#N/A')
			{
				d3.select('#coronavirus-uk-map-svg .' + d.code)
				.classed(' selected', true);

				let centroid = projection([d.lat, d.lon]);
				
				bubblesUk
				.append('circle')
				.attr("class", "bubble")
				.attr("r", radius(+d.cases))
				.attr("cx", centroid[0])
				.attr("cy", centroid[1])

				if(d.display === 'block' && d.code.indexOf('E09') == -1)makeLabel(d, centroid, labelsUk)
			}

			
		})


		window.resize();
})




const makeLabel = (d, centroid, labels) =>{

	let txt = d['Upper Tier Local Authority']

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