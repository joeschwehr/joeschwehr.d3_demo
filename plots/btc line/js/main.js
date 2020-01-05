const coinstats = data => {
    const MARGIN = { left: 80, right: 100, top: 50, bottom: 100 },
        HEIGHT = 600 - MARGIN.top - MARGIN.bottom,
        WIDTH = 800 - MARGIN.left - MARGIN.right;

    let svg = d3
        .select('#btc-chart-area')
        .append('svg')
        .attr('width', WIDTH + MARGIN.left + MARGIN.right)
        .attr('height', HEIGHT + MARGIN.top + MARGIN.bottom);

    let g = svg.append('g').attr('transform', 'translate(' + MARGIN.left + ', ' + MARGIN.top + ')');

    // Time parser for x-scale
    const parseTime = d3.timeParse('%d/%m/%Y');

    // For tooltip
    const bisectDate = d3.bisector(d => d.date).left;

    // Scales
    let x = d3.scaleTime().range([0, WIDTH]);
    let y = d3.scaleLinear().range([HEIGHT, 0]);

    // SELECTORS
    const coinSelector = d3.select('#coin-select');
    let coinSelectorValue = coinSelector.node().value;
    const varSelector = d3.select('#var-select');
    let varSelectorValue = varSelector.node().value;

    // Axis generators
    let xAxisCall = d3.axisBottom();
    let yAxisCall = d3
        .axisLeft()
        .ticks(6)
        .tickFormat(d => {
            if (coinSelectorValue === 'bitcoin') {
                return parseInt(d / 1000) + 'k';
            }
            return d;
        });

    // Axis groups
    let xAxis = g
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${HEIGHT})`);
    let yAxis = g.append('g').attr('class', 'y axis');

    // Y-Axis label
    yAxis
        .append('text')
        .attr('class', 'axis-title')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .attr('fill', '#5D6971')
        .text('Price in Dollars');

    // Line path generator
    let line = d3
        .line()
        .x(d => x(d.date))
        .y(d => y(d[varSelectorValue]));

    // Data cleaning
    const dataKeys = Object.keys(data);
    for (const key of dataKeys) {
        data[key].forEach(coin => {
            coin.date = parseTime(coin.date);
            coin.price_usd = +coin.price_usd;
            coin.market_cap = +coin.market_cap;
            coin['24h_vol'] = +coin['24h_vol'];
        });
    }

    // COIN-SELECTOR CHANGE
    coinSelector.on('change', () => {
        coinSelectorValue = coinSelector.node().value;
        update();
    });

    // VAR SELECTOR CHANGE
    varSelector.on('change', () => {
        varSelectorValue = varSelector.node().value;
        update();
    });

    //add line
    g.append('path')
        .attr('class', 'btc-line')
        .attr('fill', 'none')
        .attr('stroke', 'grey')
        .attr('stroke-with', '3px');

    let formatTime = d3.timeFormat('%m/%d/%Y');

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
            // $('#dateLabel1').text(formatTime(new Date(ui.values[0])));
            // $('#dateLabel2').text(formatTime(new Date(ui.values[1])));
            update();
        }
    });

    //transition speed
    const t = () => d3.transition().duration(1000);

    function update() {
        // Set scale domains
        // rescale horizontally (and narrows data down by date range)
        const sliderValues = $('#date-slider').slider('values');
        x.domain([sliderValues[0], sliderValues[1]]);
        const newDataByTime = data[coinSelectorValue].filter(
            d => d.date.getTime() >= sliderValues[0] && d.date.getTime() <= sliderValues[1]
        );

        y.domain([
            d3.min(newDataByTime, d => d[varSelectorValue]),
            d3.max(newDataByTime, d => d[varSelectorValue])
        ]);

        // Generate axes once scales have been set
        xAxis.transition(t()).call(xAxisCall.scale(x));
        yAxis.transition(t()).call(yAxisCall.scale(y));

        // Redraws Line
        g.select('.btc-line')
            .transition(t)
            .attr('d', line(newDataByTime));
    }

    // Draw initial vis
    update();

    /******************************** Tooltip Code ********************************/

    let focus = g
        .append('g')
        .attr('class', 'btc-focus')
        .style('display', 'none');

    focus
        .append('line')
        .attr('class', 'x-hover-line btc-hover-line')
        .attr('y1', 0)
        .attr('y2', HEIGHT);

    focus
        .append('line')
        .attr('class', 'y-hover-line btc-hover-line')
        .attr('x1', 0)
        .attr('x2', WIDTH);

    focus.append('circle').attr('r', 7.5);

    focus
        .append('text')
        .attr('x', 15)
        .attr('dy', '.31em');

    g.append('rect')
        .attr('class', 'btc-overlay')
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .on('mouseover', function() {
            focus.style('display', null);
        })
        .on('mouseout', function() {
            focus.style('display', 'none');
        })
        .on('mousemove', mousemove);

    function mousemove() {
        let x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data[coinSelectorValue], x0, 1),
            d0 = data[coinSelectorValue][i - 1],
            d1 = data[coinSelectorValue][i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        focus.attr('transform', 'translate(' + x(d.date) + ',' + y(d[varSelectorValue]) + ')');
        focus.select('text').text(`${d[varSelectorValue]} (${formatTime(d.date)})`);
        focus.select('.x-hover-line').attr('y2', HEIGHT - y(d[varSelectorValue]));
        focus.select('.y-hover-line').attr('x2', -x(d.date));
    }

    /******************************** Tooltip Code ********************************/
};

coinstats(coinData);
