class DonutChart {
    constructor(parentElement, data, value) {
        this.parentElement = parentElement;
        this.data = data;
        this.value = value;
        this.initVis();
    }

    initVis() {
        this.margin = { top: 30, right: 0, bottom: 0, left: 0 };
        this.width = 250;
        this.height = 270;
        this.radius = Math.min(this.width, this.height) / 2;

        this.pie = d3
            .pie()
            .padAngle(0.01)
            .sort(null)
            .value(d => d[this.value]);

        this.arc = d3
            .arc()
            .outerRadius(this.radius - 10)
            .innerRadius(this.radius * 0.52);

        this.color = d3
            .scaleOrdinal()
            .domain(this.data.map(d => d.coin))
            .range(d3.schemeCategory10);

        this.svg = d3
            .select(this.parentElement)
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);

        this.g = this.svg
            .append('g')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr(
                'transform',
                `translate(${this.width / 2}, ${this.height / 2 + this.margin.top})`
            );

        // for title
        const titleOutput = {
            '24h_vol': `Latest 24 Hour Trading Volume`,
            market_cap: `Latest Market Capitalization`
        };

        // title
        this.g
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', `translate(0, ${-this.height / 2})`)
            .text(titleOutput[this.value]);

        // Fix for format values
        function formatAbbreviation(x) {
            const formatSi = d3.format('.2s');
            let s = formatSi(x);

            // checks last character of formatted output
            switch (s[s.length - 1]) {
                case 'G':
                    return s.slice(0, -1) + 'B'; //removes last character and replaces it with 'B'
                case 'k':
                    return s.slice(0, -1) + 'K';
                case 'm':
                    return x;
            }
            return s;
        }

        const coinOutputs = {
            bitcoin: 'Bitcoin',
            bitcoin_cash: 'Btc Cash',
            ethereum: 'Ethereum',
            litecoin: 'Litecoin',
            ripple: 'Ripple'
        };

        // add legend
        this.legend = this.svg.append('g');

        // legend text
        this.legend
            .attr('font-family', 'sans-serif')
            .attr('font-size', 12)
            .attr('text-anchor', 'start')
            .selectAll('text')
            .data(this.data)
            .join('text')
            .attr('fill', 'rgba(0,0,0,.8)')
            .attr(
                'transform',
                (d, i) =>
                    `translate(${this.width / 2 - 32}, ${this.margin.top +
                        this.height / 2.35 +
                        i * 15})`
            )
            .attr('y', '-0.4em')
            .attr('font-weight', 'bold')
            .text(d => `${coinOutputs[d.coin]}: `)
            .append('tspan')
            .attr('font-weight', 'normal')
            .text(d => formatAbbreviation(d[this.value]));

        // legend boxes
        this.legend
            .selectAll('rect')
            .data(this.data)
            .enter()
            .append('rect')
            .attr('stroke', 'grey')
            .attr('stroke-width', '.5px')
            .attr('width', 11)
            .attr('height', 11)
            .attr('fill', d => this.color(d.coin))
            .attr(
                'transform',
                (d, i) =>
                    `translate(${this.width / 2 - 49}, ${this.margin.top +
                        this.height / 2.35 +
                        i * 15 -
                        15})`
            );

        this.wrangleData();
    }

    wrangleData() {
        const coinSelector = d3.select('#coin-select');
        this.coinSelectorValue = coinSelector.node().value;

        this.sliderValues = $('#date-slider').slider('values');
        // console.log('slider val', this.sliderValues[1]);

        this.activeCoin = $('#coin-select').val();

        this.updateVis();
    }

    updateVis() {
        var vis = this;

        vis.path = vis.g.selectAll('path');

        vis.data0 = vis.path.data();
        vis.data1 = vis.pie(this.data);

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
            .attrTween('d', arcTween)
            .attr('fill-opacity', d => {
                return d.data.coin == vis.activeCoin ? 1 : 0.3;
            });

        // ENTER new elements in the array.
        vis.path
            .enter()
            .append('path')
            .each(function(d, i) {
                this._current = findNeighborArc(i, vis.data0, vis.data1, key) || d;
            })
            .attr('fill', d => this.color(d.data.coin))
            .attr('fill-opacity', function(d) {
                return d.data.coin == vis.activeCoin ? 1 : 0.3;
            })
            .on('click', arcClicked)
            .transition()
            .duration(750)
            .attrTween('d', arcTween);

        function key(d) {
            return d.data.coin;
        }

        function findNeighborArc(i, data0, data1, key) {
            var d;
            return (d = findPreceding(i, vis.data0, vis.data1, key))
                ? { startAngle: d.endAngle, endAngle: d.endAngle }
                : (d = findFollowing(i, vis.data0, vis.data1, key))
                ? { startAngle: d.startAngle, endAngle: d.startAngle }
                : null;
        }

        // Find the element in data0 that joins the highest preceding element in data1.
        function findPreceding(i, data0, data1, key) {
            var m = vis.data0.length;
            while (--i >= 0) {
                var k = key(vis.data1[i]);
                for (var j = 0; j < m; ++j) {
                    if (key(vis.data0[j]) === k) return vis.data0[j];
                }
            }
        }

        // Find the element in data0 that joins the lowest following element in data1.
        function findFollowing(i, data0, data1, key) {
            var n = vis.data1.length,
                m = vis.data0.length;
            while (++i < n) {
                var k = key(vis.data1[i]);
                for (var j = 0; j < m; ++j) {
                    if (key(vis.data0[j]) === k) return vis.data0[j];
                }
            }
        }

        function arcTween(d) {
            var i = d3.interpolate(this._current, d);
            this._current = i(1);
            return function(t) {
                return vis.arc(i(t));
            };
        }
    }
}
