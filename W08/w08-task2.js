// Load data
d3.csv("pcr_positive_daily2.csv")
    .then(data => {
        data.forEach(d => {
            d.num = +d.num;
        })
        var config = {
            parent: '#drawing_region',
            width: 700,
            height: 400,
            margin: {top: 30, right: 10, bottom: 50, left: 50}
        };
        const lc = new LineChart(config, data)
        lc.update()

    })
    .catch(error => {
        console.log(error);
    });

class LineChart {

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
            .attr("transform", `translate(${self.config.margin.left}, 15)`)
            .append("text")
            .attr("fill", "black")
            .attr("x", 0)
            .attr("y", 0)
            .attr("font-size", "10pt")
            .attr("font-weight", "bold")
            .text("日本のコロナ新規感染者数");

        // set Y Label
        self.svg.append("g")
            .attr("transform", `translate(${self.config.margin.left + 10}, ${self.config.margin.top + 10})`)
            .append("text")
            .attr("fill", "black")
            .attr("x", 0)
            .attr("y", 0)
            .attr("text-anchor", "upper")
            .attr("font-size", "8pt")
            .attr("font-weight", "bold")
            .attr("text-orientation", "sideways")
            .text("新規感染者数[人]")

    }

    //値の更新
    update() {
        let self = this;

        // X ラベルの設定
        let timeparser = d3.timeParse("%Y/%m/%d"); //data.data: y/m/d として、それらを分ける


        // データを加工
        self.dataset = self.data.map(function (d) {
            // 日付のデータをパース
            return {date: timeparser(d.date), num: d.num};
        });
        console.log(self.dataset)

        // X axis
        let format = d3.timeFormat("%y/%m/%d"); // x軸の目盛りの表示フォーマット
        let xTicks = (self.inner_width < 768) ? 6 : 12; // x軸の目盛りの量
        let xScale = d3.scaleTime() // X軸を時間のスケールに設定する
            .domain([               // 最小値と最大値を指定しX軸の領域を設定する
                d3.min(self.dataset, function (d) {                // データ内の日付の最小値を取得
                    return d.date;
                }),
                d3.max(self.dataset, function (d) {                // データ内の日付の最大値を取得
                    return d.date;
                })
            ])
            // SVG内でのX軸の位置の開始位置と終了位置を指定しX軸の幅を設定する
            .range([self.config.margin.left, self.inner_width]);
        self.axisx = d3.axisBottom(xScale)   // scaleをセットしてX軸を作成
            .ticks(xTicks)                  // グラフの目盛りの数を設定
            .tickFormat(format);            // 目盛りの表示フォーマットを設定

        // Y axis
        let yScale = d3.scaleLinear()        // Y軸を値のスケールに設定する
            .domain([                        // 最小値と最大値を指定しX軸の領域を設定する
                0,                                              // 0を最小値として設定
                d3.max(self.dataset, function (d) {                  // データ内のvalueの最大値を取得
                    return d.num;
                })
            ])
            // SVG内でのY軸の位置の開始位置と終了位置を指定しY軸の幅を設定する
            .range([self.config.margin.top + self.inner_height, self.config.margin.top]);
        self.axisy = d3.axisLeft(yScale);// scaleをセットしてY軸を作成

        //Line
        self.line = d3.line()
            // lineのX軸をセット
            .x(function (d) {
                return xScale(d.date);
            })
            // lineのY軸をセット
            .y(function (d) {
                return yScale(d.num);
            })
            .curve(d3.curveNatural)

        self.area = d3.area()
            .x(function (d) {
                return xScale(d.date);
            })
            .y1(function (d) {
                return yScale(d.num);
            })
            .y0(yScale(0))
            // カーブを設定
            .curve(d3.curveCatmullRom.alpha(0.4))

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

        // エリア要素を追加
        let lineArea = self.svg.append("path")
        let linearGradient = self.svg.append("defs")
            .append("linearGradient")
            .attr("id", "linear-gradient")
            .attr("gradientTransform", "rotate(90)");  //変化の向きを縦にセット
        linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "red");
        linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "white");
        lineArea
            .datum(self.dataset)
            .attr("d", self.area)
            .style("fill", "url(#linear-gradient)")
    }
}




