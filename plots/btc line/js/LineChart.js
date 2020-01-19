class LineChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initVis();
    }

    initVis() {
        this.MARGIN = { left: 50, right: 25, top: 30, bottom: 40 };
        this.HEIGHT = 400 - this.MARGIN.top - this.MARGIN.bottom;
        this.WIDTH = 800 - this.MARGIN.left - this.MARGIN.right;

        this.svg = d3
            .select(this.parentElement)
            .append('svg')
            .attr('width', this.WIDTH + this.MARGIN.left + this.MARGIN.right)
            .attr('height', this.HEIGHT + this.MARGIN.top + this.MARGIN.bottom);

        this.g = this.svg
            .append('g')
            .attr('transform', 'translate(' + this.MARGIN.left + ', ' + this.MARGIN.top + ')');

        this.color = d3
            .scaleOrdinal()
            .domain(Object.keys(this.data))
            .range(d3.schemeCategory10);

        //add line for the first time
        this.g
            .append('path')
            .attr('class', 'btc-line')
            .attr('fill', 'none')
            .attr('stroke', 'grey')
            .attr('stroke-width', '1.5px');

        // Y-Axis label
        this.yAxis = this.g.append('g').attr('class', 'btc-axis');
        this.yAxis
            .append('text')
            .attr('class', 'axis-title')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .attr('fill', '#5D6971')
            .text('Price in Dollars');

        // Scales
        this.x = d3.scaleTime().range([0, this.WIDTH]);
        this.y = d3.scaleLinear().range([this.HEIGHT, 0]);

        // Axis groups
        this.xAxis = this.g
            .append('g')
            .attr('class', 'btc-axis')
            .attr('transform', `translate(0, ${this.HEIGHT})`);

        this.wrangleData();
    }

    wrangleData() {
        const coinSelector = d3.select('#coin-select');
        this.coinSelectorValue = coinSelector.node().value;

        const varSelector = d3.select('#var-select');
        this.varSelectorValue = varSelector.node().value;

        // Set scale domains
        // rescale horizontally (and narrows data down by date range)
        this.sliderValues = $('#date-slider').slider('values');
        this.newDataByTime = this.data[this.coinSelectorValue].filter(
            d =>
                d.date.getTime() >= this.sliderValues[0] && d.date.getTime() <= this.sliderValues[1]
        );

        this.updateVis();
    }

    updateVis() {
        // Fix for format values
        function formatAbbreviation(x) {
            const formatSi = d3.format('.2s');
            let s = formatSi(x);

            // checks last character of formatted output
            switch (s[s.length - 1]) {
                case 'G':
                    return s.slice(0, -1) + 'B'; //removes last character and replaces it with 'B'
                case 'k':
                    return s.slice(0, -1) + 'K';
                case 'm':
                    return x;
            }
            return s;
        }

        // this.x.domain([this.sliderValues[0], this.sliderValues[1]]);
        this.x.domain(d3.extent(this.newDataByTime, d => d.date));
        this.y.domain([
            d3.min(this.newDataByTime, d => d[this.varSelectorValue]),
            d3.max(this.newDataByTime, d => d[this.varSelectorValue])
        ]);

        //transition speed
        this.t = () => d3.transition().duration(1000);
        // Axis generators
        this.xAxisCall = d3.axisBottom();
        this.yAxisCall = d3.axisLeft().ticks(6);
        // Generate axes once scales have been set
        this.xAxis.transition(this.t()).call(this.xAxisCall.scale(this.x));
        this.yAxisCall.scale(this.y);
        this.yAxis.transition(this.t()).call(this.yAxisCall.tickFormat(formatAbbreviation));

        // Path generator
        let line = d3
            .line()
            .x(d => this.x(d.date))
            .y(d => this.y(d[this.varSelectorValue]));

        // Redraws Line/update our line path
        this.g
            .select('.btc-line')
            .attr('stroke', d => {
                return this.color(this.coinSelectorValue);
            })
            .transition(this.t)
            .attr('d', line(this.newDataByTime));

        /******************************** Tooltip Code ********************************/
        // Discard old tooltip elements
        d3.select('.btc-focus.' + this.coinSelectorValue).remove();
        d3.select('.btc-overlay.' + this.coinSelectorValue).remove();

        let focus = this.g
            .append('g')
            .attr('class', 'btc-focus ' + this.coinSelectorValue)
            .style('display', 'none');

        focus
            .append('line')
            .attr('class', 'x-hover-line btc-hover-line')
            .attr('y1', 0)
            .attr('y2', this.HEIGHT);

        focus
            .append('line')
            .attr('class', 'y-hover-line btc-hover-line')
            .attr('x1', 0)
            .attr('x2', this.WIDTH);

        focus.append('circle').attr('r', 7.5);

        let toolTipInfoBox = d3
            .select('body')
            .append('div')
            .attr('class', 'btc-tooltip-info');

        this.g
            .append('rect')
            .attr('class', 'btc-overlay ' + this.coinSelectorValue)
            .attr('width', this.WIDTH)
            .attr('height', this.HEIGHT)
            .on('mouseover', function() {
                focus.style('display', null);
            })
            .on('mouseout', function() {
                toolTipInfoBox.style('opacity', 0).style('transform', 'scale(0)');
                focus.style('display', 'none');
            })
            .on('mousemove', mousemove);

        const formatOutput = d3.format(',.2f');
        const formatTime = d3.timeFormat('%m/%d/%Y');

        let vis = this;
        const bisectDate = d3.bisector(d => d.date).left;

        function mousemove() {
            let x0 = vis.x.invert(d3.mouse(this)[0]);
            let i = bisectDate(vis.data[vis.coinSelectorValue], x0, 1);
            let d0 = vis.data[vis.coinSelectorValue][i - 1];
            let d1 = vis.data[vis.coinSelectorValue][i];
            let d = x0 - d0.date > d1.date - x0 ? d1 : d0;

            toolTipInfoBox
                .style('opacity', 1)
                .style('transform', 'scale(1)')
                .style('left', `${d3.event.x + 23}px`)
                .style('top', `${vis.y(d[vis.varSelectorValue]) + 853}px`)
                .html(
                    `<h4>$${formatOutput(d[vis.varSelectorValue])}</h4><span>${formatTime(
                        d.date
                    )}</span>`
                );

            focus.attr(
                'transform',
                `translate(${vis.x(d.date)}, ${vis.y(d[vis.varSelectorValue])})`
            );
            focus.select('.x-hover-line').attr('y2', vis.HEIGHT - vis.y(d[vis.varSelectorValue]));
            focus.select('.y-hover-line').attr('x2', -vis.x(d.date));
        }
    }
}
