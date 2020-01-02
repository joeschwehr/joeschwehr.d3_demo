const gapMinder = gapData => {
    const { data, countries } = cleanData(gapData);
    let yearIndex = 0;
    let yearValue = data[yearIndex].year;

    const WIDTH = 800;
    const HEIGHT = 550;
    const MARGIN = { top: 50, right: 20, bottom: 40, left: 60 };

    const gfx = d3
        .select('#gapminder')
        .append('svg')
        .attr('width', WIDTH + MARGIN.left + MARGIN.right)
        .attr('height', HEIGHT + MARGIN.top + MARGIN.bottom)
        .append('g')
        .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

    const colorScale = d3
        .scaleOrdinal()
        .domain(d3.extent(countries, d => d.continent))
        .range(d3.schemeSet1);

    const yScale = d3
        .scaleLinear()
        .domain(d3.extent(countries, country => country.life_exp))
        .range([HEIGHT, 0]);

    const xScale = d3
        .scaleLog()
        .base(10)
        .domain(d3.extent(countries, country => country.income))
        .range([0, WIDTH]);

    const rScale = d3
        .scaleLinear()
        .domain([2000, 1400000000])
        .range([1.5 * Math.PI, 30 * Math.PI]);

    gfx.selectAll('circle')
        .data(data[yearIndex].countries)
        .enter()
        .append('circle')
        .attr('cy', d => yScale(d.life_exp))
        .attr('cx', d => xScale(d.income))
        .attr('r', d => rScale(d.population))
        .attr('fill', d => colorScale(d.continent))
        .attr('stroke', 'rgba(255,255,255,.3)');

    // X AXIS
    const xAxis = d3
        .axisBottom(xScale)
        .tickValues([400, 4000, 40000])
        .tickFormat(d3.format('$'));

    gfx.append('g')
        .attr('transform', `translate(0, ${HEIGHT})`)
        .call(xAxis);

    // Y AXIS
    const yAxis = d3.axisLeft(yScale).tickSize(10);

    gfx.append('g').call(yAxis);

    // LEGEND
    const legend = gfx
        .append('g')
        .attr('width', 120)
        .attr('height', 130)
        .attr('y', HEIGHT - 150)
        .attr('x', WIDTH - 120);

    legend
        .selectAll('rect')
        .data(['africa', 'americas', 'asia', 'europe'])
        .enter()
        .append('rect')
        .attr('width', 20)
        .attr('height', 20)
        .attr('x', WIDTH - 110)
        .attr('y', (d, i) => 410 + i * 30)
        .attr('fill', d => colorScale(d))
        .attr('stroke', 'rgba(200,200,200)')
        .style('stroke-width', '1px');

    legend
        .selectAll('p')
        .data(['Africa', 'Americas', 'Asia', 'Europe'])
        .enter()
        .append('text')
        .attr('font-size', '1.5rem')
        .attr('text-anchor', 'start')
        .attr('x', WIDTH - 80)
        .attr('y', (d, i) => 425 + i * 30)
        .text(d => d);

    // Title
    gfx.append('text')
        .attr('x', WIDTH / 2 - 150)
        .attr('y', 0)
        .text('Income & Life Expectancy Over Time (by Country & Continent)');

    // Y Label
    gfx.append('text')
        .attr('x', -HEIGHT / 2)
        .attr('y', -35)
        .attr('transform', 'rotate(-90)')
        .attr('font-size', '1.2rem')
        .text('Life Expectancy');

    // X Label
    gfx.append('text')
        .attr('x', WIDTH / 2)
        .attr('y', HEIGHT + 25)
        .attr('font-size', '1.2rem')
        .text('Income');

    // Year
    const yearText = gfx
        .append('text')
        .attr('x', WIDTH - 88)
        .attr('y', 395)
        .attr('font-size', '4rem')
        .text(yearValue);

    d3.interval(function() {
        yearIndex = updateGapMinder(
            data,
            yearText,
            yearIndex,
            gfx,
            yScale,
            xScale,
            rScale,
            colorScale
        );
    }, 100);
};

const updateGapMinder = (data, yearText, yearIndex, gfx, yScale, xScale, rScale, colorScale) => {
    if (yearIndex + 1 < data.length) {
        yearIndex += 1;
    } else {
        yearIndex = 0;
    }

    // Standard transition time for the visualization
    var t = d3.transition().duration(50);

    // JOIN
    let newData = gfx.selectAll('circle').data(data[yearIndex].countries);

    // EXIT
    newData.exit().remove();

    // UPDATE
    newData
        // .transition(t)
        .attr('cy', d => yScale(d.life_exp))
        .attr('cx', d => xScale(d.income))
        .attr('r', d => rScale(d.population))
        .attr('fill', d => colorScale(d.continent))
        .attr('stroke', 'rgba(255,255,255,.3)');

    // ENTER
    newData
        .enter()
        .append('circle')
        .attr('fill', d => colorScale(d.continent))
        .attr('stroke', 'rgba(255,255,255,.3)')
        .attr('cy', d => yScale(d.life_exp))
        .attr('cx', d => xScale(d.income))
        .attr('r', d => rScale(d.population));

    // UPDATE YEAR
    yearText.text(data[yearIndex].year);

    const yearValue = data[yearIndex].year;
    return yearIndex;
};

const cleanData = gapData => {
    //accepts the gapMinder data
    //returns an object...
    //  data: data with countries removed if they have null values
    //  countries: a list of countries that do not have null values

    let countryArray = [];
    const cleanData = gapData.map(d => {
        const countries = d.countries.filter(
            country =>
                country.income !== null && country.life_exp !== null && country.population !== null
        );
        countryArray = [...countryArray, ...countries];
        return { countries: countries, year: d.year };
    });
    return { data: cleanData, countries: countryArray };
};

gapMinder(gapData);
