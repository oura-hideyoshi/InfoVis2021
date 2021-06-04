class CovarianceScatterPlot {

    constructor(config) {
        this.config = {
            parent: config.parent,
            width: config.width || 256,
            height: config.height || 256,
            margin: config.margin || {top: 10, right: 10, bottom: 10, left: 10},
            xlabel: config.xlabel || '',
            ylabel: config.ylabel || '',
            cscale: config.cscale
        }
        this.init();
    }

     set_WDataset(WData) {
        this.WDataset = WData;
    }

    set_TDataset(TData) {
        this.TDataset = TData;
    }

    init() {
        let self = this;

        self.svg = d3.select(self.config.parent)
            .attr('width', self.config.width)
            .attr('height', self.config.height);

        self.chart = self.svg.append('g')
            .attr("class", "chart");
        // .attr('transform', `translate(${self.config.margin.left}, ${self.config.margin.top})`);

        self.inner_width = self.config.width - self.config.margin.left - self.config.margin.right;
        self.inner_height = self.config.height - self.config.margin.top - self.config.margin.bottom;

        //set Title
        self.svg.append("g")
            .attr("transform", `translate(${self.inner_width / 2}, 15)`)
            .append("text")
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .attr("font-size", "16pt")
            .attr("font-weight", "bold")
            .text("Scatter plot of global warming and rainy season");

        const xlabel_space = 40;
        self.svg.append('text')
            .style('font-size', '12px')
            .attr('x', self.config.margin.left + self.inner_width / 2)
            .attr('y', self.inner_height + self.config.margin.top + xlabel_space)
            .attr('text-anchor', 'middle')
            .text(self.config.xlabel);

        const ylabel_space = 45;
        self.svg.append('text')
            .style('font-size', '12px')
            .attr('transform', `rotate(-90)`)
            .attr('y', self.config.margin.left - ylabel_space - 10)
            .attr('x', -self.config.margin.top - self.inner_height / 2)
            .attr('text-anchor', 'middle')
            .attr('dy', '1em')
            .text(self.config.ylabel);
    }

    update() {
        let self = this;

        // console.log(self.WDataset);
        // console.log(self.TDataset);

        let yTimeparser = d3.timeParse("%m/%d"); //data.data: y/m/d として、それらを分ける

        // データを加工
        //　梅雨入りのデータセット

        console.log("WDataset");
        console.log(self.WDataset);
        console.log("TDataset");
        console.log(self.TDataset);
        self.beginDataset = self.TDataset.map(function (d, i) {
            let year = d.year;
            let date = d.yBegin; // y
            let beginUnknown = d.beginUnknown;
            let tmp = self.WDataset[i + 59];
            let temperature = tmp["temperature"]; // x
            return {year: year, temperature: temperature, date: date, beginUnknown: beginUnknown};
        });

        self.endDataset = self.TDataset.map(function (d, i) {
            let year = d.year;
            let date = d.yEnd; // y
            let beginUnknown = d.beginUnknown;
            let endUnknown = d.endUnknown;
            let tmp = self.WDataset[i + 59];
            let temperature = tmp["temperature"]; // x
            return {year: year, temperature: temperature, date: date, endUnknown: endUnknown};
        });

        // X axis
        let xTicks = (self.inner_width < 768) ? 6 : 12; // x軸の目盛りの量
        self.xScale = d3.scaleLinear() // X軸を線形スケールに設定する
            .domain([               // 最小値と最大値を指定しX軸の領域を設定する
                d3.min(self.WDataset, function (d) {
                    return d.temperature;
                }),
                d3.max(self.WDataset, function (d) {
                    return d.temperature;
                })
            ])
            // SVG内でのX軸の位置の開始位置と終了位置を指定しX軸の幅を設定する
            .range([self.config.margin.left, self.inner_width]);
        self.axisx = d3.axisBottom(self.xScale)   // scaleをセットしてX軸を作成
            .ticks(xTicks)                  // グラフの目盛りの数を設定

        // Y axis
        let yFormat = d3.timeFormat("%m/%d")
        let yTicks = (self.inner_width < 768) ? 6 : 12; // x軸の目盛りの量
        self.yScale = d3.scaleTime() // X軸を時間のスケールに設定する
            .domain([               // 最小値と最大値を指定しX軸の領域を設定する
                d3.min(self.TDataset, function (d) {                // データ内の日付の最小値を取得
                    return d.yBegin;
                }),
                d3.max(self.TDataset, function (d) {                // データ内の日付の最大値を取得
                    return d.yEnd;
                })
            ])
            // SVG内でのX軸の位置の開始位置と終了位置を指定しX軸の幅を設定する
            .range([self.config.margin.top + self.inner_height, self.config.margin.top]);
        self.axisy = d3.axisLeft(self.yScale) // scaleをセットしてY軸を作成
            .ticks(yTicks)
            .tickFormat(yFormat)

        self.render();
    }

    render() {
        let self = this;

        console.log("beginDataset");
        console.log(self.beginDataset);
        console.log("endDataset");
        console.log(self.endDataset);

        // weather season begin
        let beginCircles = self.chart.append("g")
            .attr("class", "rainy begin")
            .selectAll("circle")
            .data(self.beginDataset)
            .join('circle');
        let endCircles = self.chart.append("g")
            .attr("class", "rainy end")
            .selectAll("circle")
            .data(self.endDataset)
            .join('circle');

        const circle_radius = 3;
        beginCircles
            .attr("r", circle_radius)
            .attr("cx", d => self.xScale(d.temperature))
            .attr("cy", d => self.yScale(d.date))
            .attr("fill", function (d) {
                if (d.beginUnknown) return "red"
                else return "blue"
            });
        endCircles
            .attr("r", circle_radius)
            .attr("cx", d => self.xScale(d.temperature))
            .attr("cy", d => self.yScale(d.date))
            .attr("fill", function (d) {
                if (d.endUnknown) return "blue"
                else return "red"
            });

        beginCircles
            .on('mouseover', (e, d) => {
                d3.select('#tooltip')
                    .style('opacity', 1)
                    .html(`<div class="tooltip-label">"rainy season begin"</div>${d.temperature + "[℃]"}, ${d.year + "/" + (d.date.getMonth() + 1) + "/" + d.date.getDate()}`);
            })
            .on('mousemove', (e) => {
                const padding = 10;
                d3.select('#tooltip')
                    .style('left', (e.pageX + padding) + 'px')
                    .style('top', (e.pageY + padding) + 'px');
            })
            .on('mouseleave', () => {
                d3.select('#tooltip')
                    .style('opacity', 0)
                    .style('left', '0px')
                    .style('top', '0px');
            });
        endCircles
            .on('mouseover', (e, d) => {
                d3.select('#tooltip')
                    .style('opacity', 1)
                    .html(`<div class="tooltip-label">"rainy season end"</div>${d.temperature + "[℃]"}, ${d.year + "/" + (d.date.getMonth() + 1) + "/" + d.date.getDate()}`);
            })
            .on('mousemove', (e) => {
                const padding = 10;
                d3.select('#tooltip')
                    .style('left', (e.pageX + padding) + 'px')
                    .style('top', (e.pageY + padding) + 'px');
            })
            .on('mouseleave', () => {
                d3.select('#tooltip')
                    .style('opacity', 0)
                    .style('left', '0px')
                    .style('top', '0px');
            });

        // svg要素にg要素を追加しクラスを付与しxに代入
        let x = self.svg.append("g")
            .attr("class", "axis axis-x")
        x.attr("transform", "translate(" + 0 + "," + (self.config.margin.top + self.inner_height) + ")")
            .call(self.axisx);

        // svg要素にg要素を追加しクラスを付与しyに代入
        let y = self.svg.append("g")
            .attr("class", "axis axis-y")
        y.attr("transform", "translate(" + self.config.margin.left + "," + 0 + ")")
            .call(self.axisy)
    }
}
