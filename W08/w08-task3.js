// Load data
d3.csv("population.csv")
    .then(data => {
        data.forEach(d => {
            d.population = +d.population
            d.idx = +d.idx;
        })
        var config = {
            parent: '#drawing_region',
            width: 500,
            height: 600,
            margin: {top: 20, right: 0, bottom: 20, left: 0}
        };
        const pc = new PieChart(config, data)
        pc.update()

    })
    .catch(error => {
        console.log(error);
    });

class PieChart {

    constructor(config, data) {
        this.data = data;
        this.config = config;
        this.radius = Math.min(config.width, config.height) / 2
        this.init();
    }

    init() {
        let self = this;

        //svg の構築
        self.svg = d3.select(self.config.parent)
            .attr('width', self.config.width)
            .attr('height', self.config.height)
            .append('g')
            .attr('transform', `translate(${self.config.width / 2}, ${self.config.height / 2 + self.config.margin.top})`);

        //set Title
        self.svg.append("g")
            .attr("transform", `translate(${self.config.margin.left}, ${-self.config.height / 2 + self.config.margin.top})`)
            .append("text")
            .attr("fill", "black")
            .attr("x", 0)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("font-size", "20pt")
            .attr("font-weight", "bold")
            .text("近畿の人口[人]");
    }

    //値の更新
    update() {
        let self = this;

        // // データを加工
        // self.dataset = self.data.map(function (d) {
        //     return {pre: d.prefecture, pop: d.population}
        // });
        console.log(self.data)

        //Pie
        self.pie = d3.pie()
            .value(d => d.population);
        self.arc = d3.arc()
            .innerRadius(0)
            .outerRadius(self.radius);

        self.render();
    }

    //描写
    render() {
        let self = this

        var text = d3.arc()
            .outerRadius(0)
            .innerRadius(0);
        var pieGroup = self.svg.selectAll(".pie")
            .data(self.pie(self.data))
            .enter()
            .append("g")
            .attr("class", "pie");

        pieGroup.append("path")
            .attr("d", self.arc)
            .attr("fill", function(d, idx){
                return d3.rgb((idx*100)%255,100,100)
            })
            .attr("opacity", 0.75)
            .attr("stroke", "white");

        var text = d3.arc()
            .outerRadius(self.radius - 100)
            .innerRadius(self.radius - 30);

        pieGroup.append("text")
            .attr("fill", "black")
            .attr("transform", function(d) { return "translate(" + text.centroid(d) + ")"; })
            .attr("dy", "5px")
            .attr("font", "10px")
            .attr("font-family", "ＭＳ 明朝")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .text(function(d) { return d.data.prefecture + ":" + d.data.population; });

    }
}




