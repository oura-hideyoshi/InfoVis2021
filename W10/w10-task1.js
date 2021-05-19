// Load data
d3.csv("pcr_positive_daily.csv")
    .then(data => {
        data.forEach(d => {
            d.num = +d.num;
        })
        var config = {
            parent: '#drawing_region',
            width: 800,
            height: 800,
            margin: {top: 30, right: 10, bottom: 50, left: 70}
        };
        var init_data = Object.create(data)
        const bc = new BarChart(config, data)
        bc.update(true);

        d3.select('#origin')
            .on('click', d => {
                bc.data = Object.create(init_data);
                bc.update(false);
                console.log("↓initial data")
                console.log(init_data)
            });

        d3.select('#reverse')
            .on('click', d => {
                bc.data.reverse();
                bc.update(false);
            });

        d3.select('#ascending')
            .on('click', d => {
                bc.data.sort((a, b) => a.num - b.num);
                bc.update(false);
            });

        d3.select('#descending')
            .on('click', d => {
                bc.data.sort((a, b) => -a.num + b.num);
                bc.update(false);
            });

        bc.chart.selectAll('rect')
            .on('mouseover', (e, d) => {
                d3.select('#tooltip')
                    .style('opacity', 1)
                    .html(`<div class="tooltip-label">PCR 陽性者数</div>${d.date}<br>${d.num}人`);
                rect = d3.select(e.toElement);
                rect.attr('fill', 'lightblue');
                console.log(rect);
            })
            .on('mousemove', (e) => {
                const padding = 10;
                d3.select('#tooltip')
                    .style('left', (e.pageX + padding) + 'px')
                    .style('top', (e.pageY + padding) + 'px');
            })
            .on('mouseleave', (e) => {
                d3.select('#tooltip')
                    .style('left', '500px')
                    .style('top', '0px')
                    .style('opacity', 0);
                rect = d3.select(e.fromElement);
                rect.attr('fill', 'gray');
                console.log(rect);
            });

    })
    .catch(error => {
        console.log(error);
    });


class BarChart {

    constructor(config, data) {
        this.data = Object.create(data);
        this.config = config;

        this.init();
    }

    init() {
        let self = this;

        //svg の構築
        self.svg = d3.select(self.config.parent)
            .attr('width', self.config.width)
            .attr('height', self.config.height);

        self.chart = self.svg.append('g')
            .attr('transform', `translate(${self.config.margin.left}, ${self.config.margin.top})`)

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
            .text("日本のコロナ新規感染者数('21/4/1 - '21/5/17)");


        // X axis
        self.svg.append("g")
            .attr("transform", `translate(${self.config.width / 2}, ${self.config.height - 10})`)
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
    update(is_init) {
        let self = this;

        console.log(self.data)
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

        self.render(is_init);
    }

    //描写
    render(is_init) {
        let self = this

        // Draw bars
        self.chart.selectAll("rect")
            .data(self.data)
            .join("rect")
            .transition().duration(1000)
            .attr("x", 0)
            .attr("y", d => self.yscale(d.date))
            .attr("width", d => self.xscale(d.num))
            .attr("height", self.yscale.bandwidth())
            .attr("fill", "gray")


        if (is_init) {
            // Draw the axis
            self.xaxis_group = self.chart.append('g')
                .attr('id', 'xaxis')
                .attr('transform', `translate(0, ${self.inner_height})`)
                .call(self.xaxis);

            self.yaxis_group = self.chart.append('g')
                .attr('id', 'yaxis')
                .call(self.yaxis);
        } else {
            self.xaxis_group
                .transition().duration(1000)
                .call(self.xaxis);

            self.yaxis_group
                .transition().duration(1000)
                .call(self.yaxis);
        }


    }
}





