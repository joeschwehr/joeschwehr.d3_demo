const chart = () => {
    const data = pieData;
    const height = 600;
    const width = 700;
    const margin = { top: 50, right: 50, bottom: 50, right: 50 };

    const color = d3
        .scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());

    const arc = d3
        .arc()
        .outerRadius(Math.min(width, height) / 2 - 10)
        .innerRadius((Math.min(width, height) / 2) * 0.5);

    const pie = d3
        .pie()
        .padAngle(0.005)
        .sort(null)
        .value(d => d.value);

    const svg = d3
        .select('.pie-svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('width', width)
        .attr('height', height)
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const g = svg
        .selectAll('path')
        .data(pie(data))
        .enter()
        .append('path')
        // .attr('stroke', 'black')
        // .attr('stroke-width', '.2')
        .attr('fill', d => color(d.data.name))
        .attr('d', arc)
        .append('title')
        .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);

    //for the label
    const arcLabel = d3
        .arc()
        .innerRadius((Math.min(width, height) / 2) * 0.8)
        .outerRadius((Math.min(width, height) / 2) * 0.8);

    svg.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 12)
        .attr('text-anchor', 'middle')
        .selectAll('text')
        .data(pie(data))
        .enter()
        .append('text')
        .attr('transform', d => `translate(${arcLabel.centroid(d)})`)
        .call(text =>
            text
                .append('tspan')
                .attr('y', '-0.4em')
                .attr('font-weight', 'bold')
                .text(d => d.data.name)
        )
        .call(text =>
            text
                .filter(d => d.endAngle - d.startAngle > 0.25)
                .append('tspan')
                .attr('x', 0)
                .attr('y', '0.7em')
                .attr('fill-opacity', 0.7)
                .text(d => d.data.value.toLocaleString())
        );
};

chart();
