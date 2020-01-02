const margin = { left: 80, right: 20, top: 50, bottom: 60 };
const WIDTH = 800 - margin.left - margin.right;
const HEIGHT = 600 - margin.top - margin.bottom;
let flag = true;
const t = d3.transition().duration(750);

const start = async () => {
    try {
        const data = await d3.json('../data/revenues.json');

        data.forEach(d => {
            d.revenue = +d.revenue;
            d.profit = +d.profit;
        });

        const xScale = d3
            .scaleBand()
            .range([0, WIDTH])
            .padding(0.2);

        const yScale = d3.scaleLinear().range([HEIGHT, 0]);

        const svg = d3
            .select('#chart-area')
            .append('svg')
            .attr('width', WIDTH + margin.left + margin.right)
            .attr('height', HEIGHT + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

        // Y Label
        let yLabel = svg
            .append('text')
            .attr('y', -60)
            .attr('x', -(HEIGHT / 2))
            .attr('font-size', '1.5rem')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .text('Revenue');

        // x axis group
        const xAxisGroup = svg.append('g').attr('transform', `translate(0, ${HEIGHT})`);

        // y axis group
        const yAxisGroup = svg.append('g').call(d3.axisLeft(yScale));

        d3.interval(() => {
            update(data, svg, xAxisGroup, yAxisGroup, xScale, yScale, yLabel);
            flag = !flag;
        }, 1000);

        // run vis for the first time
        update(data, svg, xAxisGroup, yAxisGroup, xScale, yScale, yLabel);
        writeLabels(svg, 'Month', 'Revenue', 'Moving Bar Chart');
        makeGradient(svg);
    } catch (error) {
        console.error(error);
    }
};
start();

const update = (data, svg, xAxisGroup, yAxisGroup, xScale, yScale, yLabel) => {
    const value = flag ? 'revenue' : 'profit';

    xScale.domain(data.map(d => d.month));
    yScale.domain([0, d3.max(data, d => d[value])]);

    const xAxisCall = d3.axisBottom(xScale);
    xAxisGroup.transition(t).call(xAxisCall);

    const yAxisCall = d3.axisLeft(yScale);
    yAxisGroup.transition(t).call(yAxisCall);

    // UPDATE PATTERN...
    // JOIN
    let newBars = svg.selectAll('rect').data(data);

    // EXIT
    newBars
        .exit()
        // .transition()
        // .attr('y', yScale(0))
        // .attr('height', 0)
        .remove();

    // UPDATE
    newBars
        .classed('filled', true)
        .transition(t)
        .attr('y', d => yScale(d[value]))
        .attr('x', d => xScale(d.month))
        .attr('height', d => HEIGHT - yScale(d[value]))
        .attr('width', xScale.bandwidth);

    // ENTER
    newBars
        .enter()
        .append('rect')
        .classed('filled', true)
        .attr('x', d => xScale(d.month))
        .attr('width', xScale.bandwidth)
        // .attr('y', yScale(0))
        // .attr('height', 0)
        // .transition(t)
        .attr('y', d => yScale(d[value]))
        .attr('height', d => HEIGHT - yScale(d[value]));
    // END UPDATE PATTERN

    // UPDATE Y LABEL
    const label = flag ? 'Revenue' : 'Profit';
    yLabel.text(label);
};

const writeLabels = (svg, xLabel, yLabel, title) => {
    // X Label
    svg.append('text')
        .attr('y', HEIGHT + 50)
        .attr('x', WIDTH / 2)
        .attr('font-size', '1.5rem')
        .attr('text-anchor', 'middle')
        .text(xLabel);

    // // Y Label
    // svg.append('text')
    //     .attr('y', -60)
    //     .attr('x', -(HEIGHT / 2))
    //     .attr('font-size', '1.5rem')
    //     .attr('text-anchor', 'middle')
    //     .attr('transform', 'rotate(-90)')
    //     .text(yLabel);

    // Title
    svg.append('text')
        .attr('y', 0)
        .attr('x', WIDTH / 2)
        .attr('font-size', '2rem')
        .attr('text-anchor', 'middle')
        .text(title);
};

const makeGradient = svg => {
    // Gradient
    let mainGradient = svg
        .append('defs')
        .append('linearGradient')
        .attr('id', 'mainGradient');

    // Create the stops of the main gradient. Each stop will be assigned
    // a class to style the stop using CSS.
    mainGradient
        .append('stop')
        .attr('class', 'stop-left')
        .attr('offset', '0');

    mainGradient
        .append('stop')
        .attr('class', 'stop-right')
        .attr('offset', '1');
};
