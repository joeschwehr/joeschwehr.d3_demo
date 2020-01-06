const sv3 = birthData => {
    const minYear = d3.min(birthData, data => data.year);
    const maxYear = d3.max(birthData, data => data.year);
    let year = minYear;

    const MARGIN = { left: 80, right: 30, top: 0, bottom: 30 };
    const height = 550 - MARGIN.top - MARGIN.bottom;
    const width = 900 - MARGIN.left - MARGIN.right;
    const numBars = 12;
    const barPadding = 2;
    const barWidth = width / numBars;
    const maxBirths = d3.max(birthData, d => d.births);

    const sv3 = d3
        .select('.svg-three')
        .attr('width', width + MARGIN.left + MARGIN.right)
        .attr('height', height + MARGIN.top + MARGIN.bottom);

    const g = sv3
        .append('g')
        .attr('transform', 'translate(' + MARGIN.left + ', ' + MARGIN.top + ')');

    // SCALES
    const yScale = d3
        .scaleLinear()
        .domain([0, maxBirths])
        .range([height, 50]);

    const xScale = d3
        .scaleLinear()
        .domain([0, 12])
        .range([0, width]);

    // BARS
    g.selectAll('rect')
        .data(birthData.filter(d => d.year === minYear))
        .enter()
        .append('rect')
        .attr('height', d => height - yScale(d.births))
        .attr('y', d => yScale(d.births))
        .attr('width', barWidth - barPadding)
        .attr('x', (d, i) => {
            return i * barWidth;
        })
        .attr('fill', '#1b69c4');

    // SET TITLE
    g.append('text')
        .attr('class', 'returns-header')
        .attr('x', width / 2)
        .attr('y', 35)
        .attr('text-anchor', 'middle')
        .attr('font-size', '2rem')
        .text(`Returns for ${year}`);

    // X AXIS
    let xAxis = g.append('g').attr('transform', `translate(0, ${height})`);
    xAxis.call(
        d3.axisBottom().scale(xScale)
        // .tickFormat(d => `joe ${d.month}`)
    );
    console.log(birthData);

    // Y AXIS
    let yAxis = g.append('g').attr('transform', `translate(0, ${0})`);
    yAxis.call(
        d3
            .axisLeft()
            .ticks(6)
            .scale(yScale)
    );

    // MONTH INPUT SLIDER
    d3.select('#month-input')
        .property('min', minYear)
        .property('max', maxYear)
        .property('value', minYear);

    d3.select('#month-input').on('input', () => {
        year = +d3.event.target.value;
        g.selectAll('rect')
            .data(birthData.filter(d => d.year === year))
            .transition()
            .delay((d, i) => i * 50)
            .attr('height', d => height - yScale(d.births))
            .attr('y', d => yScale(d.births));

        g.select('.returns-header').text(`Returns for ${year}`);
    });
};

sv3(birthData);
