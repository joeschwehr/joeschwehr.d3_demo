class DonutChart1 {
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.data = db_data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        // SVG
        vis.svg = d3.select(vis.parentElement);

        // Dimensions
        vis.width = +vis.svg.attr('width');
        vis.height = +vis.svg.attr('height');
        // vis.radius = Math.min(vis.width, vis.height) / 2;
        vis.radius = 80;

        // G
        vis.g = vis.svg
            .append('g')
            .attr('transform', `translate(${vis.width / 2 - 60}, ${vis.height / 2 + 10})`);

        // TITLE
        vis.svg
            .append('text')
            .attr('x', 10)
            .attr('y', 20)
            .attr('text-anchor', 'start')
            .text('Company Size');

        vis.pie = d3
            .pie()
            .padAngle(0.01)
            .value(d => d.total)
            .sort((a, b) => {
                if (a.size < b.size) return -1;
            });

        vis.arc = d3
            .arc()
            .innerRadius(vis.radius - 50)
            .outerRadius(vis.radius - 30);

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
            .key(d => d.company_size)
            .entries(vis.filteredData);

        vis.total = vis.callNest.map((call, i) => {
            return {
                size: call.key,
                total: vis.callNest[i].values.length
            };
        });
        this.updateVis();
    }

    updateVis() {
        let vis = this;
        const blues = d3.schemeBlues[3];
        vis.color = d3.scaleOrdinal().range(blues);

        // LEGEND
        vis.legend = vis.svg
            .selectAll('.db-pie-legend')
            .data(['small', 'medium', 'large'])
            .enter()
            .append('g')
            .attr('class', 'db-pie-legend');

        vis.legend
            .append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', d => vis.color(d))
            .attr('stroke', 'rgba(200,200,200,1)')
            .attr('stroke-width', 0.3)
            .attr('x', 175)
            .attr('y', (d, i) => 50 + i * 30);

        vis.legend
            .append('text')
            .attr('x', 200)
            .attr('y', (d, i) => 62 + i * 30)
            .style('text-transform', 'Capitalize')
            .text(d => d);

        vis.path = vis.g.selectAll('path');
        vis.data0 = vis.path.data();
        vis.data1 = vis.pie(vis.total);

        // JOIN elements with new data.
        vis.path = vis.path.data(vis.data1, key);

        // EXIT old elements from the screen.
        vis.path
            .exit()
            .datum((d, i) => findNeighborArc(i, vis.data1, vis.data0, key) || d)
            .transition()
            .duration(750)
            .attrTween('d', arcTween)
            .remove();

        // UPDATE elements still on the screen.
        vis.path
            .transition()
            .duration(750)
            .attrTween('d', arcTween);

        // ENTER new elements in the array.
        vis.path
            .enter()
            .append('path')
            .each(function(d, i) {
                this._current = findNeighborArc(i, vis.data0, vis.data1, key) || d;
            })
            .attr('fill', d => vis.color(d.data.size))
            .transition()
            .duration(750)
            .attrTween('d', arcTween);

        // ****************************** Pie Functions ****************************** //
        function findNeighborArc(i, data0, data1, key) {
            let d;
            return (d = findPreceding(i, vis.data0, vis.data1, key))
                ? { startAngle: d.endAngle, endAngle: d.endAngle }
                : (d = findFollowing(i, vis.data0, vis.data1, key))
                ? { startAngle: d.startAngle, endAngle: d.startAngle }
                : null;
        }

        // Find the element in data0 that joins the highest preceding element in data1.
        function findPreceding(i, data0, data1, key) {
            let m = vis.data0.length;
            while (--i >= 0) {
                let k = key(vis.data1[i]);
                for (let j = 0; j < m; ++j) {
                    if (key(vis.data0[j]) === k) return vis.data0[j];
                }
            }
        }

        // Find the element in data0 that joins the lowest following element in data1.
        function findFollowing(i, data0, data1, key) {
            let n = vis.data1.length,
                m = vis.data0.length;
            while (++i < n) {
                let k = key(vis.data1[i]);
                for (let j = 0; j < m; ++j) {
                    if (key(vis.data0[j]) === k) return vis.data0[j];
                }
            }
        }

        function arcTween(d) {
            let i = d3.interpolate(this._current, d);
            this._current = i(1);
            return function(t) {
                return vis.arc(i(t));
            };
        }

        function key(d) {
            if (d.data) return d.data.size;
        }
    }
}
