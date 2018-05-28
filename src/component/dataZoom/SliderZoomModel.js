import DataZoomModel from './DataZoomModel';

var SliderZoomModel = DataZoomModel.extend({

    type: 'dataZoom.slider',

    layoutMode: 'box',

    /**
     * @protected
     */
    defaultOption: {
        show: true,

        // ph => placeholder. Using placehoder here because
        // deault value can only be drived in view stage.
        right: 'ph',  // Default align to grid rect.
        top: 'ph',    // Default align to grid rect.
        width: 'ph',  // Default align to grid rect.
        height: 'ph', // Default align to grid rect.
        left: null,   // Default align to grid rect.
        bottom: null, // Default align to grid rect.

        // add by starlkj
        backgroundColor: '#f9f9f9',    // Background of slider zoom component.
        //backgroundColor: 'rgba(41,123,184,0.2)',    // Background of slider zoom component. - 원본
        // dataBackgroundColor: '#ddd',         // Background coor of data shadow and border of box,
                                                // highest priority, remain for compatibility of
                                                // previous version, but not recommended any more.
        dataBackground: {
            lineStyle: {
                // add by starlkj
                color: '#dcdedf',
                //color: '#2f4554',
                width: 0.5,
                // add by starlkj
                opacity: 1
                //opacity: 0.3
            },
            areaStyle: {
                // add by starlkj
                //color: 'rgba(47,69,84,0.3)',
                color: '#ebeff1',
                opacity: 1
            }
        },
        borderColor: '#eee',                    // border color of the box. For compatibility,
                                                // if dataBackgroundColor is set, borderColor
                                                // is ignored.

        fillerColor: 'rgba(167,183,204,0.4)',     // Color of selected area.
        // handleColor: 'rgba(89,170,216,0.95)',   원본 // Color of handle.
        // add by dolkkok
        handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
        // handleIcon: 'path://M4.9,17.8c0-1.4,4.5-10.5,5.5-12.4c0-0.1,0.6-1.1,0.9-1.1c0.4,0,0.9,1,0.9,1.1c1.1,2.2,5.4,11,5.4,12.4v17.8c0,1.5-0.6,2.1-1.3,2.1H6.1c-0.7,0-1.3-0.6-1.3-2.1V17.8z',
        // Percent of the slider height
        handleSize: '100%',

        handleStyle: {
            color: '#a7b7cc'
        },

        labelPrecision: null,
        labelFormatter: null,
        showDetail: true,
        showDataShadow: 'auto',                 // Default auto decision.
        realtime: true,
        zoomLock: false,                        // Whether disable zoom.
        textStyle: {
            color: '#333'
        }
    }

});

export default SliderZoomModel;
