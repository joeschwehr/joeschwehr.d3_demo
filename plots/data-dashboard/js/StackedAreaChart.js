class StackedAreaChart {
    constructor(parentElement) {
        this.parentElement = parentElement;

        this.initVis();
    }

    initVis() {
        let vis = this;

        // set SVG
        vis.svg = d3
            .select(vis.parentElement)
            .attr('width', CHART_WIDTH + CHART_MARGIN.left + CHART_MARGIN.right)
            .attr('height', CHART_HEIGHT + CHART_MARGIN.top + CHART_MARGIN.bottom);

        // add g
        vis.g = vis.svg
            .append('g')
            .attr('transform', `translate(${CHART_MARGIN.left}, ${CHART_MARGIN.top})`);

        // SCALES
        vis.x = d3.scaleTime().range([0, CHART_WIDTH]);
        vis.y = d3.scaleLinear().range([CHART_HEIGHT, 0]);
        vis.z = d3.scaleOrdinal(d3.schemeTableau10);

        // STACK
        vis.stack = d3.stack();

        // AREA
        vis.area = d3
            .area()
            .x((d, i) => vis.x(d.data.date))
            .y0(d => vis.y(d[0]))
            .y1(d => vis.y(d[1]));

        // KEYS
        vis.keys = ['west', 'south', 'northeast', 'midwest'];

        // AXIS GROUPS
        vis.xAxisGroup = vis.g
            .append('g')
            .attr('class', 'db-axis')
            .attr('transform', `translate(${0}, ${CHART_HEIGHT})`);
        vis.yAxisGroup = vis.g.append('g').attr('class', 'db-axis');

        this.legend();
        this.wrangleData();
    }

    wrangleData(brushDates = d3.extent(db_data, d => d.date)) {
        let vis = this;

        // get selector value
        vis.selectorValue = dbDropdown.node().value;

        // assign data based on selector
        vis.selectorValue === 'call_revenue'
            ? (vis.data = totalRevenue)
            : vis.selectorValue === 'call_duration'
            ? (vis.data = totalDuration)
            : (vis.data = totalUnits);

        // FILTER BASED ON BRUSH SELECTIONS
        vis.filteredData = vis.data.filter(d => {
            return (
                d.date.getTime() >= brushDates[0].getTime() &&
                d.date.getTime() <= brushDates[1].getTime()
            );
        });

        this.updateVis();
    }

    updateVis() {
        let vis = this;

        // DOMAIN MAX
        let yDomainMax = d3.max(
            vis.filteredData.map(d => d.west + d.south + d.midwest + d.northeast)
        );

        // UPDATE SCALE DOMAINS
        vis.x.domain(d3.extent(vis.filteredData, d => d.date));
        vis.y.domain([0, yDomainMax]);
        vis.z.domain(vis.keys);
        vis.stack.keys(vis.keys);

        // UPDATE AXIS AFTER SCALES ARE SET
        vis.xAxisGroup.call(d3.axisBottom(vis.x).ticks(3));
        vis.yAxisGroup
            .transition()
            .duration(750)
            .call(d3.axisLeft(vis.y));

        // JOIN
        let layer = vis.g.selectAll('.db-path').data(vis.stack(vis.filteredData));

        // EXIT
        layer.exit().remove();

        // UPDATE
        layer
            .attr('fill', d => vis.z(d.key))
            .transition()
            .duration(750)
            .attr('d', vis.area);

        // ENTER
        layer
            .enter()
            .append('path')
            .attr('class', 'db-path')
            .attr('fill', d => vis.z(d.key))
            .attr('d', vis.area);

        // CREATE OUTPUT LAYERS (non update)
        // vis.layer = vis.g
        //     .selectAll('.db-layer')
        //     .data(vis.stack(vis.data))
        //     .enter()
        //     .append('g')
        //     .attr('class', 'db-layer')
        //     .append('path')
        //     .attr('class', 'db-area')
        //     .style('fill', d => vis.z(d.key))
        //     .attr('d', vis.area);
    }

    legend() {
        let vis = this;

        vis.legend = vis.svg
            .selectAll('.db-legend')
            .data(vis.keys)
            .enter()
            .append('g')
            .attr('class', 'db-legend');

        vis.legend
            .append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('y', 13)
            .attr('x', (d, i) => (i * CHART_WIDTH) / 4 + CHART_MARGIN.left + 35)
            .attr('fill', d => vis.z(d))
            .attr('stroke', 'rgba(200,200,200,1)')
            .attr('stroke-width', 0.3);

        vis.legend
            .append('text')
            .style('text-transform', 'capitalize')
            .attr('text-anchor', 'start')
            .attr('y', 25)
            .attr('x', (d, i) => (i * CHART_WIDTH) / 4 + CHART_MARGIN.left + 55)
            .attr('fill', 'black')
            .text(d => d);
    }
}
