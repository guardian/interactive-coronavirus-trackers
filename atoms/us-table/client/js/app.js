import { $, getAmericaDataUrlForEnvironment } from "shared/js/util"
import loadJson from 'shared/js/load-json'
import filter from 'lodash/fp/filter'
import map from 'lodash/fp/map'
import groupBy from 'lodash/fp/groupBy'
import mapValues from 'lodash/fp/mapValues'
import flow from 'lodash/fp/flow'
import toPairs from 'lodash/fp/toPairs'

const sum = (a, b) => a + b

const states = [{"name":"Minnesota","code":"MN"},{"name":"Washington","code":"WA"},{"name":"Idaho","code":"ID"},{"name":"Montana","code":"MT"},{"name":"North Dakota","code":"ND"},{"name":"Michigan","code":"MI"},{"name":"Maine","code":"ME"},{"name":"Ohio","code":"OH"},{"name":"New Hampshire","code":"NH"},{"name":"New York","code":"NY"},{"name":"Vermont","code":"VT"},{"name":"Pennsylvania","code":"PA"},{"name":"Arizona","code":"AZ"},{"name":"California","code":"CA"},{"name":"New Mexico","code":"NM"},{"name":"Texas","code":"TX"},{"name":"Alaska","code":"AK"},{"name":"Louisiana","code":"LA"},{"name":"Mississippi","code":"MS"},{"name":"Alabama","code":"AL"},{"name":"Florida","code":"FL"},{"name":"Georgia","code":"GA"},{"name":"South Carolina","code":"SC"},{"name":"North Carolina","code":"NC"},{"name":"Virginia","code":"VA"},{"name":"District of Columbia","code":"DC"},{"name":"Maryland","code":"MD"},{"name":"Delaware","code":"DE"},{"name":"New Jersey","code":"NJ"},{"name":"Connecticut","code":"CT"},{"name":"Rhode Island","code":"RI"},{"name":"Massachusetts","code":"MA"},{"name":"Oregon","code":"OR"},{"name":"Hawaii","code":"HI"},{"name":"Utah","code":"UT"},{"name":"Wyoming","code":"WY"},{"name":"Nevada","code":"NV"},{"name":"Colorado","code":"CO"},{"name":"South Dakota","code":"SD"},{"name":"Nebraska","code":"NE"},{"name":"Kansas","code":"KS"},{"name":"Oklahoma","code":"OK"},{"name":"Iowa","code":"IA"},{"name":"Missouri","code":"MO"},{"name":"Wisconsin","code":"WI"},{"name":"Illinois","code":"IL"},{"name":"Kentucky","code":"KY"},{"name":"Arkansas","code":"AR"},{"name":"Tennessee","code":"TN"},{"name":"West Virginia","code":"WV"},{"name":"Indiana","code":"IN"}]

const stateCodes = states.map( o => o.code )

const populateTable = data => {

    console.log(data)

    const byState = flow(

        filter( row => row['Province/State'] !== '' ),
        map( row => {

            const code = row['Province/State'].split(', ').slice(-1)[0].replace(/\./g, '')

            console.log(code)

            return Object.assign({}, row, { code })
        
        }),
        groupBy('code'),
        mapValues( arr => {

            return arr.map( row => Number(row.cases)).reduce(sum, 0)

        } ),
        toPairs

    )(data)

    const tableData = byState.filter( t => stateCodes.indexOf(t[0]) >= 0 )
        .map( t => {

            const name = states.find( o => o.code === t[0] ).name
            const cases = t[1]
            return { name, cases }
        
        } )
        .sort((a, b) => {

            return a.cases === b.cases ? ( a.name > b.name ? 1 : -1 ) : b.cases - a.cases

        })

    const html = tableData.map( row => {

        return `<tr>
        <td>${row.name}</td>
        <td class='co-td-cases'>${row.cases}</td>
        </tr>`

    } ).join('')

    $('.co-tbody').innerHTML = html
}

const url = getAmericaDataUrlForEnvironment()

loadJson(url).then( data => populateTable(data.sheets.america_cases) )