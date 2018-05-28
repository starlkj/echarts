import * as echarts from '../../../echarts';
import * as zrUtil from 'zrender/src/core/util';
import BrushController from '../../helper/BrushController';
import BrushTargetManager from '../../helper/BrushTargetManager';
import * as history from '../../dataZoom/history';
import sliderMove from '../../helper/sliderMove';
import lang from '../../../lang';
import * as featureManager from '../featureManager';

// Use dataZoomSelect
import '../../dataZoomSelect';

var dataZoomLang = lang.toolbox.dataZoom;
var each = zrUtil.each;

// Spectial component id start with \0ec\0, see echarts/model/Global.js~hasInnerId
var DATA_ZOOM_ID_BASE = '\0_ec_\0toolbox-dataZoom_';

function DataZoom(model, ecModel, api) {

    /**
     * @private
     * @type {module:echarts/component/helper/BrushController}
     */
    (this._brushController = new BrushController(api.getZr()))
        .on('brush', zrUtil.bind(this._onBrush, this))
        .mount();

    /**
     * @private
     * @type {boolean}
     */
    this._isZoomActive;

    // add by eltriny
    // brushDragEnd 에서 brushSelected 의 데이터를 전달하기 위해서 추가
    this.api = api;

    // add by eltriny
    // brushDragEnd 에서 brushSelected 의 데이터를 전달하기 위해서 추가
    this._brushSelectData = null;

    // add by eltriny
    // brushDragEnd 에서 brushSelected 의 데이터를 전달하기 위해서 추가
    this.api.on( 'brushSelected', zrUtil.bind( this._onBrushSelected, this ) );
}

DataZoom.defaultOption = {
    show: true,
    // Icon group
    icon: {
        zoom: 'M0,13.5h26.9 M13.5,26.9V0 M32.1,13.5H58V58H13.5 V32.1',
        back: 'M22,1.4L9.9,13.5l12.3,12.3 M10.3,13.5H54.9v44.6 H10.3v-26'
    },
    // `zoom`, `back`
    title: zrUtil.clone(dataZoomLang.title)
};

var proto = DataZoom.prototype;

proto.render = function (featureModel, ecModel, api, payload) {
    this.model = featureModel;
    this.ecModel = ecModel;
    this.api = api;

    // add by eltriny - BugFix1 : toggleSelectZoom > 차트 새로고침을 아예 새로 그림으로 할 경우 이전의 설정값이 없어지므로...ecModel에 담아서 그 값을 가져오도록 처리
    if( 'undefined' == typeof this._isZoomActive && 'undefined' != typeof this.ecModel.__zoomActiveFlag ) {
        this._isZoomActive = this.ecModel.__zoomActiveFlag;
    }

    updateZoomBtnStatus(featureModel, ecModel, this, payload, api);
    updateBackBtnStatus(featureModel, ecModel);
};

proto.onclick = function (ecModel, api, type, isZoomActive) {
    // add by eltriny
    ( this.ecModel ) || ( this.ecModel = ecModel );
    ( this.api ) || ( this.api = api );

    // edit by eltriny
    // handlers[type].call(this);
    handlers[type].call( this, isZoomActive );
};

proto.remove = function (ecModel, api) {
    this._brushController.unmount();
};

proto.dispose = function (ecModel, api) {
    this._brushController.dispose();
};

/**
 * @private
 */
var handlers = {

    zoom: function ( isZoomActive ) {
        var nextActive = !this._isZoomActive;

        // add by eltriny - BugFix1 : toggleSelectZoom > toogle 여부를 체크하는 _isZoomActive가 정상적으로 업데이트가 안되는 상황에 대해서 강제 처리를 하기 위함
        if( 'boolean' == typeof isZoomActive ) {
            nextActive = isZoomActive;
            this._isZoomActive = isZoomActive;
            this.ecModel.__zoomActiveFlag = isZoomActive;
        }

        this.api.dispatchAction({
            type: 'takeGlobalCursor',
            key: 'dataZoomSelect',
            dataZoomSelectActive: nextActive
        });
    },

    back: function () {
        this._dispatchZoomAction(history.pop(this.ecModel));
    }
};

/**
 * @private
 * add by eltriny
 */
proto._onBrushSelected = function ( selectedData ) {
    this._brushSelectData = selectedData.batch;
};

/**
 * @private
 */
proto._onBrush = function (areas, opt) {
    if (!opt.isEnd || !areas.length) {
        return;
    }

    // add by eltriny - #20161017-02 : dataZoomDragEnd Event Start
    // Brush Drag End 시 이벤트 발생
    if( opt.isDragEnd ) {
        var modelId = this.model.id;
        this.api.dispatchAction(
            {
                type			: 'dataZoomDragEnd',
                brushId			: modelId,
                areas			: zrUtil.clone(areas),
                $from			: modelId,
                brushSelectData : zrUtil.clone( this._brushSelectData )
            }
        );

        this._brushSelectData = null;
    }

    if( opt.isEnd && opt.removeOnClick ) {
        this.api.dispatchAction( { type: 'enableTip' } );
    }
    else {
        this.api.dispatchAction( { type: 'disableTip' } );
    }
    // add by eltriny - #20161017-02 : dataZoomDragEnd Event End

    var snapshot = {};
    var ecModel = this.ecModel;

    this._brushController.updateCovers([]); // remove cover

    var brushTargetManager = new BrushTargetManager(
        retrieveAxisSetting(this.model.option), ecModel, {include: ['grid']}
    );
    brushTargetManager.matchOutputRanges(areas, ecModel, function (area, coordRange, coordSys) {
        if (coordSys.type !== 'cartesian2d') {
            return;
        }

        var brushType = area.brushType;
        if (brushType === 'rect') {
            setBatch('x', coordSys, coordRange[0]);
            setBatch('y', coordSys, coordRange[1]);
        }
        else {
            setBatch(({lineX: 'x', lineY: 'y'})[brushType], coordSys, coordRange);
        }
    });

    history.push(ecModel, snapshot);

    this._dispatchZoomAction(snapshot);

    function setBatch(dimName, coordSys, minMax) {
        var axis = coordSys.getAxis(dimName);
        var axisModel = axis.model;
        var dataZoomModel = findDataZoom(dimName, axisModel, ecModel);

        if (dataZoomModel) {

            // add by eltriny - #20161018-03 : dataZoom 이벤트 시 start/end 와 startValue/endValue 모두 필요 - Start
            var percentRange = dataZoomModel.getPercentRange();
            var valueRange = dataZoomModel.getValueRange();

            var rangePercentStart = ( percentRange[1] * minMax[0] ) / valueRange[1];
            var rangePercentEnd = ( percentRange[1] * minMax[1] ) / valueRange[1];
            // add by eltriny - #20161018-03 : dataZoom 이벤트 시 start/end 와 startValue/endValue 모두 필요 - End

            // Restrict range.
            // add by dolkkok - #20170614-01 : __dzAxisProxy 정보가 없을때 예외처리
            var minMaxSpan = dataZoomModel.findRepresentativeAxisProxy(axisModel);
            if (minMaxSpan) {
                minMaxSpan = minMaxSpan.getMinMaxSpan();
                if (minMaxSpan.minValueSpan != null || minMaxSpan.maxValueSpan != null) {
                    minMax = sliderMove(
                        0, minMax.slice(), axis.scale.getExtent(), 0,
                        minMaxSpan.minValueSpan, minMaxSpan.maxValueSpan
                    );
                }
            }

            dataZoomModel && (snapshot[dataZoomModel.id] = {
                dataZoomId: dataZoomModel.id,
                startValue: minMax[0],
                endValue: minMax[1],
                range: {
                    start: rangePercentStart,	// add by eltriny - #20161018-03
                    end: rangePercentEnd,		// add by eltriny - #20161018-03
                    startValue: minMax[0],		// add by eltriny - #20161018-03
                    endValue: minMax[1]			// add by eltriny - #20161018-03
                }
            });
        }
    }

    function findDataZoom(dimName, axisModel, ecModel) {
        var found;
        ecModel.eachComponent({mainType: 'dataZoom', subType: 'select'}, function (dzModel) {
            var has = dzModel.getAxisModel(dimName, axisModel.componentIndex);
            has && (found = dzModel);
        });
        return found;
    }
};

/**
 * @private
 */
proto._dispatchZoomAction = function (snapshot) {
    var batch = [];

    // Convert from hash map to array.
    each(snapshot, function (batchItem, dataZoomId) {
        batch.push(zrUtil.clone(batchItem));
    });

    batch.length && this.api.dispatchAction({
        type: 'dataZoom',
        from: this.uid,
        batch: batch
    });
};

function retrieveAxisSetting(option) {
    var setting = {};
    // Compatible with previous setting: null => all axis, false => no axis.
    zrUtil.each(['xAxisIndex', 'yAxisIndex'], function (name) {
        setting[name] = option[name];
        setting[name] == null && (setting[name] = 'all');
        (setting[name] === false || setting[name] === 'none') && (setting[name] = []);
    });
    return setting;
}

function updateBackBtnStatus(featureModel, ecModel) {
    featureModel.setIconStatus(
        'back',
        history.count(ecModel) > 1 ? 'emphasis' : 'normal'
    );
}

function updateZoomBtnStatus(featureModel, ecModel, view, payload, api) {
    var zoomActive = view._isZoomActive;

    if (payload && payload.type === 'takeGlobalCursor') {
        zoomActive = payload.key === 'dataZoomSelect'
            ? payload.dataZoomSelectActive : false;
    }

    view._isZoomActive = zoomActive;

    featureModel.setIconStatus('zoom', zoomActive ? 'emphasis' : 'normal');

    var brushTargetManager = new BrushTargetManager(
        retrieveAxisSetting(featureModel.option), ecModel, {include: ['grid']}
    );

    view._brushController
        .setPanels(brushTargetManager.makePanelOpts(api, function (targetInfo) {
            return (targetInfo.xAxisDeclared && !targetInfo.yAxisDeclared)
                ? 'lineX'
                : (!targetInfo.xAxisDeclared && targetInfo.yAxisDeclared)
                ? 'lineY'
                : 'rect';
        }))
        .enableBrush(
            zoomActive
            ? {
                brushType: 'auto',
                brushStyle: {
                    // FIXME user customized?
                    lineWidth: 0,
                    fill: 'rgba(0,0,0,0.2)'
                }
            }
            : false
        );
}


featureManager.register('dataZoom', DataZoom);


// Create special dataZoom option for select
echarts.registerPreprocessor(function (option) {
    if (!option) {
        return;
    }

    var dataZoomOpts = option.dataZoom || (option.dataZoom = []);
    if (!zrUtil.isArray(dataZoomOpts)) {
        option.dataZoom = dataZoomOpts = [dataZoomOpts];
    }

    var toolboxOpt = option.toolbox;
    if (toolboxOpt) {
        // Assume there is only one toolbox
        if (zrUtil.isArray(toolboxOpt)) {
            toolboxOpt = toolboxOpt[0];
        }

        if (toolboxOpt && toolboxOpt.feature) {
            var dataZoomOpt = toolboxOpt.feature.dataZoom;
            addForAxis('xAxis', dataZoomOpt);
            addForAxis('yAxis', dataZoomOpt);
        }
    }

    function addForAxis(axisName, dataZoomOpt) {
        if (!dataZoomOpt) {
            return;
        }

        // Try not to modify model, because it is not merged yet.
        var axisIndicesName = axisName + 'Index';
        var givenAxisIndices = dataZoomOpt[axisIndicesName];
        if (givenAxisIndices != null
            && givenAxisIndices != 'all'
            && !zrUtil.isArray(givenAxisIndices)
        ) {
            givenAxisIndices = (givenAxisIndices === false || givenAxisIndices === 'none') ? [] : [givenAxisIndices];
        }

        forEachComponent(axisName, function (axisOpt, axisIndex) {
            if (givenAxisIndices != null
                && givenAxisIndices != 'all'
                && zrUtil.indexOf(givenAxisIndices, axisIndex) === -1
            ) {
                return;
            }
            var newOpt = {
                type: 'select',
                $fromToolbox: true,
                // Id for merge mapping.
                id: DATA_ZOOM_ID_BASE + axisName + axisIndex
            };
            // FIXME
            // Only support one axis now.
            newOpt[axisIndicesName] = axisIndex;
            dataZoomOpts.push(newOpt);
        });
    }

    function forEachComponent(mainType, cb) {
        var opts = option[mainType];
        if (!zrUtil.isArray(opts)) {
            opts = opts ? [opts] : [];
        }
        each(opts, cb);
    }
});

export default DataZoom;
