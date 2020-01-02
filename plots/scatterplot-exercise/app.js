const sv4 = regionData => {
    const WIDTH = 800;
    const HEIGHT = 600;
    const PADDING = 55;

    const mustHaveKeys = obj => {
        const keys = ['subscribersPer100', 'adultLiteracyRate', 'urbanPopulationRate', 'medianAge'];
        for (let i = 0; i < keys.length; i++) {
            if (obj[keys[i]] === null) return false;
            else return true;
        }
    };

    const data = regionData.filter(mustHaveKeys);

    const yScale = d3
        .scaleLinear()
        .domain(d3.extent(data, d => d.subscribersPer100))
        .range([HEIGHT - PADDING, PADDING]);

    const fakeyScale = d3
        .scaleLinear()
        .domain([20, 65])
        .range([HEIGHT - PADDING, PADDING]);

    const xScale = d3
        .scaleLinear()
        .domain(d3.extent(data, d => d.adultLiteracyRate))
        .range([PADDING, WIDTH - PADDING]);

    const colorScale = d3
        .scaleLinear()
        .domain(d3.extent(data, d => d.urbanPopulationRate))
        .range(['rgba(0,255,255,.6)', '#1b69c4']);

    const radiusScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, d => d.medianAge)])
        .range([0, 40]);

    const xAxis = d3
        .axisBottom(xScale)
        .tickSize(-HEIGHT + 2 * PADDING)
        .tickSizeOuter(0);

    const yAxis = d3
        .axisLeft(fakeyScale)
        .tickSize(-WIDTH + 2 * PADDING)
        .tickSizeOuter(0);

    const svg4 = d3
        .select('.svg-four')
        .attr('width', WIDTH)
        .attr('height', HEIGHT);

    svg4.append('g')
        .attr('transform', `translate(${PADDING}, 0)`)
        .call(yAxis);

    svg4.append('g')
        .attr('transform', `translate(0, ${HEIGHT - PADDING})`)
        .call(xAxis);

    svg4.append('text')
        .attr('x', WIDTH / 2)
        .attr('y', HEIGHT - 20)
        .style('text-anchor', 'middle')
        .attr('font-size', '1.3rem')
        .text('Account Size');

    svg4.append('text')
        .attr('x', WIDTH / 2)
        .attr('y', 30)
        .style('text-anchor', 'middle')
        .attr('font-size', '2rem')
        .text('Investor Age vs. Account Size');

    svg4.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -HEIGHT / 2)
        .attr('y', 20)
        .style('text-anchor', 'middle')
        .attr('font-size', '1.3rem')
        .text('Investor Age');

    svg4.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cy', d => yScale(d.subscribersPer100))
        .attr('cx', d => xScale(d.adultLiteracyRate))
        .attr('r', d => (radiusScale(d.medianAge) < 0 ? 0 : radiusScale(d.medianAge)))
        .attr('fill', d => colorScale(d.urbanPopulationRate))
        .attr('stroke', 'rgba(255,255,255,.3)');
};
sv4(regionData);
