function preprocess(Wdata, Tdata) {
    /**
     * ・年の数に差があるので、同じ年のものを抜き出す
     * ・梅雨のデータに不明なものがいくつかあるので、そういったデータは省く
     * ・日付データを数値データへ変換する
     *
     * Wdata : Array columns : ["year", "global", "N_hemisphere", "S_hemisphere"]
     * Tdata : Array columns : ["year", "begin_M", "begin_D", "end_M", "end_D"]
     *
     * return : [Array (float), Array (float)], [Array(float), Array(float)]
     *          温暖化と梅雨入りのデータセット,　温暖化と梅雨明けのデータセット
     *
     */
        // create 温暖化と梅雨入りのデータセット
    let begin_w = []; // 梅雨入り : 温暖化側のデータセット
    let begin_t = []; // 梅雨入り : 梅雨側のデータセット
    let end_w = []; // 梅雨明け : 温暖化側のデータセット
    let end_t = []; // 梅雨明け : 梅雨側のデータセット

    // データの分割
    let roll_t = d3.rollup(Tdata, d => d, k => k.year)
    for (let idx in Wdata) {
        let t = roll_t.get(Wdata[idx].year);
        if (t != undefined) {
            if (t[0].begin != null) {
                begin_w.push(Wdata[idx].temperature);
                begin_t.push(t[0].begin);
            }

            if (t[0].end != null) {
                end_w.push(Wdata[idx].temperature);
                end_t.push(t[0].end);
            }
        }
    }

    // 日付 -> float
    let tp = d3.timeParse("%m/%d");
    let scale = d3.scaleTime()
            .domain([
                d3.min(begin_t, function (d) {
                    return tp(d)
                }),
                d3.max(end_t, function (d) {
                    return tp(d)
                })
            ])
            .range([0, 1]);

    begin_t = begin_t.map(d => scale(tp(d)));
    end_t = end_t.map(d => scale(tp(d)));

    // console.log(begin_w, begin_t, end_w, end_t)
    return [[begin_w, begin_t], [end_w, end_t]];
}

function calcCovariance(data1, data2) {
    /**
     *  data1: Array (float)
     *  data2: Array (float)
     */
    return ss.sampleCorrelation(data1, data2).toFixed(2)
}
