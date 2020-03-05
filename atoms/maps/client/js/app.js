import * as d3B from 'd3'
import loadJson from 'shared/js/load-json'
import * as topojson from 'topojson'
import countries from 'assets/ne_10m_admin_0_countries.json'
import * as geo from 'd3-geo-projection'
import { numberWithCommas, getDataUrlForEnvironment  } from 'shared/js/util'

let dataurl = getDataUrlForEnvironment();

const d3 = Object.assign({}, d3B, geo);

const headline = d3.select(".interactive-maps-wrapper").append("h2").attr('class', 'headline');
const standfirst = d3.select(".interactive-maps-wrapper").append("div").attr('class', 'standfirst');
const maps = d3.select(".interactive-maps-wrapper").append("div").attr('class', 'interactive-maps-wrapper-maps');

let isMobile = window.matchMedia('(max-width: 620px)').matches;

const atomEl = d3.select('.interactive-maps-wrapper').node();

let width = isMobile ? atomEl.getBoundingClientRect().width : (atomEl.getBoundingClientRect().width / 3) - 10;
let height =  width * 2.5 / 5;

let countriesStr = [{iso:'NI',name:'North Ireland'},{iso:'SMR',name:'San Marino'},{name:"├àland", iso: 'ALA'},{name:"Afghanistan", iso: 'AFG'},{name:"Albania", iso: 'ALB'},{name:"Algeria", iso: 'DZA'},{name:"American Samoa", iso: 'ASM'},{name:"Andorra", iso: 'AND'},{name:"Angola", iso: 'AGO'},{name:"Antigua and Barb.", iso: 'ATG'},{name:"Argentina", iso: 'ARG'},{name:"Armenia", iso: 'ARM'},{name:"Aruba", iso: 'ABW'},{name:"Australia", iso: 'AUS'},{name:"Austria", iso: 'AUT'},{name:"Azerbaijan", iso: 'AZE'},{name:"Bahamas", iso: 'BHS'},{name:"Bahrain", iso: 'BHR'},{name:"Bangladesh", iso: 'BGD'},{name:"Barbados", iso: 'BRB'},{name:"Belarus", iso: 'BLR'},{name:"Belgium", iso: 'BEL'},{name:"Belize", iso: 'BLZ'},{name:"Benin", iso: 'BEN'},{name:"Bhutan", iso: 'BTN'},{name:"Bolivia", iso: 'BOL'},{name:"Bosnia and Herz.", iso: 'BIH'},{name:"Botswana", iso: 'BWA'},{name:"Brazil", iso: 'BRA'},{name:"Brunei", iso: 'BRN'},{name:"Bulgaria", iso: 'BGR'},{name:"Burkina Faso", iso: 'BFA'},{name:"Burundi", iso: 'BDI'},{name:"C├┤te d'Ivoire", iso: 'CIV'},{name:"Cabo Verde", iso: 'CPV'},{name:"Cambodia", iso: 'KHM'},{name:"Cameroon", iso: 'CMR'},{name:"Canada", iso: 'CAN'},{name:"Cayman Is.", iso: 'CYM'},{name:"Central African Rep.", iso: 'CAF'},{name:"Chad", iso: 'TCD'},{name:"Chile", iso: 'CHL'},{name:"China", iso: 'CHN'},{name:"Colombia", iso: 'COL'},{name:"Comoros", iso: 'COM'},{name:"Congo", iso: 'COG'},{name:"Costa Rica", iso: 'CRI'},{name:"Croatia", iso: 'HRV'},{name:"Cuba", iso: 'CUB'},{name:"Cura├ºao", iso: 'CUW'},{name:"Cyprus", iso: 'CYP'},{name:"Czechia", iso: 'CZE'},{name:"Dem. Rep. Congo", iso: 'COD'},{name:"Denmark", iso: 'DNK'},{name:"Djibouti", iso: 'DJI'},{name:"Dominica", iso: 'DMA'},{name:"Dominican Rep.", iso: 'DOM'},{name:"Ecuador", iso: 'ECU'},{name:"Egypt", iso: 'EGY'},{name:"El Salvador", iso: 'SLV'},{name:"Eq. Guinea", iso: 'GNQ'},{name:"Eritrea", iso: 'ERI'},{name:"Estonia", iso: 'EST'},{name:"eSwatini", iso: 'SWZ'},{name:"Ethiopia", iso: 'ETH'},{name:"Faeroe Is.", iso: 'FRO'},{name:"Falkland Is.", iso: 'FLK'},{name:"Fiji", iso: 'FJI'},{name:"Finland", iso: 'FIN'},{name:"Fr. Polynesia", iso: 'PYF'},{name:"Fr. S. Antarctic Lands", iso: 'ATF'},{name:"France", iso: 'FRA'},{name:"Gabon", iso: 'GAB'},{name:"Gambia", iso: 'GMB'},{name:"Georgia", iso: 'GEO'},{name:"Germany", iso: 'DEU'},{name:"Ghana", iso: 'GHA'},{name:"Gibraltar", iso: 'GIB'},{name:"Greece", iso: 'GRC'},{name:"Greenland", iso: 'GRL'},{name:"Grenada", iso: 'GRD'},{name:"Guam", iso: 'GUM'},{name:"Guatemala", iso: 'GTM'},{name:"Guinea", iso: 'GIN'},{name:"Guinea-Bissau", iso: 'GNB'},{name:"Guyana", iso: 'GUY'},{name:"Haiti", iso: 'HTI'},{name:"Heard I. and McDonald Is.", iso: 'HMD'},{name:"Honduras", iso: 'HND'},{name:"Hong Kong", iso: 'HKG'},{name:"Hungary", iso: 'HUN'},{name:"Iceland", iso: 'ISL'},{name:"India", iso: 'IND'},{name:"Indonesia", iso: 'IDN'},{name:"Iran", iso: 'IRN'},{name:"Iraq", iso: 'IRQ'},{name:"Ireland", iso: 'IRL'},{name:"Isle of Man", iso: 'IMN'},{name:"Israel", iso: 'ISR'},{name:"Italy", iso: 'ITA'},{name:"Jamaica", iso: 'JAM'},{name:"Japan", iso: 'JPN'},{name:"Jersey", iso: 'JEY'},{name:"Jordan", iso: 'JOR'},{name:"Kazakhstan", iso: 'KAZ'},{name:"Kenya", iso: 'KEN'},{name:"Kiribati", iso: 'KIR'},{name:"Kuwait", iso: 'KWT'},{name:"Kyrgyzstan", iso: 'KGZ'},{name:"Laos", iso: 'LAO'},{name:"Latvia", iso: 'LVA'},{name:"Lebanon", iso: 'LBN'},{name:"Lesotho", iso: 'LSO'},{name:"Liberia", iso: 'LBR'},{name:"Libya", iso: 'LBY'},{name:"Liechtenstein", iso: 'LIE'},{name:"Lithuania", iso: 'LTU'},{name:"Luxembourg", iso: 'LUX'},{name:"Macau", iso: 'MAC'},{name:"Macedonia", iso: 'MKD'},{name:"Madagascar", iso: 'MDG'},{name:"Malawi", iso: 'MWI'},{name:"Malaysia", iso: 'MYS'},{name:"Mali", iso: 'MLI'},{name:"Malta", iso: 'MLT'},{name:"Mauritania", iso: 'MRT'},{name:"Mauritius", iso: 'MUS'},{name:"Mexico", iso: 'MEX'},{name:"Micronesia", iso: 'FSM'},{name:"Moldova", iso: 'MDA'},{name:"Monaco", iso: 'MCO'},{name:"Mongolia", iso: 'MNG'},{name:"Montenegro", iso: 'MNE'},{name:"Montserrat", iso: 'MSR'},{name:"Morocco", iso: 'MAR'},{name:"Mozambique", iso: 'MOZ'},{name:"Myanmar", iso: 'MMR'},{name:"N. Mariana Is.", iso: 'MNP'},{name:"Namibia", iso: 'NAM'},{name:"Nepal", iso: 'NPL'},{name:"Netherlands", iso: 'NLD'},{name:"New Caledonia", iso: 'NCL'},{name:"New Zealand", iso: 'NZL'},{name:"Nicaragua", iso: 'NIC'},{name:"Niger", iso: 'NER'},{name:"Nigeria", iso: 'NGA'},{name:"Niue", iso: 'NIU'},{name:"North Korea", iso: 'PRK'},{name:"Norway", iso: 'NOR'},{name:"Oman", iso: 'OMN'},{name:"Pakistan", iso: 'PAK'},{name:"Palau", iso: 'PLW'},{name:"Palestine", iso: 'PSE'},{name:"Panama", iso: 'PAN'},{name:"Papua New Guinea", iso: 'PNG'},{name:"Paraguay", iso: 'PRY'},{name:"Peru", iso: 'PER'},{name:"Philippines", iso: 'PHL'},{name:"Poland", iso: 'POL'},{name:"Portugal", iso: 'PRT'},{name:"Puerto Rico", iso: 'PRI'},{name:"Qatar", iso: 'QAT'},{name:"Romania", iso: 'ROU'},{name:"Russia", iso: 'RUS'},{name:"Rwanda", iso: 'RWA'},{name:"S. Sudan", iso: 'SSD'},{name:"S├úo Tom├® and Principe", iso: 'STP'},{name:"Saint Helena", iso: 'SHN'},{name:"Saint Lucia", iso: 'LCA'},{name:"Samoa", iso: 'WSM'},{name:"Saudi Arabia", iso: 'SAU'},{name:"Senegal", iso: 'SEN'},{name:"Serbia", iso: 'SRB'},{name:"Sierra Leone", iso: 'SLE'},{name:"Singapore", iso: 'SGP'},{name:"Slovakia", iso: 'SVK'},{name:"Slovenia", iso: 'SVN'},{name:"Solomon Is.", iso: 'SLB'},{name:"Somalia", iso: 'SOM'},{name:"South Africa", iso: 'ZAF'},{name:"South Korea", iso: 'KOR'},{name:"Spain", iso: 'ESP'},{name:"Sri Lanka", iso: 'LKA'},{name:"St-Martin", iso: 'MAF'},{name:"St. Kitts and Nevis", iso: 'KNA'},{name:"St. Pierre and Miquelon", iso: 'SPM'},{name:"St. Vin. and Gren.", iso: 'VCT'},{name:"Sudan", iso: 'SDN'},{name:"Suriname", iso: 'SUR'},{name:"Sweden", iso: 'SWE'},{name:"Switzerland", iso: 'CHE'},{name:"Syria", iso: 'SYR'},{name:"Taiwan", iso: 'TWN'},{name:"Tajikistan", iso: 'TJK'},{name:"Tanzania", iso: 'TZA'},{name:"Thailand", iso: 'THA'},{name:"Timor-Leste", iso: 'TLS'},{name:"Togo", iso: 'TGO'},{name:"Tonga", iso: 'TON'},{name:"Trinidad and Tobago", iso: 'TTO'},{name:"Tunisia", iso: 'TUN'},{name:"Turkey", iso: 'TUR'},{name:"Turkmenistan", iso: 'TKM'},{name:"Turks and Caicos Is.", iso: 'TCA'},{name:"U.S. Virgin Is.", iso: 'VIR'},{name:"Uganda", iso: 'UGA'},{name:"Ukraine", iso: 'UKR'},{name:"UAE", iso: 'ARE'},{name:"United Kingdom", iso: 'GBR'},{name:"US", iso: 'USA'},{name:"Uruguay", iso: 'URY'},{name:"Uzbekistan", iso: 'UZB'},{name:"Vanuatu", iso: 'VUT'},{name:"Venezuela", iso: 'VEN'},{name:"Vietnam", iso: 'VNM'},{name:"W. Sahara", iso: 'ESH'},{name:"Yemen", iso: 'YEM'},{name:"Zambia", iso: 'ZMB'},{name:"Zimbabwe", iso: 'ZWE'}];

const parseTime = d3.timeParse("%m/%d/%y");

const formatMonths = d3.timeFormat("%B");

const projection = d3.geoFahey()
.rotate([-155,0,0]);

let path = d3.geoPath()
.projection(projection);

const land = topojson.merge(countries, countries.objects.ne_10m_admin_0_countries.geometries);
const world = topojson.feature(countries, countries.objects.ne_10m_admin_0_countries);

projection.fitExtent([[0, 0], [width, height]], world);

let dates;

let data = [];

let selectedCountry = [];

let places = [];

let newCountries = [];

//projection.fitExtent([[0, 0], [atomEl.getBoundingClientRect().width, atomEl.getBoundingClientRect().width / 3]], world);


/*const svg = d3.select(".interactive-maps-wrapper")
.append('svg')
.attr('width', atomEl.getBoundingClientRect().width)
.attr('height', atomEl.getBoundingClientRect().width / 3)

svg.selectAll('path')
.data(world.features)
.enter()
.append('path')
.attr('d', path)
.attr('class', d => d.properties.ISO_A3)
.attr('fill', '#dadada')*/

loadJson(dataurl)
.then(fileRaw => {

	headline.html(fileRaw.sheets.small_multiples_furniture[0].text)
	standfirst.html(fileRaw.sheets.small_multiples_furniture[1].text)

	dates = Object.getOwnPropertyNames(fileRaw.sheets.main_cases[0]).filter(e => e.indexOf('/20') != -1 || e.indexOf('/21') != -1);

	let selectedDates = fileRaw.sheets.small_multiples;

	//console.log(selectedDates)

	/*let selectedDates = [

{date:'1/22/20'},
{date:'1/23/20'},
{date:'1/24/20'},
{date:'1/25/20'},
{date:'1/26/20'},
{date:'1/27/20'},
{date:'1/28/20'},
{date:'1/29/20'},
{date:'1/30/20'},
{date:'1/31/20'},
{date:'2/1/20'},
{date:'2/2/20'},
{date:'2/3/20'},
{date:'2/4/20'},
{date:'2/5/20'},
{date:'2/6/20'},
{date:'2/7/20'},
{date:'2/8/20'},
{date:'2/9/20'},
{date:'2/10/20'},
{date:'2/11/20'},
{date:'2/12/20'},
{date:'2/13/20'},
{date:'2/14/20'},
{date:'2/15/20'},
{date:'2/16/20'},
{date:'2/17/20'},
{date:'2/18/20'},
{date:'2/19/20'},
{date:'2/20/20'},
{date:'2/21/20'},
{date:'2/22/20'},
{date:'2/23/20'},
{date:'2/24/20'},
{date:'2/25/20'},
{date:'2/26/20'},
{date:'2/27/20'},
{date:'2/28/20'},
{date:'2/29/20'},
{date:'3/1/20'},
{date:'3/2/20'},
{date:'3/3/20'},
{date:'3/4/20'}

]*/


	fileRaw.sheets.main_cases.map((p,i) => {

		places.push({province:p['Province/State'], country:p['Country/Region'], lat:p.Lat, lon:p.Long, cases:[]})

		dates.map(d => {
			places[i].cases.push({date: d, cases: +p[d]});
			newCountries[d] = [];
	})

	})

	fileRaw.sheets.main_cases.map(p =>{

		let acum = 0;

		dates.map((d,i) => {

			p[dates[i]] = +p[dates[i]] - acum;


			if(+p[dates[i]] > 0 && selectedCountry.indexOf(p.ISO_A3) < 0)
			{
				newCountries[dates[i]].push(p.ISO_A3)

				selectedCountry.push(p.ISO_A3)
			}

			acum += +p[dates[i]]

		})

	})

	data = fileRaw.sheets.main_cases;

	selectedDates.map(d =>{

		makeMap(d.date)

	})

});


const makeMap = (date) =>{

	let div = d3.select('.interactive-maps-wrapper-maps')
	.append('div')
	.attr('class', 'map')

	div.append('h3')
    .text( parseTime(date).getDate() + " " + formatMonths(parseTime(date)) )

    let count = div.append('p')
    .attr('class', 'total')
    .attr('width', width)

    let mapStandfirst = div.append('p')
    .attr('class', 'map-standfirst')
    .attr('width', width)

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


	for (var i = 0; i < dates.length; i++) {


		if(dates[i] != date){

			newCountries[dates[i]].forEach(s => {

				let selectedC = topojson.feature(countries, {
					type: "GeometryCollection",
					geometries: countries.objects.ne_10m_admin_0_countries.geometries.filter(g => g.properties.ISO_A3 === s)
				});


				let colorSelected = "#DADADA";

				context.fillStyle = colorSelected;
				context.beginPath();
				path(selectedC);
				context.fill();

			})
		}
		else{break}
		
	}


	let colorSelected = "#C70000";
	let colorFill = "#E9C6BC";
	let cStr = 'New cases in ';
	let cInt = 0;
	let acum = 0;

	places.map(p => { p.cases.map(c => {

		if(c.date === date)
		{
			acum += c.cases;
		}
	})})
	newCountries[date].map(nc => {
		if(nc != '-99'){

			let n = countriesStr.find(c => c.iso === nc).name

			cStr += n + ', '

			const selectedC = topojson.feature(countries, {
				type: "GeometryCollection",
				geometries: countries.objects.ne_10m_admin_0_countries.geometries.filter(g => g.properties.ISO_A3 === nc)
			});

			context.fillStyle = colorFill;
			context.beginPath();
			path(selectedC);
			
			context.fill();

			/*svg.select('.' + d.ISO_A3)
			.attr('fill', '#E9C6BC')*/

			//selectedCountry.push(d.ISO_A3)
		}
	})

	data.map(d => {

		cInt += d[date];


		if(d[date] > 0){

				let posX = projection([d.Long, d.Lat])[0];
				let posY = projection([d.Long, d.Lat])[1];

				context.fillStyle = colorSelected;
				context.beginPath()
				context.arc(posX, posY,1.5, 0, Math.PI*2)
				context.fill();

		}
	})


	if(cStr.split(',').length > 1)
	{
		cStr = cStr.substr(0, cStr.length -2)
	}
	else{
		cStr = ''
	}

	
	mapStandfirst.html(cStr.replace(/,(?=[^,]*$)/, ' and'))
	count.html('Daily cases ' + numberWithCommas(cInt) + ' | Total cases ' + numberWithCommas(acum))
}
