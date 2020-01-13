class TimeLine {
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.initVis();
    }

    initVis() {
        this.margin = { top: 0, right: 25, bottom: 0, left: 50 };
        this.height = 200 - this.MARGIN.top - this.MARGIN.bottom;
        this.width = 800 - this.MARGIN.left - this.MARGIN.right;

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

        this.wrangleData();
    }

    wrangleData() {
        this.updateVis();
    }

    updateVis() {
        this.xAxis;
    }
}
