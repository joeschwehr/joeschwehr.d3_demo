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

        //     vis.variable = "call_revenue"

        //     vis.dayNest = d3.nest()
        //         .key(function(d){ return formatTime(d.date); })
        //         .entries(calls)

        //     vis.dataFiltered = vis.dayNest
        //         .map(function(day){
        //             return {
        //                 date: day.key,
        //                 sum: day.values.reduce(function(accumulator, current){
        //                     return accumulator + current[vis.variable]
        //                 }, 0)
        //             }

        //         })

        this.updateVis();
    }

    updateVis() {
        let vis = this;

        // vis.x.domain(
        //     d3.extent(vis.dataFiltered, d => {
        //         return parseTime(d.date);
        //     })
        // );
        // vis.y.domain([0, d3.max(vis.dataFiltered, d => d.sum)]);

        vis.xAxisCall.scale(vis.x);
        vis.xAxis.call(vis.xAxisCall);

        //     vis.area0 = d3.area()
        //         .x((d) => { return vis.x(parseTime(d.date)); })
        //         .y0(vis.height)
        //         .y1(vis.height);

        //     vis.area = d3.area()
        //         .x((d) => { return vis.x(parseTime(d.date)); })
        //         .y0(vis.height)
        //         .y1((d) => { return vis.y(d.sum); })

        //     vis.areaPath
        //         .data([vis.dataFiltered])
        //         .attr("d", vis.area);
    }
}
