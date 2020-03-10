import loadJson from 'shared/js/load-json'
import covirMap from 'assets/covid-uk.json'
import * as d3B from 'd3'
import * as topojson from 'topojson'
import { $, getUKDataUrlForEnvironment } from "shared/js/util"

let dataurl = getUKDataUrlForEnvironment();

const d3 = Object.assign({}, d3B, topojson);

const atomEl = d3.select('.interactive-uk-wrapper').node()

const isMobile = window.matchMedia('(max-width: 600px)').matches;

let width = atomEl.getBoundingClientRect().width / 2;
let height =  isMobile ? (width * 2) * 1.1 : (width * 2) * 3.5 / 5;

const radius = d3.scaleSqrt()
.range([0, 10])

let projection = d3.geoMercator()
let projectionLondon = d3.geoMercator()

let path = d3.geoPath()
.projection(projection)

let pathLondon = d3.geoPath()
.projection(projectionLondon)

const mapUk = d3.select('.interactive-uk-wrapper')
.append('svg')
.attr('id', 'coronavirus-uk-map-svg')
.attr('width', width)
.attr('height', height)

const mapLondon = d3.select('.interactive-uk-wrapper')
.append('svg')
.attr('id', 'coronavirus-london-map-svg')
.attr('width', width)
.attr('height', height)

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

projection.fitExtent([[0, 0], [width , height]], topojson.feature(covirMap, covirMap.objects['covid-uk']));

geoUk.selectAll('path')
.data(topojson.feature(covirMap, covirMap.objects['covid-uk']).features)
.enter()
.append('path')
.attr('d', path)
.attr('class', d => 'area ' + d.properties.ctyua17cd)

projectionLondon.fitExtent([[0, 0], [width , height]], london);

geoLondon.selectAll('path')
.data(london.features)
.enter()
.append('path')
.attr('d', pathLondon)
.attr('class', d => 'area ' + d.properties.ctyua17cd)


loadJson(dataurl)
.then(
	fileRaw => {

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

				if(d.code.indexOf('E09') > -1)
				{
					bubblesLondon
					.append('circle')
					.attr("class", "bubble")
					.attr("r", radius(+d.cases))
					.attr("cx", centroidLondon[0])
					.attr("cy", centroidLondon[1])
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
			}

			
		})
	})