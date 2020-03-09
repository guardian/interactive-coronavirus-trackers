import * as d3B from 'd3'
import * as topojson from 'topojson'
import * as geoProjection from 'd3-geo-projection'
import { $, getEmeaDataUrlForEnvironment } from "shared/js/util"
import europeMap from 'assets/europe.json'
import loadJson from 'shared/js/load-json'

let dataurl = getEmeaDataUrlForEnvironment();

const d3 = Object.assign({}, d3B, topojson, geoProjection);

const headline = d3.select(".interactive-europe-wrapper").append("h2").attr('class', 'headline');
const standfirst = d3.select(".interactive-europe-wrapper").append("div").attr('class', 'europe-standfirst');

const atomEl = d3.select('.interactive-europe-wrapper').node()

const isMobile = window.matchMedia('(max-width: 600px)').matches;

let width = atomEl.getBoundingClientRect().width;
let height =  isMobile ? width * 1.1 : width * 3.5 / 5;

let projection = d3.geoAlbers()
.rotate([-20.0, 0.0])
    //.center([0.0, 52.0])
.parallels([35.0, 65.0])
//.rotate([-155,0,0])

let path = d3.geoPath()
.projection(projection)

const map = d3.select('.interactive-europe-wrapper')
.append('svg')
.attr('id', 'coronavirus-asia-map-svg')
.attr('width', width)
.attr('height', height);

const source = d3.select(".interactive-europe-wrapper").append("div").attr('class', 'europe-source');


const geo = map.append('g');
const bubbles = map.append('g');
const labels = map.append('g');

const emeaExtent = topojson.feature(europeMap, {
	type: "GeometryCollection",
	geometries: europeMap.objects.europe.geometries.filter(d => d.properties.NAME === 'Algeria' || d.properties.NAME === 'Finland' || d.properties.NAME === 'Yemen')
});

const radius = d3.scaleSqrt()
.range([0, isMobile ? 40 : 60])

projection.fitExtent([[0, 20], [width, height + 50]], emeaExtent);

geo.selectAll('path')
.data(topojson.feature(europeMap, europeMap.objects.europe).features)
.enter()
.filter(d => d.properties.ISO_A3 != '-99' && d.properties.ISO_A3 != '#N/A')
.append('path')
.attr('d', path)
.attr('class', d => 'country ' + d.properties.ISO_A3.split(' ').join(''))

const parseData = (data) => {

	let max = d3.max(data, d => +d.cases );

	radius.domain([0, max])

	data.map(d => {



		if(!isNaN(+d.cases) && +d.cases != 0)
		{


			let area = d3.selectAll('.interactive-europe-wrapper .' + d.ISO_A3.split(' ').join(''))
			.classed(' selected', true);

			let centroid = projection([d.lon, d.lat]);


			let bubble = bubbles
			.append('circle')
			.attr("class", "bubble")
			.attr("r", radius(+d.cases))
			.attr("cx", centroid[0])
			.attr("cy", centroid[1])



			if(!isMobile && d.display == 'block')
			{
				makeLabel(d)
				
			}

			if(isMobile && d.display == 'block')
			{
				if(d.cases > 50){
					makeLabel(d)
				}
			}
		}
	})

}


const makeLabel = (d) =>{

	let centroid = projection([d.lon, d.lat]);

	let label = labels.append('text')
	.attr('transform', 'translate(' + centroid[0] + ',' + centroid[1] + ')')

	label
	.append("tspan")
	.attr('class','country-label')
	.text(d.NAME)
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
	
	parseData(fileRaw.sheets.emea_cases);

	headline.html(fileRaw.sheets.emea_furniture[0].text)
	standfirst.html(fileRaw.sheets.emea_furniture[2].text)
	source.html(fileRaw.sheets.emea_furniture[1].text)

	window.resize();
})