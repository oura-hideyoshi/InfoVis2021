class WarmingLineGraph {

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
            .text("Deviation from annual average temperature");

        // set Y Label
        self.svg.append("g")
            .attr("transform", `translate(${self.config.margin.left - 40}, ${self.config.margin.top + self.inner_height / 2})`)
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

        // X ラベルの設定
        self.timeparser = d3.timeParse("%Y"); //data.data: y/m/d として、それらを分ける

        // データを加工
        self.dataset = self.data.map(function (d) {
            // 日付のデータをパース
            return {year: self.timeparser(d.year), temperature: d.temperature};
        });
        // console.log(self.dataset)

        // X axis
        let format = d3.timeFormat("%Y"); // x軸の目盛りの表示フォーマット
        let xTicks = (self.inner_width < 768) ? 6 : 12; // x軸の目盛りの量
        self.xScale = d3.scaleTime() // X軸を時間のスケールに設定する
            .domain([               // 最小値と最大値を指定しX軸の領域を設定する
                d3.min(self.dataset, function (d) {                // データ内の日付の最小値を取得
                    return d.year;
                }),
                d3.max(self.dataset, function (d) {                // データ内の日付の最大値を取得
                    return d.year;
                })
            ])
            // SVG内でのX軸の位置の開始位置と終了位置を指定しX軸の幅を設定する
            .range([self.config.margin.left, self.inner_width]);
        self.axisx = d3.axisBottom(self.xScale)   // scaleをセットしてX軸を作成
            .ticks(xTicks)                  // グラフの目盛りの数を設定
            .tickFormat(format);            // 目盛りの表示フォーマットを設定

        // Y axis
        self.yScale = d3.scaleLinear()        // Y軸を値のスケールに設定する
            .domain([                        // 最小値と最大値を指定しX軸の領域を設定する
                d3.min(self.dataset, function (d) {                  // データ内のvalueの最大値を取得
                    return d.temperature;
                }),                                              // 0を最小値として設定
                d3.max(self.dataset, function (d) {                  // データ内のvalueの最大値を取得
                    return d.temperature;
                })
            ])
            // SVG内でのY軸の位置の開始位置と終了位置を指定しY軸の幅を設定する
            .range([self.config.margin.top + self.inner_height, self.config.margin.top]);
        self.axisy = d3.axisLeft(self.yScale);// scaleをセットしてY軸を作成

        //Line
        self.line = d3.line()
            // lineのX軸をセット
            .x(function (d) {
                return self.xScale(d.year);
            })
            // lineのY軸をセット
            .y(function (d) {
                return self.yScale(d.temperature);
            })
            .curve(d3.curveNatural)

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

        // パス要素を追加
        let path = self.svg.append("path");
        let color = d3.rgb("red");
        path
            .datum(self.dataset)            // dataをセット
            .attr("fill", "none")            // 塗りつぶしをなしに
            .attr("stroke", "gray")            // strokeカラーを設定
            .attr("d", self.line)            // d属性を設定

        // 0.0の横線
        let hriLine = self.svg
            .append("line")
            .attr("x1", self.config.margin.left)
            .attr("y1", self.yScale(0.0))
            .attr("x2", self.xScale(self.timeparser("2020")))
            .attr("y2", self.yScale(0.0))
            .attr("stroke-width", 2)
            .attr("stroke", "black")
            .attr("stroke-opacity", 0.8)
            .attr("stroke-dasharray", "3px")
            .attr("stroke", "red")

        hriLine.on('mouseover', (e, d) => {
                let rect = d3.select(e.toElement);
                rect.attr("stroke-opacity", 0.3);
            })
            .on('mouseleave', (e) => {
                let rect = d3.select(e.fromElement);
                rect.attr("stroke-opacity", 0.8);
            });


        // 1951年の縦線
        let verLine = self.svg
            .append("line")
            .attr("x1", self.xScale(self.timeparser("1951")))
            .attr("y1", self.yScale(
                d3.min(self.dataset, function (d) {
                    return d.temperature;
                })))
            .attr("x2", self.xScale(self.timeparser("1951")))
            .attr("y2", self.yScale(
                d3.max(self.dataset, function (d) {
                    return d.temperature;
                })))
            .attr("stroke-width", 2)
            .attr("stroke", "black")
            .attr("stroke-opacity", 0.8)
            .attr("stroke-dasharray", "3px")
            .attr("stroke", "gray")
    }

    get_dataset() {
        return this.dataset;
    }
}
