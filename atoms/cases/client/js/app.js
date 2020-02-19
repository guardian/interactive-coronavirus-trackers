import * as d3 from 'd3'
import loadJson from '../../../../components/load-json'


let isMobile = window.matchMedia('(max-width: 620px)').matches;

const atomEl = d3.select('.interactive-wrapper').node();

let w = atomEl.getBoundingClientRect().width;
let h = isMobile ? w * 1.6 : 752 * w / 1260;

let margin = {top: 20, right: 20, bottom: 50, left: 20};
let width = w - margin.left - margin.right;
let height = h - margin.top - margin.bottom;

let xScale = d3.scaleTime()
.range([margin.left, width])

let yScale = d3.scaleLinear()
.range([height, 0]);

let line = d3.line()
.x( d => xScale(d.date))
.y( d => yScale(d.cases))

const parseTime = d3.timeParse("%d/%m/%Y");

const formatDays = d3.timeFormat("%e");

const formatMonths = d3.timeFormat("%b");

const formatYears = d3.timeFormat("%Y");

const headline = d3.select(".interactive-wrapper").append("div").attr('class', 'headline');
const timestamp = d3.select(".interactive-wrapper").append("div").attr('class', 'timestamp');

let svg = d3.select(".interactive-wrapper").append("svg")
.attr("width", w)
.attr("height", h)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const source = d3.select(".interactive-wrapper").append("div").attr('class', 'source');


const places = [];

const latest = [];

const dates = [];


loadJson('https://interactive.guim.co.uk/docsdata-test/1Djzo649h0LzwjUCbOIAlxvvQHWfCkeoN4jAA82eI0Q8.json')
.then(fileRaw => {

	headline.html(fileRaw.sheets.cases_furniture[0].text)
	timestamp.html(fileRaw.sheets.cases_furniture[3].text)
	source.html(fileRaw.sheets.cases_furniture[1].text + " " + fileRaw.sheets.cases_furniture[2].text)


	let obj = fileRaw.sheets.main_cases[0];

	Object.entries(obj).map(e => {

		if(e[0].indexOf('2020') > -1 || e[0].indexOf('2021') > -1)dates.push(e[0])

	})

	fileRaw.sheets.main_cases.map((p,i) => {

		places.push({province:p['Province/State'], country:p['Country/Region'], lat:p.Lat, lon:p.Long, cases:[]})


		dates.map(d => places[i].cases.push({date: d, cases: +p[d]}))

	})

	dates.map(d => {

		let casesByDate = places.map(p => p.cases.find(c => c.date === d))

		let cases = casesByDate.reduce((a, b) => a + b.cases, 0);

		latest.push({date:parseTime(d), cases:cases});
	})

	let casesScale = 0;
	let casesScaleStr = '0';

	latest.sort((a,b) => (b.date > a.date) ? 1 : ((a.date > b.date) ? -1 : 0));

	if(latest[0].cases.toString().length >= 4 && latest[0].cases.toString().length < 7)
	{
		casesScale = 1000;
		casesScaleStr = 'thousand';
	}
	else if(latest[0].cases.toString().length >= 7 && latest[0].cases.toString().length < 10)
	{
		casesScale = 1000000;
		casesScaleStr = 'million';
	}

//-----------UNCOMMENT FOR TESTING------------------------
//let startEndDates = [new Date('January 21, 2020 03:24:00'), new Date('March 20, 2020 03:24:00')];

let startEndDates = d3.extent(latest, d => d.date);

let days = d3.timeDay.range(startEndDates[0], startEndDates[1]).length;
let months = d3.timeMonth.range(startEndDates[0], startEndDates[1]).length;
let years = d3.timeYear.range(startEndDates[0], startEndDates[1]).length;

xScale.domain(startEndDates);
yScale.domain([0, Math.round(latest[0].cases / casesScale) * casesScale]);

let yTicks = parseInt(latest[0].cases.toString().length) + 1 ;

let xTicks;

if(days <= 40)
{
	if(days >= 30 && !isMobile) xTicks = d3.timeDay.every(2)
	else if(days >= 30 && isMobile) xTicks = d3.timeDay.every(7)

			let xaxisDays = svg.append("g")
		.attr("transform", "translate(0," + (height + 5) + ")")
		.attr("class", "x axis")
		.call(
			d3.axisBottom(xScale)
			.ticks(xTicks)
			.tickSizeInner(-height - 5)
			.tickFormat(formatDays)
			)
		.selectAll("text")
		.attr('y', 5);

		let xaxisMonths = svg.append("g")
		.attr("transform", "translate(0," + (height + 25) + ")")
		.attr("class", "x axis months")
		.call(
			d3.axisBottom(xScale)
			.ticks(months)
			.tickFormat(formatMonths)
			)
		.selectAll("text")
		.attr('y', 0);

}
else
{	
		isMobile ? xTicks = d3.timeMonth.every(2) : xTicks = d3.timeMonth;

		if(days >= 365 && !isMobile) xTicks = d3.timeMonth.every(2)
		else if(days >= 365 && isMobile) xTicks = d3.timeMonth.every(6)

				let xaxisMondts = svg.append("g")
			.attr("transform", "translate(0," + (height + 5) + ")")
			.attr("class", "x axis")
			.call(
				d3.axisBottom(xScale)
				.ticks(xTicks)
				.tickSizeInner(-height - 5)
				.tickFormat(formatMonths)
				)
			.selectAll("text")
			.attr('y', 5);

		}

		if(days > 365)
		{
			let xaxisYears = svg.append("g")
			.attr("transform", "translate(0," + (height + 25) + ")")
			.attr("class", "x axis years")
			.call(
				d3.axisBottom(xScale)
				.ticks(years+1)
				.tickFormat(formatYears)
				)
			.selectAll("text")
			.attr('y', 0);
		}

		let yaxis = svg.append("g")
		.attr("class", "y axis")
		.call(
			d3.axisLeft(yScale)
			.ticks(yTicks)
			.tickSizeInner(-width)
			.tickFormat(d => d / casesScale)
			)
		.selectAll("text")
		.style("text-anchor", "start")
		.attr('x', 0)
		.attr('y', -10);

		let yTicksNodes = d3.selectAll('.y.axis g').nodes();
		let currentText = yTicksNodes[yTicksNodes.length-1].childNodes[1].innerHTML;

		yTicksNodes[yTicksNodes.length-1].childNodes[1].innerHTML = currentText + " " +casesScaleStr

		d3.select('.y.axis .domain').remove()
		d3.selectAll('.x.axis .domain').remove()
		d3.selectAll('.x.axis.months line').remove()

		svg.append("path")
		.datum(latest)
		.attr("class", "cases-chart-line")
		.attr("d", line);

		svg.selectAll(".cases-chart-dot")
		.data(latest)
		.enter().append("circle")
		.attr("class", "cases-chart-dot")
		.attr("cx", d => xScale(d.date))
		.attr("cy", d => yScale(d.cases))
		.attr("r", latest.length < 40 ? 5 : 3);

		svg.append('text')
		.text(latest[0].cases.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
		.attr('class', 'cases-last-number')
		.attr("x", xScale(startEndDates[1]) - 10)
		.attr("y", yScale(latest[0].cases))
		.style("text-anchor", "end")


})
