const sv3 = birthData => {
    const minYear = d3.min(birthData, data => data.year);
    const maxYear = d3.max(birthData, data => data.year);

    const width = 600;
    const height = 400;
    const numBars = 12;
    const padding = 10;
    const barPadding = 2;
    const barWidth = width / numBars;
    const maxBirths = d3.max(birthData, d => d.births);
    let year = d3.min(birthData, d => d.year);

    const yScale = d3
        .scaleLinear()
        .domain([0, maxBirths])
        .range([height, 50]);

    const xScale = d3
        .scaleLinear()
        .domain([0, 12])
        .range([0, width - padding]);

    d3.select('#month-input')
        .property('min', minYear)
        .property('max', maxYear)
        .property('value', minYear);

    const sv3 = d3
        .select('.svg-three')
        .attr('width', width + padding + padding)
        .attr('height', height);

    sv3.selectAll('rect')
        .data(birthData.filter(d => d.year === minYear))
        .enter()
        .append('rect')
        .attr('width', barWidth - barPadding)
        .attr('height', d => height - yScale(d.births))
        .attr('y', d => yScale(d.births))
        .attr('x', (d, i) => {
            return i * barWidth + padding;
        })
        .attr('fill', '#1b69c4');

    sv3.append('text')
        .attr('class', 'returns-header')
        .attr('x', width / 2)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .attr('font-size', '2rem')
        .text(`Returns for ${year}`);

    let xAxis = sv3
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${height})`);

    const xAxisCall = d3.axisBottom();
    xAxis.call(xAxisCall.scale(xScale));

    d3.select('#month-input').on('input', () => {
        year = +d3.event.target.value;
        sv3.selectAll('rect')
            .data(birthData.filter(d => d.year === year))
            .transition()
            .delay((d, i) => i * 50)
            .attr('height', d => height - yScale(d.births))
            .attr('y', d => yScale(d.births));

        sv3.select('.returns-header').text(`Returns for ${year}`);
    });
};

sv3(birthData);
