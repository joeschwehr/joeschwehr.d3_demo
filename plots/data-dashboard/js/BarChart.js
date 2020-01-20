class BarChart {
    constructor(parentElement, title, specifier) {
        this.data = db_data;
        this.parentElement = parentElement;
        this.title = title;
        this.specifier = specifier;
        this.initVis();
    }

    initVis() {
        let vis = this;

        // SVG
        vis.svg = d3.select(vis.parentElement);

        // MARGINS
        vis.margin = { top: 35, right: 10, bottom: 25, left: 35 };
        vis.width = +vis.svg.attr('width') - vis.margin.left - vis.margin.right;
        vis.height = +vis.svg.attr('height') - vis.margin.top - vis.margin.bottom;

        // G
        vis.g = vis.svg
            .append('g')
            .attr('transform', 'translate(' + vis.margin.left + ',' + vis.margin.top + ')');

        // SCALES
        vis.categories = ['electronics', 'furniture', 'appliances', 'materials'];
        vis.x = d3
            .scaleBand()
            .domain(vis.categories)
            .range([0, vis.width])
            .padding(0.5);

        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // TITLE
        vis.g
            .append('text')
            .attr('x', -25)
            .attr('y', -15)
            .attr('text-anchor', 'start')
            .text(vis.title);

        // AXIS
        vis.yAxis = vis.g.append('g').attr('class', 'db-axis');
        vis.xAxis = vis.g
            .append('g')
            .attr('class', 'db-axis')
            .call(d3.axisBottom(vis.x))
            .attr('transform', `translate(0, ${vis.height})`)
            .style('text-transform', 'capitalize');

        this.wrangleData();
    }

    wrangleData(brushDates = d3.extent(db_data, d => d.date)) {
        let vis = this;

        // FILTER BASED ON BRUSH SELECTIONS
        vis.filteredData = vis.data.filter(d => {
            return (
                d.date.getTime() >= brushDates[0].getTime() &&
                d.date.getTime() <= brushDates[1].getTime()
            );
        });

        // create new object via nest
        vis.callNest = d3
            .nest()
            .key(d => d.category)
            .entries(vis.filteredData);

        vis.sum = vis.callNest.map(call => {
            return {
                category: call.key,
                sum: call.values.reduce((acc, cur) => (acc += cur[vis.specifier]), 0)
            };
        });

        vis.sum = vis.sum.map((d, i) => {
            return (d = { ...d, sum: Math.round(d.sum / vis.callNest[i].values.length) });
        });

        this.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.y.domain([0, d3.max(vis.sum, d => d.sum)]);
        vis.yAxis.call(d3.axisLeft(vis.y).ticks(4)).attr('y', 6);

        const purples = d3.schemePurples[5].slice(1, 5);
        vis.color = d3
            .scaleOrdinal()
            .domain(vis.categories)
            .range(purples);

        // JOIN
        let bars = vis.g.selectAll('rect').data(vis.sum);

        // EXIT
        bars.exit().remove();

        // UPDATE
        bars.attr('x', d => vis.x(d.category))
            .attr('y', d => vis.y(d.sum))
            .attr('height', d => vis.height - vis.y(d.sum))
            .attr('fill', d => vis.color(d.category));

        // ENTER
        bars.enter()
            .append('rect')
            .attr('x', d => vis.x(d.category))
            .attr('y', d => vis.y(d.sum))
            .attr('width', vis.x.bandwidth())
            .attr('height', d => vis.height - vis.y(d.sum))
            // .attr('fill', (d, i) => purples[i])
            .attr('fill', d => vis.color(d.category));
    }
}
