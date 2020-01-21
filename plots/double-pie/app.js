const drawMonthlyPie = () => {
    const HEIGHT = 600;
    const WIDTH = 600;
    const RADIUS = d3.min([WIDTH, HEIGHT]) / 2;
    const minYear = d3.min(birthData, d => d.year);
    const maxYear = d3.max(birthData, d => d.year);
    const months = [...new Set(birthData.map(d => d.month))];
    const shadeNum = 6;
    const colors = [
        ...d3.schemeGreens[shadeNum].slice(shadeNum - 3, shadeNum),
        ...d3.schemeBlues[shadeNum].slice(shadeNum - 3, shadeNum),
        ...d3.schemePurples[shadeNum].slice(shadeNum - 3, shadeNum),
        ...d3.schemeGreys[shadeNum].slice(shadeNum - 3, shadeNum)
    ];
    let currentYear = minYear;

    let svg = d3
        .select('#double-pie-chart')
        .attr('width', WIDTH)
        .attr('height', HEIGHT);

    let g = svg.append('g').attr('transform', `translate(${WIDTH / 2}, ${HEIGHT / 2})`);

    // color
    const color = d3
        .scaleOrdinal()
        .domain(months)
        .range(colors);

    // title
    let title = g
        .append('text')
        .attr('x', 0)
        .attr('y', -HEIGHT / 2 + 35)
        .attr('font-size', 25)
        .attr('text-anchor', 'middle')
        .text(`Monthly Returns for ${minYear}`);

    // FILTER DATA
    let filteredData = birthData.filter(d => d.year === currentYear);

    // SETUP PIE
    let pie = d3
        .pie()
        .padAngle(0.01)
        .value(d => d.births)
        .sort((a, b) => {
            if (months.indexOf(a.month) < months.indexOf(b.month)) {
                return -1;
            } else if (months.indexOf(a.month) > months.indexOf(b.month)) {
                return 1;
            } else {
                return 0;
            }
        });

    let arc = d3
        .arc()
        .outerRadius(RADIUS - 60)
        .innerRadius(RADIUS * 0.4);

    // generate pie for the first time
    let paths = g
        .selectAll('path')
        .data(pie(filteredData))
        .enter()
        .append('path')
        .attr('fill', d => color(d.data.month))
        .attr('d', arc);

    /******************************** Tooltip Code ********************************/
    const numFormat = d3.format(',');
    let tooltip = d3.select('.double-pie-tooltip');

    paths
        .on('mousemove', d => {
            tooltip
                .style('opacity', 1)
                .style('transform', 'scale(1)')
                .style('left', `${d3.event.x - 30}px`)
                .style('top', `${d3.event.y - 55}px`)
                .html(`<p>${d.data.month} <br>$${numFormat(d.data.births)}</p>`);
        })
        .on('mouseout', () => {
            tooltip.style('opacity', 0).style('transform', 'scale(0)');
        });
    /******************************** Tooltip Code ********************************/

    let input = d3.select('#double-pie-input').on('change', sliderChange);
    input.attr('max', maxYear - minYear);

    function sliderChange() {
        currentYear = minYear + Number(d3.event.target.value);
        title.text(`Monthly Returns for ${currentYear}`);
        updateVis();
    }

    function updateVis() {
        // FILTER DATA
        filteredData = birthData.filter(d => d.year === currentYear);

        // JOIN
        paths.data(pie(filteredData));

        // EXIT
        paths.exit().remove();

        // UPDATE
        paths.attr('fill', d => color(d.data.month)).attr('d', arc);

        // ENTER
        paths
            .enter()
            .append('path')
            .attr('fill', d => color(d.data.month))
            .attr('d', arc);

        // ******* INNER PIE UPDATE ****** //
        let quarterUpdates = calcQuarters(filteredData);

        // JOIN
        paths2.data(pie2(quarterUpdates));

        // EXIT
        paths2.exit().remove();

        // UPDATE
        paths2.attr('fill', d => quarterColor(d.data.q)).attr('d', arc2);

        // ENTER
        paths
            .enter()
            .append('path')
            .attr('fill', d => color(d.data.q))
            .attr('d', arc2);
    }

    // ************ INNER PIE ************** //
    function calcQuarters(data) {
        let q1 = 0;
        let q2 = 0;
        let q3 = 0;
        let q4 = 0;

        data.forEach(d => {
            if (months.indexOf(d.month) < 3) {
                q1 += d.births;
            } else if (months.indexOf(d.month) < 6) {
                q2 += d.births;
            } else if (months.indexOf(d.month) < 9) {
                q3 += d.births;
            } else {
                q4 += d.births;
            }
        });

        return [
            { q: 1, births: q1 },
            { q: 2, births: q2 },
            { q: 3, births: q3 },
            { q: 4, births: q4 }
        ];
    }

    let quarters = calcQuarters(filteredData);

    // SETUP PIE
    let pie2 = d3
        .pie()
        .padAngle(0.0)
        .value(d => d.births)
        .sort((a, b) => {
            if (a.q < b.q) {
                return -1;
            } else if (a.q > b.q) {
                return 1;
            } else {
                return 0;
            }
        });

    let arc2 = d3
        .arc()
        .outerRadius(RADIUS * 0.392)
        .innerRadius(0);

    const quarterColors = [colors[1], colors[4], colors[7], colors[10]];
    // color
    const quarterColor = d3
        .scaleOrdinal()
        .domain(months)
        .range(quarterColors);

    // generate pie for the first time
    let paths2 = g
        .selectAll('.arc2')
        .data(pie2(quarters))
        .enter()
        .append('path')
        .attr('class', 'arc2')
        .attr('fill', d => quarterColor(d.data.q))
        .attr('d', arc2);

    /******************************** Tooltip Code ********************************/

    paths2
        .on('mousemove', d => {
            tooltip
                .style('opacity', 1)
                .style('transform', 'scale(1)')
                .style('left', `${d3.event.x - 30}px`)
                .style('top', `${d3.event.y - 55}px`)
                .html(`<p>${getQuarter(d.data.q)} <br>$${numFormat(d.data.births)}</p>`);
        })
        .on('mouseout', () => {
            tooltip.style('opacity', 0).style('transform', 'scale(0)');
        });

    function getQuarter(d) {
        const quarters = ['offsetValue', 'Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'];
        return quarters[d];
    }
    /******************************** Tooltip Code ********************************/
    // ************ INNER PIE ************** //
};

drawMonthlyPie();
