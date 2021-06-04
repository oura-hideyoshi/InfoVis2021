let warming_data;
let tsuyu_data;
let warming_line_graph;
let tsuyu_line_graph;
let covariance_scatter_plot;
let filter = [];

covariance_scatter_plot = new CovarianceScatterPlot({
    parent: '#drawing_region_scatter_plot',
    width: 600,
    height: 400,
    margin: {top: 30, right: 10, bottom: 50, left: 80},
    xlabel: 'Difference from average of 1991 to 2020 [℃]',
    ylabel: 'Begin and end date of rainy season'
});

d3.csv("an_wld.csv")
    .then(Wdata => {
        d3.csv("tsuyu_iriake.csv")
            .then(Tdata => {
                warming_data = Wdata;
                warming_data.forEach(d => {
                    d.year = +d.year;
                    d.temperature = +d.global;
                });

                warming_line_graph = new WarmingLineGraph({
                    parent: '#drawing_region_warming_line_graph',
                    width: 600,
                    height: 400,
                    margin: {top: 30, right: 10, bottom: 50, left: 80},
                    xlabel: 'Year',
                    ylabel: 'Difference from average of 1991 to 2020 [℃]',
                    // cscale: color_scale
                }, warming_data);
                warming_line_graph.update();

                covariance_scatter_plot.set_WDataset(warming_line_graph.get_dataset())

                tsuyu_data = Tdata;
                tsuyu_data.forEach(d => {
                    d.year = +d.year;
                    if (d.begin_M == '-9999') d.begin = null;
                    else d.begin = d.begin_M + "/" + d.begin_D;

                    if (d.end_M == '-9999') d.end = null;
                    else d.end = d.end_M + "/" + d.end_D;
                });

                tsuyu_line_graph = new TsuyuLineGraph({
                    parent: '#drawing_region_tsuyu_line_graph',
                    width: 600,
                    height: 400,
                    margin: {top: 30, right: 10, bottom: 50, left: 80},
                    xlabel: 'Year',
                    ylabel: 'Begin and end date of rainy season',
                    // cscale: color_scale
                }, tsuyu_data);
                tsuyu_line_graph.update();

                covariance_scatter_plot.set_TDataset(tsuyu_line_graph.get_dataset());
                covariance_scatter_plot.update();

                let [[begin_w, begin_t], [end_w, end_t]] = preprocess(Wdata, Tdata);
                d3.select("#CoCoff_being")
                    .html(calcCovariance(begin_w, begin_t))
                d3.select("#CoCoff_end")
                    .html(calcCovariance(end_w, end_t))

            })
            .catch(error => {
                console.log(error);
            });
    })
    .catch(error => {
        console.log(error);
    });







