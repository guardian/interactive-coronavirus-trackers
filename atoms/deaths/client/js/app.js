import * as d3 from 'd3'
import loadJson from 'shared/js/load-json'
import { numberWithCommas, getDataUrlForEnvironment  } from 'shared/js/util'

let dataurl = getDataUrlForEnvironment();


let isMobile = window.matchMedia('(max-width: 620px)').matches;

const atomEl = d3.select('.interactive-wrapper').node();

let w = atomEl.getBoundingClientRect().width;
let h = isMobile ? w * 1.6 : 752 * w / 1260;

let margin = {top: 30, right: 20, bottom: 50, left: 20};
let width = w - margin.left - margin.right;
let height = h - margin.top - margin.bottom;

let xScale = d3.scaleTime()
.range([margin.left, width])

let yScale = d3.scaleLinear()
.range([height, 0]);

let line = d3.line()
.x( d => xScale(d.date))
.y( d => yScale(d.deaths))
//.curve(d3.curveMonotoneX)

const parseTime = d3.timeParse("%m/%d/%y");

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

loadJson(dataurl)
.then(fileRaw => {

	headline.html(fileRaw.sheets.deaths_furniture[0].text)
	timestamp.html(fileRaw.sheets.deaths_furniture[3].text)
	source.html(fileRaw.sheets.deaths_furniture[1].text + " " + fileRaw.sheets.deaths_furniture[2].text)


	let obj = fileRaw.sheets.main_deaths[0];

	Object.entries(obj).map(e => {

		if(e[0].indexOf('/20') > -1 || e[0].indexOf('/21') > -1)dates.push(e[0])

	})

	fileRaw.sheets.main_deaths.map((p,i) => {

		places.push({province:p['Province/State'], country:p['Country/Region'], lat:p.Lat, lon:p.Long, deaths:[]})


		dates.map(d => places[i].deaths.push({date: d, deaths: +p[d]}))

	})


	dates.map(d => {

		let deathsByDate = places.map(p => p.deaths.find(c => c.date === d))

		let deaths = deathsByDate.reduce((a, b) => a + b.deaths, 0);

		latest.push({date:parseTime(d), deaths:deaths});
	})

	let deathsScale = 0;
	let deathsScaleStr = '0';
	
	latest.sort((a,b) => (b.date > a.date) ? 1 : ((a.date > b.date) ? -1 : 0));

	if(latest[0].deaths.toString().length <= 4)
	{
		deathsScale = 100;
		deathsScaleStr = 'hundred';
	}
	if(latest[0].deaths.toString().length > 4 && latest[0].deaths.toString().length < 7)
	{
		deathsScale = 1000;
		deathsScaleStr = 'thousand';
	}
	else if(latest[0].deaths.toString().length >= 7 && latest[0].deaths.toString().length < 10)
	{
		deathsScale = 1000000;
		deathsScaleStr = 'million';
	}

//-----------UNCOMMENT FOR TESTING------------------------
//let startEndDates = [new Date('January 21, 2020 03:24:00'), new Date('March 20, 2020 03:24:00')];

let startEndDates = d3.extent(latest, d => d.date);

let days = d3.timeDay.range(startEndDates[0], startEndDates[1]).length;
let months = d3.timeMonth.range(startEndDates[0], startEndDates[1]).length;
let years = d3.timeYear.range(startEndDates[0], startEndDates[1]).length;

xScale.domain(startEndDates);
yScale.domain([0, Math.round(latest[0].deaths / deathsScale) * deathsScale]);

let yTicks = parseInt(latest[0].deaths.toString().length) + 1 ;

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
			.tickFormat(d => d / deathsScale)
			)
		.selectAll("text")
		.style("text-anchor", "start")
		.attr('x', 0)
		.attr('y', -10);

		let yTicksNodes = d3.selectAll('.y.axis g').nodes();
		let currentText = yTicksNodes[yTicksNodes.length-1].childNodes[1].innerHTML;

		yTicksNodes[yTicksNodes.length-1].childNodes[1].innerHTML = currentText + " " +deathsScaleStr

		d3.select('.y.axis .domain').remove()
		d3.selectAll('.x.axis .domain').remove()
		d3.selectAll('.x.axis.months line').remove()

		svg.append("path")
		.datum(latest)
		.attr("class", "deaths-chart-line")
		.attr("d", line);

		svg.selectAll(".deaths-chart-dot")
		.data(latest)
		.enter().append("circle")
		.attr("class", "deaths-chart-dot")
		.attr("cx", d => xScale(d.date))
		.attr("cy", d => yScale(d.deaths))
		.attr("r", latest.length < 40 ? 5 : 3);

		svg.append('text')
		.text(numberWithCommas(latest[0].deaths))
		.attr('class', 'deaths-last-number')
		.attr("x", xScale(startEndDates[1]))
		.attr("y", yScale(latest[0].deaths) - 10)
		.style("text-anchor", "end")

})
