import * as d3B from 'd3'
import loadJson from 'shared/js/load-json'
import * as topojson from 'topojson'
import countries from 'assets/ne_10m_admin_0_countries.json'
import * as geo from 'd3-geo-projection'

const d3 = Object.assign({}, d3B, geo);

let isMobile = window.matchMedia('(max-width: 620px)').matches;

const atomEl = d3.select('.interactive-wrapper').node();

let width = (atomEl.getBoundingClientRect().width / 4) - 10;
let height =  isMobile ? width : width * 2.5 / 5;

const parseTime = d3.timeParse("%m/%d/%y");

const formatMonths = d3.timeFormat("%B");

const projection = d3.geoFahey()
.rotate([-155,0,0]);

let path = d3.geoPath()
.projection(projection);

const land = topojson.merge(countries, countries.objects.ne_10m_admin_0_countries.geometries);
const world = topojson.feature(countries, countries.objects.ne_10m_admin_0_countries);

projection.fitExtent([[0, 0], [width, height]], world);

let data = [];

let selectedCountry = [];

loadJson('https://interactive.guim.co.uk/docsdata-test/1Djzo649h0LzwjUCbOIAlxvvQHWfCkeoN4jAA82eI0Q8.json')
.then(fileRaw => {

	let dates = Object.getOwnPropertyNames(fileRaw.sheets.main_cases[0]).filter(e => e.indexOf('/20') != -1 || e.indexOf('/21') != -1);

	let selectedDates = fileRaw.sheets.small_multiples;

	console.log(selectedDates)

	let acum = 0;

	fileRaw.sheets.main_cases.map(p =>{

		dates.map((d,i) => {

			p[dates[i]] = +p[dates[i]] - acum;

			//if(p[dates[i]]<0)console.log(p.ISO_A3)

			acum += +p[dates[i]]

		})

		acum = 0;
	})

	data = fileRaw.sheets.main_cases;

	selectedDates.map(d =>{

		makeMap(d.date)

	})
})

const makeMap = (date) =>{

	let div = d3.select('.interactive-wrapper')
	.append('div')


	div.append('h3')
    .text( parseTime(date).getDate() + " " + formatMonths(parseTime(date)) )

    let standfirst = div.append('text')
    .attr('class', 'standfirst')
    .html( '\n')
            

	const canvas = div
	.append("canvas")
	.attr("width", width)
	.attr("height", height)

	const context = canvas.node().getContext("2d");

	path.context(context)

	let colorLand = "#f6f6f6";

	context.fillStyle = colorLand;
	context.beginPath();
	path(land);
	context.fill();


	selectedCountry.map(s => {

		let selectedC = topojson.feature(countries, {
				type: "GeometryCollection",
				geometries: countries.objects.ne_10m_admin_0_countries.geometries.filter(g => g.properties.ISO_A3 === s)
			});


		let colorSelected = "#dcdcdc";

			context.fillStyle = colorSelected;
			context.beginPath();
			path(selectedC);
			context.fill();
	})


	let cStr = ''


	data.map(d => {

		let colorSelected = "#951D7A";
		let colorFill = "#FFE6EC";


		if(d[date] > 0 && selectedCountry.indexOf(d.ISO_A3) < 0 && d.ISO_A3 != '-99'){


			cStr += d.ISO_A3 + ', '

			standfirst.text(cStr)

			const selectedC = topojson.feature(countries, {
				type: "GeometryCollection",
				geometries: countries.objects.ne_10m_admin_0_countries.geometries.filter(g => g.properties.ISO_A3 === d.ISO_A3)
			});

			context.strokeStyle = colorSelected;
			context.fillStyle = colorFill;
			context.beginPath();
			path(selectedC);
			
			context.fill();
			context.stroke();

		
			selectedCountry.push(d.ISO_A3)
		}

		if(d[date] > 0){

				let posX = projection([d.Long, d.Lat])[0];
				let posY = projection([d.Long, d.Lat])[1];

				context.fillStyle = colorSelected;
				context.beginPath()
				context.arc(posX, posY,1.5, 0, Math.PI*2)
				context.fill();

		}
	})
}
