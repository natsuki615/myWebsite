// Renders a US map referencing https://observablehq.com/@d3/zoom-to-bounding-box

(function () {
    const container = document.getElementById('national-parks-map');
    if (!container) return;

    const parks = [
        { name: "Redwood National Park", coords: [-123.93, 41.21], freq: 2},
        { name: "Zion National Park", coords: [-113.03, 37.30], freq: 3 },
        { name: "Bryce Canyon National Park", coords: [-112.19, 37.59], freq: 1 },
        { name: "Arches National Park", coords: [-109.57, 38.72], freq: 1 },
        { name: "Yosemite National Park", coords: [-119.54, 37.86], freq: 3 },
        { name: "Grand Teton National Park", coords: [-110.80, 43.79], freq: 1 },
        { name: "Glacier National Park", coords: [-113.78, 48.75], freq: 1 },
        { name: "Yellowstone National Park", coords: [-110.56, 44.59], freq: 1 },
        { name: "Death Valley National Park", coords: [-116.85, 36.45], freq: 3 },
        { name: "Kings Canyon National Park", coords: [-118.55, 36.88], freq: 1 },
        { name: "Sequoia National Park", coords: [-118.56, 36.48], freq: 2 },
        { name: "Joshua Tree National Park", coords: [-115.90, 33.88], freq: 2 },
        { name: "Grand Canyon National Park", coords: [-112.14, 36.06], freq: 2 },
    ];

    const maxParkFreq = Math.max(1, ...parks.map(d => d.freq));
    const radiusScale = d3.scaleSqrt().domain([0, maxParkFreq]).range([2, 8]);
 
    // states in alphabetical order
    const STATE_NAMES = [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
        "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia",
        "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
        "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
        "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
        "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
        "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
        "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
        "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
    ];
    // how many times each state (same order as STATE_NAMES) has been visited
    const freq = [
        0, 0, 3, 0, 8, 0,
        0, 0, 2, 0, 0,
        0, 1, 1, 0, 0, 0, 0,
        0, 0, 1, 2, 0, 0,
        0, 0, 1, 0, 4, 0,
        2, 0, 4, 0, 0,
        0, 0, 0, 8, 1,
        0, 0, 0, 0, 5, 0,
        0, 1, 0, 0, 1,
    ];
    const freqByState = new Map(STATE_NAMES.map((name, i) => [name, freq[i]]));
    const maxFreq = Math.max(1, ...freq);

    // FIPS state code -> name, since us-atlas states-10m only carries ids.
    const STATE_FIPS = {
        "01": "Alabama", "02": "Alaska", "04": "Arizona", "05": "Arkansas",
        "06": "California", "08": "Colorado", "09": "Connecticut", "10": "Delaware",
        "11": "District of Columbia", "12": "Florida", "13": "Georgia", "15": "Hawaii",
        "16": "Idaho", "17": "Illinois", "18": "Indiana", "19": "Iowa", "20": "Kansas",
        "21": "Kentucky", "22": "Louisiana", "23": "Maine", "24": "Maryland",
        "25": "Massachusetts", "26": "Michigan", "27": "Minnesota", "28": "Mississippi",
        "29": "Missouri", "30": "Montana", "31": "Nebraska", "32": "Nevada",
        "33": "New Hampshire", "34": "New Jersey", "35": "New Mexico", "36": "New York",
        "37": "North Carolina", "38": "North Dakota", "39": "Ohio", "40": "Oklahoma",
        "41": "Oregon", "42": "Pennsylvania", "44": "Rhode Island",
        "45": "South Carolina", "46": "South Dakota", "47": "Tennessee", "48": "Texas",
        "49": "Utah", "50": "Vermont", "51": "Virginia", "53": "Washington",
        "54": "West Virginia", "55": "Wisconsin", "56": "Wyoming",
    };

    const width = container.clientWidth || 500;
    const height = width * 0.7; // shrink the height

    // hover 
    container.style.position = "relative";
    const tooltip = d3.select(container)
        .append("div")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("background", "#001524")
        .style("color", "#ffecd1")
        .style("padding", "4px 8px")
        .style("border-radius", "6px")
        .style("font-family", "Quicksand, sans-serif")
        .style("font-size", "12px")
        .style("opacity", 0)
        .style("transition", "opacity 0.15s");

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", "100%")
        .attr("height", "100%")
        .style("display", "block")
        .style("background", "transparent");

    const g = svg.append("g");
    const projection = d3.geoAlbersUsa();
    const path = d3.geoPath(projection);

    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", (event) => {
            const { transform } = event;
            g.attr("transform", transform);
            g.selectAll("path").attr("stroke-width", 0.5 / transform.k);
            g.selectAll("circle").attr("r", (d) => radiusScale(d.freq) / transform.k);
            g.selectAll("text").attr("font-size", 11 / transform.k);
        });

    svg.call(zoom);

    function zoomTo(x, y) {
        const margin = 70;
        const k = Math.min(8, width / (margin * 2));
        svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity.translate(width / 2, height / 2).scale(k).translate(-x, -y)
        );
    }

    function reset() {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    }

    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then((us) => {
        const states = topojson.feature(us, us.objects.states);
        projection.fitSize([width, height], states);

        g.append("g")
            .attr("stroke", "#001524")
            .attr("stroke-width", 0.5)
            .selectAll("path")
            .data(states.features)
            .join("path")
            .attr("d", path)
            .attr("fill", (d) => {
                const name = STATE_FIPS[String(d.id).padStart(2, "0")];
                const count = (freqByState.get(name) || 0) + 2; // smoothing
                const alpha = count / (maxFreq + 1);
                return `rgba(255, 236, 209, ${alpha})`;
            })
            .style("cursor", "pointer")
            .on("mouseenter", (_event, d) => {
                const name = STATE_FIPS[String(d.id).padStart(2, "0")];
                tooltip.text(name).style("opacity", 1);
            })
            .on("mousemove", (event) => {
                const [x, y] = d3.pointer(event, container);
                tooltip.style("left", `${x + 12}px`).style("top", `${y + 12}px`);
            })
            .on("mouseleave", () => {
                tooltip.style("opacity", 0);
            })
            .on("click", reset);

        const parkLabels = g.append("g")
            .selectAll("text")
            .data(parks)
            .join("text")
            .attr("x", (d) => projection(d.coords)[0] + 10)
            .attr("y", (d) => projection(d.coords)[1] + 4)
            .text((d) => d.name)
            .attr("fill", "#001524")
            .attr("font-size", 11)
            .attr("font-family", "Quicksand, sans-serif")
            .style("pointer-events", "none")
            .style("opacity", 0);

        g.append("g")
            .selectAll("circle")
            .data(parks)
            .join("circle")
            .attr("cx", (d) => projection(d.coords)[0])
            .attr("cy", (d) => projection(d.coords)[1])
            .attr("r", (d) => radiusScale(d.freq))
            .attr("fill", "#ff7d00")
            .attr("stroke", "#001524")
            .attr("stroke-width", 1)
            .style("cursor", "pointer")
            .on("mouseenter", (_event, d) => {
                parkLabels.filter((p) => p === d).style("opacity", 1);
            })
            .on("mouseleave", (_event, d) => {
                parkLabels.filter((p) => p === d).style("opacity", 0);
            })
            .on("click", (event, d) => {
                event.stopPropagation();
                const [x, y] = projection(d.coords);
                zoomTo(x, y);
            });

        // times visited legend on the bottom right
        const legendW = 110;
        const legendH = 10;
        const legendX = width - legendW - 20;
        const legendY = height - 26;
        const minAlpha = 1 / (maxFreq + 1); 

        svg.append("defs").append("linearGradient")
            .attr("id", "visitGrad")
            .attr("x1", "0%").attr("x2", "100%")
            .attr("y1", "0%").attr("y2", "0%")
            .call(grad => {
                grad.append("stop").attr("offset", "0%")
                    .attr("stop-color", `rgba(255,236,209,${minAlpha.toFixed(3)})`);
                grad.append("stop").attr("offset", "100%")
                    .attr("stop-color", "rgba(255,236,209,1)");
            });

        const legend = svg.append("g").attr("pointer-events", "none");

        // background 
        legend.append("rect")
            .attr("x", legendX - 10).attr("y", legendY - 18)
            .attr("width", legendW + 20).attr("height", legendH + 34)
            .attr("fill", "rgba(0,21,36,0.75)").attr("rx", 6);

        // title
        legend.append("text")
            .attr("x", legendX + legendW / 2).attr("y", legendY - 5)
            .attr("text-anchor", "middle")
            .attr("fill", "#ffecd1")
            .attr("font-family", "Quicksand, sans-serif")
            .attr("font-size", 12)
            .text("times visited");

        // gradient bar
        legend.append("rect")
            .attr("x", legendX).attr("y", legendY)
            .attr("width", legendW).attr("height", legendH)
            .attr("fill", "url(#visitGrad)").attr("rx", 2);

        // ticks at 0, mid, max
        [0, Math.round(maxFreq / 2), maxFreq].forEach(v => {
            const tx = legendX + legendW * v / maxFreq;
            legend.append("line")
                .attr("x1", tx).attr("x2", tx)
                .attr("y1", legendY + legendH).attr("y2", legendY + legendH + 4)
                .attr("stroke", "#ffecd1").attr("stroke-width", 0.8);
            legend.append("text")
                .attr("x", tx).attr("y", legendY + legendH + 13)
                .attr("text-anchor", "middle")
                .attr("fill", "#ffecd1")
                .attr("font-family", "Quicksand, sans-serif")
                .attr("font-size", 10)
                .text(v);
        });
    });

    container.appendChild(svg.node());
})();
