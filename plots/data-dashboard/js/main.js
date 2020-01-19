//Globals
const CHART_MARGIN = { top: 50, right: 20, bottom: 40, left: 60 };
const CHART_WIDTH = 800 - CHART_MARGIN.left - CHART_MARGIN.right;
const CHART_HEIGHT = 460 - CHART_MARGIN.top - CHART_MARGIN.bottom;
const parseDate = d3.timeParse('%d/%m/%Y');
let stackedAreaChart;
let brushZone;
let donutChart;
let barChartUnits;
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

        function calc(metric, array) {
            let westAvg;
            let southAvg;
            let midwestAvg;
            let neAvg;

            westAvg = d3.sum(westCalls.map(d => d[metric]));
            southAvg = d3.sum(sCalls.map(d => d[metric]));
            midwestAvg = d3.sum(mwCalls.map(d => d[metric]));
            neAvg = d3.sum(neCalls.map(d => d[metric]));

            array.push({
                date: new Date(date),
                west: Number(westAvg.toFixed(2)),
                midwest: Number(southAvg.toFixed(2)),
                south: Number(midwestAvg.toFixed(2)),
                northeast: Number(neAvg.toFixed(2))
            });
        }

        calc('call_revenue', totalRevenue);
        calc('call_duration', totalDuration);
        calc('units_sold', totalUnits);
    });
};
calcDataForStackChart(db_data);

let brushDates = d3.extent(db_data, d => d.date);
const brushMove = () => {
    // GET BRUSH INPUT
    let selection = d3.event.selection || brushZone.x.range();
    brushDates = selection.map(d => brushZone.x.invert(d));

    // UPDATE PAGE LABELS
    const formatTime = d3.timeFormat('%m/%d/%y');
    d3.select('#db-dateLabel1').text(formatTime(brushDates[0]));
    d3.select('#db-dateLabel2').text(formatTime(brushDates[1]));

    // REWRANGLE
    updateAllVis();
};

// create instances of the vis objects
stackedAreaChart = new StackedAreaChart('#db-stacked-area');
brushZone = new TimeLine('#db-timeline');

donutChart = new DonutChart1('#db-company-size');

barChartUnits = new BarChart('#db-units-sold', 'Units Sold Per Call', 'units_sold');
barChartRevenue = new BarChart('#db-revenue', 'Average Call Revenue (USD)', 'call_revenue');
barChartDuration = new BarChart(
    '#db-call-duration',
    'Average Call Duration (seconds)',
    'call_duration'
);

const updateAllVis = () => {
    stackedAreaChart.wrangleData(brushDates);
    brushZone.wrangleData();
    barChartUnits.wrangleData(brushDates);
    barChartRevenue.wrangleData(brushDates);
    barChartDuration.wrangleData(brushDates);
    donutChart.wrangleData(brushDates);
};
