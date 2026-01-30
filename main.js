const DATA_URL = "https://ourworldindata.org/grapher/annual-temperature-anomalies.csv";
const TOPO_URL = "https://cdn.jsdelivr.net/npm/visionscarto-world-atlas@0.1.0/world/110m.json";

const mapContainer = document.querySelector("#map");
const tooltip = document.querySelector("#tooltip");
const statYear = document.querySelector("#stat-year");
const statCount = document.querySelector("#stat-count");
const statRange = document.querySelector("#stat-range");
const legendMin = document.querySelector("#legend-min");
const legendMax = document.querySelector("#legend-max");
const methodYear = document.querySelector("#method-year");

const state = {
    countries: [],
    dataByCode: new Map(),
    latestYear: null,
    min: null,
    max: null,
    maxAbs: null
};

function formatValue(value) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "자료 없음";
    }
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}°C`;
}

function updateStats() {
    statYear.textContent = state.latestYear ?? "-";
    statCount.textContent = `${state.dataByCode.size}개국`;
    if (methodYear) {
        methodYear.textContent = state.latestYear ? `${state.latestYear}년 기준` : "데이터 자동 반영";
    }

    if (Number.isFinite(state.min) && Number.isFinite(state.max)) {
        statRange.textContent = `${state.min.toFixed(2)}°C ↔ ${state.max.toFixed(2)}°C`;
    } else {
        statRange.textContent = "-";
    }

    if (Number.isFinite(state.maxAbs)) {
        legendMin.textContent = `${(-state.maxAbs).toFixed(1)}°C`;
        legendMax.textContent = `${state.maxAbs.toFixed(1)}°C`;
    } else {
        legendMin.textContent = "-";
        legendMax.textContent = "-";
    }
}

function drawMap() {
    if (!state.countries.length) return;

    const width = mapContainer.clientWidth;
    const height = Math.max(360, Math.round(width * 0.55));

    mapContainer.innerHTML = "";
    const svg = d3.select(mapContainer)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("role", "img")
        .attr("aria-label", "국가별 온도 이상치 지도");

    const projection = d3.geoNaturalEarth1()
        .fitSize([width, height], { type: "FeatureCollection", features: state.countries });
    const path = d3.geoPath(projection);

    const color = d3.scaleDiverging()
        .domain([state.maxAbs, 0, -state.maxAbs])
        .interpolator(d3.interpolateRdYlBu)
        .clamp(true);

    svg.append("g")
        .selectAll("path")
        .data(state.countries)
        .join("path")
        .attr("class", (d) => state.dataByCode.has(d.properties.a3) ? "country" : "country no-data")
        .attr("fill", (d) => {
            const value = state.dataByCode.get(d.properties.a3);
            return value === undefined ? "#d7d1c8" : color(value);
        })
        .attr("d", path)
        .on("mousemove", (event, d) => {
            const value = state.dataByCode.get(d.properties.a3);
            const [x, y] = d3.pointer(event, mapContainer);
            tooltip.style.opacity = "1";
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
            tooltip.setAttribute("aria-hidden", "false");
            tooltip.innerHTML = `<strong>${d.properties.name}</strong><br>${formatValue(value)}`;
        })
        .on("mouseleave", () => {
            tooltip.style.opacity = "0";
            tooltip.setAttribute("aria-hidden", "true");
        });
}

function parseData(rows) {
    if (!rows.length) return;
    const valueKey = Object.keys(rows[0]).find(
        (key) => !["Entity", "Code", "Year"].includes(key)
    );
    const latestYear = d3.max(rows, (d) => +d.Year);
    const filtered = rows.filter((d) => +d.Year === latestYear && d.Code && d.Code.length === 3);

    const values = [];
    const dataByCode = new Map();
    filtered.forEach((d) => {
        const value = Number(d[valueKey]);
        if (Number.isFinite(value)) {
            values.push(value);
            dataByCode.set(d.Code, value);
        }
    });

    if (!values.length) return;

    const min = d3.min(values);
    const max = d3.max(values);
    const maxAbs = Math.max(Math.abs(min), Math.abs(max));

    state.latestYear = latestYear;
    state.dataByCode = dataByCode;
    state.min = min;
    state.max = max;
    state.maxAbs = maxAbs;
}

function handleResize() {
    drawMap();
}

Promise.all([
    d3.json(TOPO_URL),
    d3.csv(DATA_URL)
])
    .then(([world, rows]) => {
        const countries = topojson.feature(world, world.objects.countries).features;
        state.countries = countries;
        parseData(rows);
        updateStats();
        drawMap();
        const observer = new ResizeObserver(handleResize);
        observer.observe(mapContainer);
    })
    .catch((error) => {
        mapContainer.innerHTML = "<p>데이터를 불러오지 못했습니다. 네트워크 상태를 확인해주세요.</p>";
        console.error(error);
    });
