import SeriesModel from '../../model/Series';
import createListFromArray from '../helper/createListFromArray';
import CoordinateSystem from '../../CoordinateSystem';

export default SeriesModel.extend({
    type: 'series.heatmap',

    getInitialData: function (option, ecModel) {
        return createListFromArray(this.getSource(), this);
    },

    preventIncremental: function () {
        var coordSysCreator = CoordinateSystem.get(this.get('coordinateSystem'));
        if (coordSysCreator && coordSysCreator.dimensions) {
            return coordSysCreator.dimensions[0] === 'lng' && coordSysCreator.dimensions[1] === 'lat';
        }
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
