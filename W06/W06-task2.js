d3.csv("Mario.csv")
    .then(data => {
        data.forEach(d => {
            d.x = +d.x; //文字を数字として認識
            d.y = +d.y;
        });

        var config = {
            parent: 'body',
            width: 400, //svgの幅. ラベルや軸込み
            height: 400, //高さ.
            margin: {top: 10, right: 10, bottom: 20, left: 50}, //svgの余白
            space_label: {width: 40, height: 40},
            space_title: 30
        };

        const scatter_plot = new ScatterPlot(config, data);
        scatter_plot.update();
    })
    .catch(error => {
        console.log(error);
    });


class ScatterPlot {

    constructor(config, data) {
        this.config = {
            parent: config.parent,
            width: config.width || 256,
            height: config.height || 256,
            margin: config.margin || {top: 10, right: 10, bottom: 10, left: 50},
            space_label: config.space_label || {width: 40, height: 40},
            space_title: config.space_title || 30
        }
        this.data = data;
        this.init();
    }

    init() {
        let self = this;

        // d3.select("body").append("h2")
        //     .text("Title")

        self.svg = d3.select(self.config.parent)
            .append('svg')
            .attr('width', self.config.width)
            .attr('height', self.config.height)

        // self.chart = self.svg.append('g')
        //     .attr('transform', `translate(${self.config.margin.left}, ${self.config.margin.top})`);

        self.chart_width = self.config.width - self.config.space_label.width;
        self.chart_height = self.config.height - self.config.space_label.height - self.config.space_title;

        self.xscale = d3.scaleLinear()
            .domain([0, d3.max(self.data, function (d) {
                return d.x;
            })])
            .range([self.config.space_label.width, self.chart_width])

        self.yscale = d3.scaleLinear()
            .domain([0, d3.max(self.data, function (d) {
                return d.y;
            })])
            .range([self.config.height - self.config.space_label.height, self.config.margin.top + self.config.space_title])

        self.xaxis = d3.axisBottom(self.xscale)
            .ticks(5);

        self.yaxis = d3.axisLeft(self.yscale)
            .ticks(5);

        // Title
        self.svg.append("g")
            .attr("transform", "translate(" + self.chart_width/2 + "," + self.config.margin.top + ")")
            .append("text")
            .attr("fill", "black")
            .attr("x", 0)
            .attr("y", 0)
            .attr("font-size", "10pt")
            .attr("font-weight", "bold")
            .text("Mario")

        // X axis
        self.svg.append("g")
            .attr("transform", "translate(" + 0 + "," + (self.config.height - self.config.space_label.height) + ")")
            .call(self.xaxis)
            .append("text")
            .attr("fill", "black")
            .attr("x", (self.chart_width - self.config.space_label.width ) / 2 + self.config.margin.left)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("font-size", "8pt")
            .attr("font-weight", "bold")
            .text("[X]")

        // Y axis
        self.svg.append("g")
            .attr("transform", "translate(" + (self.config.space_label.width) + "," + 0 + ")")
            .call(self.yaxis)
            .append("text")
            .attr("fill", "black")
            .attr("x", -20)
            .attr("y", self.config.height / 2)
            .attr("text-anchor", "upper")
            .attr("font-size", "8pt")
            .attr("font-weight", "bold")
            .attr("text-orientation", "sideways")
            .text("[Y]")
    }

    update() {
        let self = this;

        const xmax = d3.max(self.data, d => d.x);
        self.xscale.domain([0, xmax]);

        const ymax = d3.max(self.data, d => d.y);
        self.yscale.domain([0, ymax]);

        self.render();
    }

    render() {
        let self = this;

        self.svg.append("g")
            .selectAll("circle")
            .data(self.data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return self.xscale(d.x);
            })
            .attr("cy", function (d) {
                return self.yscale(d.y);
            })
            .attr("fill", "steelblue")
            .attr("r", function (d) {
                return d.r
            })
            .attr("fill", function (d) {
                return d.c
            })
    }
}
