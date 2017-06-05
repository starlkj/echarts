define(function (require) {

    var SeriesModel = require('../../model/Series');
    var createListFromArray = require('../helper/createListFromArray');

    return SeriesModel.extend({
        type: 'series.heatmap',

        getInitialData: function (option, ecModel) {
            return createListFromArray(option.data, this, ecModel);
        },
        
        // add by eltriny - #20161109-01 : [추가] 각 차트별 Brush 기능
        brushSelector: 'rect',

        defaultOption: {

            // Cartesian2D or geo
            coordinateSystem: 'cartesian2d',

            zlevel: 0,

            z: 2,

            // Cartesian coordinate system
            // xAxisIndex: 0,
            // yAxisIndex: 0,

            // Geo coordinate system
            geoIndex: 0,

            blurSize: 30,

            pointSize: 20,

            maxOpacity: 1,

            minOpacity: 0
        }
    });
});