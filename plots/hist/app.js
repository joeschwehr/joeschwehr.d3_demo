const width = 900;
const height = 600;
const barPadding = 1;
const padding = 50;

let ageData = regionData.filter(d => d.medianAge !== null);

const xScale = d3
    .scaleLinear()
    .domain(d3.extent(ageData, d => d.medianAge))
    .range([padding, width - padding]);

const histogram = d3
    .histogram()
    .domain(xScale.domain())
    .thresholds(xScale.ticks())
    .value(d => d.medianAge);

let bins = histogram(ageData);

let yScale = d3
    .scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .range([height - padding, padding]);

const svg = d3
    .select('.svg-two')
    .attr('width', width)
    .attr('height', height);

d3.select('input')
    .property('value', bins.length)
    .on('input', () => {
        const binCount = +d3.event.target.value;
        histogram.thresholds(xScale.ticks(binCount));
        bins = histogram(ageData);
        yScale.domain([0, d3.max(bins, d => d.length)]);

        d3.select('.y-axis').call(d3.axisLeft(yScale));

        if (bins.length > 60) {
            d3.select('.x-axis')
                .call(d3.axisBottom(xScale).ticks(binCount))
                .selectAll('text')
                .attr('y', -3)
                .attr('x', 17)
                .attr('font-size', '.7rem')
                .attr('transform', 'rotate(90)');
        } else {
            d3.select('.x-axis')
                .call(d3.axisBottom(xScale).ticks(binCount))
                .selectAll('text')
                .attr('transform', `translate(0, ${height - padding})`)
                .attr('x', 0)
                .attr('font-size', '1rem')
                .attr('transform', 'rotate(0)');
        }

        let rect = svg.selectAll('rect').data(bins);

        rect.exit().remove();

        rect.enter()
            .append('rect')
            .merge(rect)
            .attr('x', d => xScale(d.x0))
            .attr('y', d => yScale(d.length))
            .attr('height', d => height - padding - yScale(d.length))
            .attr('width', d => xScale(d.x1) - xScale(d.x0) - barPadding)
            .attr('fill', '#1b69c4');

        d3.select('.bin-count').text(`Number of bins: ${bins.length}`);
    });
d3.select('.bin-count').text(`Number of bins: ${bins.length}`);

svg.append('g')
    .attr('transform', `translate(0, ${height - padding})`)
    .classed('x-axis', true)
    .call(d3.axisBottom(xScale));

svg.append('g')
    .attr('transform', `translate(${padding}, 0)`)
    .classed('y-axis', true)
    .call(d3.axisLeft(yScale));

svg.append('text')
    .attr('x', width / 2)
    .attr('y', padding - 10)
    .attr('font-size', '2rem')
    .style('text-anchor', 'middle')
    .text('Interactive Histogram');

svg.append('text')
    .attr('x', width / 2)
    .attr('y', height - 10)
    .style('text-anchor', 'middle')
    .text('Median Investor Age');

svg.append('text')
    .attr('transform', `rotate(-90)`)
    .attr('x', -height / 2)
    .attr('y', 15)
    .style('text-anchor', 'middle')
    .text('Frequency');

svg.selectAll('rect')
    .data(bins)
    .enter()
    .append('rect')
    .attr('x', d => xScale(d.x0))
    .attr('y', d => yScale(d.length))
    .attr('height', d => height - padding - yScale(d.length))
    .attr('width', d => xScale(d.x1) - xScale(d.x0) - barPadding)
    .attr('fill', '#1b69c4');
