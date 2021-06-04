class TsuyuLineGraph {

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

        // line area
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
            .text("Information of rainy season of Kinki");

        // set Y Label
        self.svg.append("g")
            .attr("transform", `translate(${self.config.margin.left - 60}, ${self.config.margin.top + self.inner_height / 2})`)
            .append("text")
            .attr("fill", "black")
            .attr('transform', `rotate(-90)`)
            .attr("text-anchor", "middle")
            .attr("font-size", "10pt")
            .attr("font-weight", "bold")
            .attr("text-orientation", "sideways")
            .text(self.config.ylabel)

    }

    //値の更新
    update() {
        let self = this;

        let xTimeparser = d3.timeParse("%Y/%m/%d"); //data.data: y/m/d として、それらを分ける
        let yTimeparser = d3.timeParse("%m/%d"); //data.data: y/m/d として、それらを分ける


        // データを加工
        self.dataset = self.data.map(function (d) {
            // 日付のデータをパース
            // 梅雨入りが不明な場合：その年の梅雨明けと同じとする
            // 梅雨明けが不明な場合：その年の梅雨入りと同じとする
            let xBegin, xEnd, yBegin, yEnd;
            let beginUnknown = false;
            let endUnknown = false;
            if (d.begin == null) {
                xBegin = xTimeparser(d.year + "/" + d.end);
                yBegin = yTimeparser(d.end);
                beginUnknown = true;
            } else {
                xBegin = xTimeparser(d.year + "/" + d.begin);
                yBegin = yTimeparser(d.begin);
            }
            if (d.end == null) {
                xEnd = xTimeparser(d.year + "/" + d.begin);
                yEnd = yTimeparser(d.begin);
                endUnknown = true;
            } else {
                xEnd = xTimeparser(d.year + "/" + d.end);
                yEnd = yTimeparser(d.end);
            }
            return {
                year: d.year,
                xBegin: xBegin,
                xEnd: xEnd,
                yBegin: yBegin,
                yEnd: yEnd,
                beginUnknown: beginUnknown,
                endUnknown: endUnknown
            };
        });
        // console.log(self.dataset)

        // X axis
        let xFormat = d3.timeFormat("%Y"); // x軸の目盛りの表示フォーマット
        let xTicks = (self.inner_width < 768) ? 6 : 12; // x軸の目盛りの量
        self.xScale = d3.scaleTime() // X軸を時間のスケールに設定する
            .domain([               // 最小値と最大値を指定しX軸の領域を設定する
                d3.min(self.dataset, function (d) {                // データ内の日付の最小値を取得
                    return d.xBegin;
                }),
                d3.max(self.dataset, function (d) {                // データ内の日付の最大値を取得
                    return d.xBegin;
                })
            ])
            // SVG内でのX軸の位置の開始位置と終了位置を指定しX軸の幅を設定する
            .range([self.config.margin.left, self.inner_width]);
        self.axisx = d3.axisBottom(self.xScale)   // scaleをセットしてX軸を作成
            .ticks(xTicks)                  // グラフの目盛りの数を設定
            .tickFormat(xFormat);            // 目盛りの表示フォーマットを設定

        // Y axis
        let yFormat = d3.timeFormat("%m/%d")
        let yTicks = (self.inner_width < 768) ? 6 : 12; // x軸の目盛りの量
        self.yScale = d3.scaleTime() // X軸を時間のスケールに設定する
            .domain([               // 最小値と最大値を指定しX軸の領域を設定する
                d3.min(self.dataset, function (d) {                // データ内の日付の最小値を取得
                    return d.yBegin;
                }),
                d3.max(self.dataset, function (d) {                // データ内の日付の最大値を取得
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

    //描写
    render() {
        let self = this

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

        self.svg.append("g")
            .selectAll("line").data(self.dataset)
            .enter()
            .append("line")
            .attr("x1", (function (d) {
                return self.xScale(d.xBegin);
            }))
            // lineのY軸をセット
            .attr("y1", (function (d) {
                return self.yScale(d.yBegin);
            }))
            .attr("x2", (function (d) {
                return self.xScale(d.xEnd);
            }))
            .attr("y2", (function (d) {
                return self.yScale(d.yEnd);
            }))
            .attr("stroke-width", 1)
            .attr("stroke", "black")

        let beginCircles = self.svg.append("g")
            .selectAll("circle").data(self.dataset)
            .enter()
            .append("circle")
            .attr("cx", d => self.xScale(d.xBegin))
            .attr("cy", d => self.yScale(d.yBegin))
            .attr("r", 3)
            .attr("fill", function (d) {
                if (d.beginUnknown) return "red"
                else return "blue"
            })

        beginCircles
            .on('mouseover', (e, d) => {
                d3.select('#tooltip')
                    .style('opacity', 1)
                    .html(`<div class="tooltip-label">"rainy season begin"</div>${d.year + "/" + (d.yBegin.getMonth() + 1) + "/" + d.yBegin.getDate()}`);
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

        let endCircles = self.svg.append("g")
            .selectAll("circle").data(self.dataset)
            .enter()
            .append("circle")
            .attr("cx", d => self.xScale(d.xEnd))
            .attr("cy", d => self.yScale(d.yEnd))
            .attr("r", 3)
            .attr("fill", function (d) {
                if (d.endUnknown) return "blue"
                else return "red"
            })

        endCircles
            .on('mouseover', (e, d) => {
                d3.select('#tooltip')
                    .style('opacity', 1)
                    .html(`<div class="tooltip-label">"rainy season end"</div>${d.year + "/" + (d.yEnd.getMonth() + 1) + "/" + d.yEnd.getDate()}`);
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

        let legend = self.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${self.inner_width + 10}, ${self.config.margin.top})`)
            .append("svg")
            .attr("width", 100)
            .attr("height", 100)
            .selectAll("g")
            .data([{label: "end", color: "red"}, {label: "begin", color: "blue"}])
            .enter()
            .append("g")
        legend.append("rect")
            .attr("x", 0)
            .attr("y", function (d, i) {
                return i * 20
            })
            .attr("height", 10)
            .attr("width", 10)
            .attr("fill", d => d.color)
        legend.append("text")
            .attr("x", 20)
            .attr("y", function (d, i) {
                return 10 + i * 20
            })
            .text(d => d.label)
            .attr("text-anchor", "start")

    }

    get_dataset() {
        return this.dataset;
    }
}

