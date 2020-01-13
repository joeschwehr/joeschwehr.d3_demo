let lineChart;
let donut1;
let donut2;

// FORMATTERS
const parseTime = d3.timeParse('%d/%m/%Y');
const formatTime = d3.timeFormat('%m/%d/%Y');

// COLOR SCALE
// const btcColor = d3
//     .scaleOrdinal()
//     .domain(Object.keys(data))
//     .range(
//         d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), Object.keys(data).length).reverse()
//     );

// SELECTORS
const coinSelector = d3.select('#coin-select');
const varSelector = d3.select('#var-select');

// Event Listeners
coinSelector.on('change', () => updateCharts());
varSelector.on('change', () => lineChart.wrangleData());

// Add jQuery UI slider
$('#date-slider').slider({
    range: true,
    max: parseTime('31/10/2017').getTime(),
    min: parseTime('12/5/2013').getTime(),
    step: 86400000, // One day
    values: [parseTime('12/5/2013').getTime(), parseTime('31/10/2017').getTime()],
    slide: function(event, ui) {
        $('#dateLabel1').text(formatTime(new Date(ui.values[0])));
        $('#dateLabel2').text(formatTime(new Date(ui.values[1])));

        updateCharts();
    }
});

let data = coinData; //this is from the coins.js data file
let filtered = {};
let coinDataForPieChart = [];
const coins = Object.keys(data);

for (const coin of coins) {
    const filteredCoin = data[coin].filter(d => d['24h_vol'] !== null);
    filteredCoin.forEach(d => {
        d.date = parseTime(d.date);
        d.price_usd = +d.price_usd;
        d.market_cap = +d.market_cap;
        d['24h_vol'] = +d['24h_vol'];

        coinDataForPieChart.push({
            coin: coin,
            date: d.date,
            price_usd: d.price_usd,
            market_cap: d.market_cap,
            '24h_vol': d['24h_vol']
        });
    });
    filtered = { ...filtered, [coin]: filteredCoin };
}

function arcClicked(arc) {
    $('#coin-select').val(arc.data.coin);
    updateCharts();
}

lineChart = new LineChart('#btc-chart-area', filtered);

const lastDay = d3.max(coinDataForPieChart.map(d => d.date));
const lastDayOfPieData = coinDataForPieChart.filter(d => d.date.getTime() === lastDay.getTime());
donut1 = new DonutChart('#donut1', lastDayOfPieData, '24h_vol');
donut2 = new DonutChart('#donut2', lastDayOfPieData, 'market_cap');

function updateCharts() {
    lineChart.wrangleData();
    donut1.wrangleData();
    donut2.wrangleData();
}
