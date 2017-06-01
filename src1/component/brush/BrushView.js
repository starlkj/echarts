define(function (require) {

    var zrUtil = require('zrender/core/util');
    var BrushController = require('../helper/BrushController');
    var echarts = require('../../echarts');
    var brushHelper = require('../helper/brushHelper');

    return echarts.extendComponentView({

        type: 'brush',

        init: function (ecModel, api) {

            /**
             * @readOnly
             * @type {module:echarts/model/Global}
             */
            this.ecModel = ecModel;

            /**
             * @readOnly
             * @type {module:echarts/ExtensionAPI}
             */
            this.api = api;

            /**
             * @readOnly
             * @type {module:echarts/component/brush/BrushModel}
             */
            this.model;

            /**
             * @private
             * @type {module:echarts/component/helper/BrushController}
             */
            (this._brushController = new BrushController(api.getZr(), 'SELECT_BRUSH' ))
                .on('brush', zrUtil.bind(this._onBrush, this))                
                .mount();
                        
            // add by eltriny
            // brushDragEnd 에서 brushSelected 의 데이터를 전달하기 위해서 추가
            this._brushSelectData = null;
            
            // add by eltriny
            // brushDragEnd 에서 brushSelected 의 데이터를 전달하기 위해서 추가
            this.api.on( 'brushSelected', zrUtil.bind( this._onBrushSelected, this ) );
        },

        /**
         * @override
         */
        render: function (brushModel) {
            this.model = brushModel;
            return updateController.apply(this, arguments);
        },

        /**
         * @override
         */
        updateView: updateController,

        /**
         * @override
         */
        updateLayout: updateController,

        /**
         * @override
         */
        updateVisual: updateController,

        /**
         * @override
         */
        dispose: function () {
            this._brushController.dispose();
        },
        
        /**
         * @private
         * add by eltriny
         */
        _onBrushSelected: function ( selectedData ) {        	
        	this._brushSelectData = selectedData.batch;         	
        },

        /**
         * @private
         */
        _onBrush: function (areas, opt) {
            var modelId = this.model.id;
            
            // add by eltriny
            if( opt.isClick ) {
            	return;
            }
            
            // add by eltriny
            // Brush Drag End 시 이벤트 발생
            if( opt.isDragEnd ) {            	
            	this.api.dispatchAction( 
            		{ 
            			type			: 'brushDragEnd',
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

            brushHelper.parseOutputRanges(areas, this.model.coordInfoList, this.ecModel);

            // Action is not dispatched on drag end, because the drag end
            // emits the same params with the last drag move event, and
            // may have some delay when using touch pad, which makes
            // animation not smooth (when using debounce).
            (!opt.isEnd || opt.removeOnClick) && this.api.dispatchAction({
                type: 'brush',
                brushId: modelId,
                areas: zrUtil.clone(areas),
                $from: modelId
            });
        }

    });

    function updateController(brushModel, ecModel, api, payload) {
        // Do not update controller when drawing.
        (!payload || payload.$from !== brushModel.id) && this._brushController
            .setPanels(brushHelper.makePanelOpts(brushModel.coordInfoList))
            .enableBrush(brushModel.brushOption)
            .updateCovers(brushModel.areas.slice());
    }

});