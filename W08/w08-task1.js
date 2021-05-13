// Load data
d3.csv("pcr_positive_daily1.csv")
    .then(data => {
        data.forEach(d => {
            d.num = +d.num;
        })
        var config = {
            parent: '#drawing_region',
            width: 500,
            height: 500,
            margin: {top: 30, right: 10, bottom: 50, left: 70}
        };
        const bc = new BarChart(config, data)
        bc.update()

    })
    .catch(error => {
        console.log(error);
    });


class BarChart {

    constructor(config, data) {
        this.data = data;
        this.config = config;

        this.init();
    }

    init() {
        let self = this;

        //svg の構築
        self.svg = d3.select(self.config.parent)
            .attr('width', self.config.width)
            .attr('height', self.config.height);

        // Bar area
        self.inner_width = self.config.width - self.config.margin.left - self.config.margin.right;
        self.inner_height = self.config.height - self.config.margin.top - self.config.margin.bottom;

        //set Title
        self.svg.append("g")
            .attr("transform", `translate(${self.config.margin.left}, 15)`)
            .append("text")
            .attr("fill", "black")
            .attr("x", 0)
            .attr("y", 0)
            .attr("font-size", "10pt")
            .attr("font-weight", "bold")
            .text("日本のコロナ新規感染者数('21/4/1 - '21/5/11)");

        // // Y label
        // self.svg.append("g")
        //     .attr("transform", `translate(0, ${self.inner_height/2})`)
        //     .append("text")
        //     .attr("fill", "black")
        //     .attr("x", 0)
        //     .attr("y", 0)
        //     // .attr("text-anchor", "middle")
        //     .attr("font-size", "8pt")
        //     .attr("font-weight", "bold")
        //     .attr("writing-mode", "v")
        //     .text("日付")

        // X axis
        self.svg.append("g")
            .attr("transform", `translate(${self.config.width/2}, ${self.config.height-10})`)
            .append("text")
            .attr("fill", "black")
            .attr("x", 0)
            .attr("y", 0)
            .attr("text-anchor", "upper")
            .attr("font-size", "8pt")
            .attr("font-weight", "bold")
            .attr("text-orientation", "sideways")
            .text("陽性者数[人]")

    }

    //値の更新
    update() {
        let self = this;

        // Initialize axis scales
        self.xscale = d3.scaleLinear()
            .domain([0, d3.max(self.data, d => d.num)])
            .range([0, self.inner_width])

        self.yscale = d3.scaleBand()
            .domain(self.data.map(d => d.date))  // list:data からデータを取り出し、( function ) の処理を施した値で新しいlistを作成
            .range([0, self.inner_height])
            .paddingInner(0.5);

        // Initialize axes
        self.xaxis = d3.axisBottom(self.xscale)
            .ticks(5)
            .tickSizeOuter(5);

        self.yaxis = d3.axisLeft(self.yscale)
            .ticks(10)
            .tickSizeOuter(0);

        self.render();
    }

    //描写
    render() {
        let self = this

        var chart = self.svg.append('g')
            .attr('transform', `translate(${self.config.margin.left}, ${self.config.margin.top})`)

        // Draw bars
        chart.selectAll("rect").data(self.data).enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", d => self.yscale(d.date))
            .attr("width", d => self.xscale(d.num))
            .attr("height", self.yscale.bandwidth())
            .attr("fill", "gray");

        // Draw the axis
        var xaxis_group = chart.append('g')
            .attr('transform', `translate(0, ${self.inner_height})`)
            .call(self.xaxis);

        var yaxis_group = chart.append('g')
            .call(self.yaxis);


    }
}




