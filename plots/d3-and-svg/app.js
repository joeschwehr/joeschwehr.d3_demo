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
    const yScale = d3
        .scaleLinear()
        .domain([0, maxBirths])
        .range([height, 50]);

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

    d3.select('#month-input').on('input', () => {
        const year = +d3.event.target.value;
        sv3.selectAll('rect')
            .data(birthData.filter(d => d.year === year))
            .attr('height', d => height - yScale(d.births))
            .attr('y', d => yScale(d.births));
    });
};

sv3(birthData);
