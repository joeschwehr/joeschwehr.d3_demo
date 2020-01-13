class Timeline {
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.initVis();
    }

    initVis() {
        this.margin = { top: 0, right: 25, bottom: 50, left: 50 };
        this.height = 200 - this.margin.top - this.margin.bottom;
        this.width = 800 - this.margin.left - this.margin.right;

        this.svg = d3
            .select(this.parentElement)
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);

        this.t = () => d3.transition().duration(1000);

        this.g = this.svg
            .append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.right})`);

        this.x = d3.scaleTime().range([0, this.width]);

        this.y = d3.scaleLinear().range([this.height, 0]);

        this.xAxis = this.g
            .append('g')
            .attr('class', 'tl-x-axis')
            .attr(`transform`, `translate(${0}, ${this.height})`);

        this.areaPath = this.g.append('path').attr('fill', '#ccc');

        //initialize brush
        this.brush = d3
            .brushX()
            .handleSize(10)
            .extent([
                [0, 0], //top left
                [this.width, this.height] // down to bot right
            ])
            .on('brush', brushed);

        // append brush
        this.brushComponent = this.g
            .append('g')
            .attr('class', 'tl-brush')
            .call(this.brush);

        this.wrangleData();
    }

    wrangleData() {
        this.coin = $('#coin-select').val();
        this.yVar = $('#var-select').val();
        this.data = filteredData[this.coin];

        this.updateVis();
    }

    updateVis() {
        const vis = this;
        this.x.domain(d3.extent(this.data, d => d.date));
        this.y.domain([0, d3.max(this.data, d => d[vis.yVar])]);

        this.xAxis.transition(this.t()).call(
            d3
                .axisBottom()
                .ticks(4)
                .scale(this.x)
        );

        this.area = d3
            .area()
            .x(d => vis.x(d.date))
            .y0(this.height)
            .y1(d => vis.y(d[vis.yVar]));

        this.areaPath.data([this.data]).attr('d', this.area);
    }
}
