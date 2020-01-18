//Globals
const CHART_MARGIN = { top: 50, right: 20, bottom: 40, left: 60 };
const CHART_WIDTH = 750 - CHART_MARGIN.left - CHART_MARGIN.right;
const CHART_HEIGHT = 450 - CHART_MARGIN.top - CHART_MARGIN.bottom;
const parseDate = d3.timeParse('%d/%m/%Y');
let stackedAreaChart;
let brushZone;
let donutChart;
let barChartRevenue;
let barChartDuration;

// Events listeners & selections
let dbDropdown = d3.select('#db-var-select');
dbDropdown.on('change', () => updateAllVis());

// data formatting
db_data.forEach(d => {
    if (d.call_duration < 0) {
        d.call_duration = -d.call_duration;
    }

    const split = d.date.split('/');
    d.date = [split[0], split[1], '2019'].join('/');
    d.date = parseDate(d.date);
});

// data by day (for stacked chart)
let avgCallRevenue = [];
let avgCallDuration = [];
let avgUnitsSold = [];
let totalRevenue = [];
let totalDuration = [];
let totalUnits = [];

// calculate aveage metrics per day
const calcDataForStackChart = data => {
    let allDates = new Set(data.map(d => d.date.getTime()));
    allDates = [...allDates];

    allDates.forEach(date => {
        const callsOnGivenDay = data.filter(d => d.date.getTime() === date);

        const westCalls = callsOnGivenDay.filter(d => d.team === 'west');
        const sCalls = callsOnGivenDay.filter(d => d.team === 'south');
        const mwCalls = callsOnGivenDay.filter(d => d.team === 'midwest');
        const neCalls = callsOnGivenDay.filter(d => d.team === 'northeast');

        function calc(desired = 'total', metric, array) {
            let westAvg;
            let southAvg;
            let midwestAvg;
            let neAvg;

            if (desired === 'average') {
                westAvg = d3.sum(westCalls.map(d => d[metric])) / westCalls.length;
                southAvg = d3.sum(sCalls.map(d => d[metric])) / sCalls.length;
                midwestAvg = d3.sum(mwCalls.map(d => d[metric])) / mwCalls.length;
                neAvg = d3.sum(neCalls.map(d => d[metric])) / neCalls.length;
            } else {
                westAvg = d3.sum(westCalls.map(d => d[metric]));
                southAvg = d3.sum(sCalls.map(d => d[metric]));
                midwestAvg = d3.sum(mwCalls.map(d => d[metric]));
                neAvg = d3.sum(neCalls.map(d => d[metric]));
            }

            array.push({
                date: new Date(date),
                west: Number(westAvg.toFixed(2)),
                midwest: Number(southAvg.toFixed(2)),
                south: Number(midwestAvg.toFixed(2)),
                northeast: Number(neAvg.toFixed(2))
            });
        }
        calc('average', 'call_revenue', avgCallRevenue);
        calc('average', 'call_duration', avgCallDuration);
        calc('average', 'units_sold', avgUnitsSold);
        calc('total', 'call_revenue', totalRevenue);
        calc('total', 'call_duration', totalDuration);
        calc('total', 'units_sold', totalUnits);
    });
};
calcDataForStackChart(db_data);

const brushMove = () => {
    // GET BRUSH INPUT
    let selection = d3.event.selection || brushZone.x.range();
    let brushDates = selection.map(d => brushZone.x.invert(d));

    // UPDATE PAGE LABELS
    const formatTime = d3.timeFormat('%m/%d/%y');
    d3.select('#db-dateLabel1').text(formatTime(brushDates[0]));
    d3.select('#db-dateLabel2').text(formatTime(brushDates[1]));

    // REWRANGLE
    updateAllVis(brushDates);
};

// create instances of the vis objects
stackedAreaChart = new StackedAreaChart('#db-stacked-area');
brushZone = new TimeLine('#db-timeline');

const updateAllVis = brushDates => {
    stackedAreaChart.wrangleData(brushDates);
    brushZone.wrangleData();
};
