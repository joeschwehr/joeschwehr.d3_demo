class TimeLine {
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = CHART_MARGIN;
        vis.margin.top = 10;
        vis.margin.bottom = 25;

        vis.width = CHART_WIDTH;
        vis.height = 150 - vis.margin.top - vis.margin.bottom;

        // SET SVG
        vis.svg = d3
            .select(vis.parentElement)
            .attr('width', vis.width + vis.margin.left + vis.margin.right)
            .attr('height', vis.height + vis.margin.top + vis.margin.bottom);

        // G
        vis.g = vis.svg
            .append('g')
            .attr('transform', 'translate(' + vis.margin.left + ',' + vis.margin.top + ')');

        // SCALES
        vis.x = d3.scaleTime().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // AXIS
        vis.xAxisCall = d3.axisBottom().ticks(4);

        vis.xAxis = vis.g
            .append('g')
            .attr('class', 'db-axis')
            .attr('transform', `translate(0, ${vis.height})`);

        // AXIS
        vis.yAxisCall = d3.axisLeft().ticks(3);

        vis.yAxis = vis.g
            .append('g')
            .attr('class', 'db-axis')
            .attr('transform', `translate(0, ${0})`);

        // AREA
        vis.area = d3
            .area()
            .x(d => vis.x(new Date(d.date)))
            .y0(vis.height)
            .y1(d => vis.y(d.sum));

        // fill area
        vis.areaPath = vis.g.append('path').attr('fill', '#ccc');

        // Initialize brush component
        vis.brush = d3
            .brushX()
            .handleSize(10)
            .extent([
                [0, 0],
                [vis.width, vis.height]
            ])
            .on('brush end', brushMove);

        // Append brush component
        vis.brushComponent = vis.g
            .append('g')
            .attr('class', 'brush')
            .call(vis.brush);

        this.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // get selector value
        vis.selectorValue = dbDropdown.node().value;

        // assign data based on selector
        vis.selectorValue === 'call_revenue'
            ? (vis.data = totalRevenue)
            : vis.selectorValue === 'call_duration'
            ? (vis.data = totalDuration)
            : (vis.data = totalUnits);

        // restructures our data... creates new object...
        // { key: 12/12/12, values: {date: 1/1/12, west: 12, midwest: 12, south: 12, ne: 12}}
        vis.dayNest = d3
            .nest()
            .key(d => d.date)
            .entries(vis.data);

        // SUMS THE REGION-TOTALS OF OUR DATA
        vis.dataSum = vis.dayNest.map(day => {
            return {
                date: day.key,
                sum: day.values.reduce((accumulator, current) => {
                    return (
                        accumulator +
                        current.west +
                        current.south +
                        current.midwest +
                        current.northeast
                    );
                }, 0)
            };
        });

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // UPDATE DOMAINS
        vis.x.domain(d3.extent(vis.dataSum, d => new Date(d.date)));
        const yDomainMax = d3.max(vis.dataSum.map(d => d.sum));
        vis.y.domain([0, yDomainMax]);

        // CALL AXIS AFTER DOMAIN IS SET
        vis.xAxisCall.scale(vis.x);
        vis.xAxis.call(vis.xAxisCall);
        vis.yAxisCall.scale(vis.y);
        vis.yAxis
            .transition()
            .duration(750)
            .call(vis.yAxisCall);

        // DRAW AREA
        vis.areaPath
            .data([vis.dataSum])
            .transition()
            .duration(750)
            .attr('d', vis.area);
    }
}
