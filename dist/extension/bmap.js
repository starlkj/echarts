(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("echarts"));
	else if(typeof define === 'function' && define.amd)
		define(["echarts"], factory);
	else if(typeof exports === 'object')
		exports["bmap"] = factory(require("echarts"));
	else
		root["echarts"] = root["echarts"] || {}, root["echarts"]["bmap"] = factory(root["echarts"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_0__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */,
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var echarts = __webpack_require__(0);

var BMapCoordSys = __webpack_require__(3);

__webpack_require__(4);

__webpack_require__(5);

/**
 * BMap component extension
 */
echarts.registerCoordinateSystem('bmap', BMapCoordSys); // Action

echarts.registerAction({
  type: 'bmapRoam',
  event: 'bmapRoam',
  update: 'updateLayout'
}, function (payload, ecModel) {
  ecModel.eachComponent('bmap', function (bMapModel) {
    var bmap = bMapModel.getBMap();
    var center = bmap.getCenter();
    bMapModel.setCenterAndZoom([center.lng, center.lat], bmap.getZoom());
  });
});
var version = '1.0.0';
exports.version = version;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var _echarts = __webpack_require__(0);

var zrUtil = _echarts.util;
var graphic = _echarts.graphic;
var matrix = _echarts.matrix;

/* global BMap */
function BMapCoordSys(bmap, api) {
  this._bmap = bmap;
  this.dimensions = ['lng', 'lat'];
  this._mapOffset = [0, 0];
  this._api = api;
  this._projection = new BMap.MercatorProjection();
}

BMapCoordSys.prototype.dimensions = ['lng', 'lat'];

BMapCoordSys.prototype.setZoom = function (zoom) {
  this._zoom = zoom;
};

BMapCoordSys.prototype.setCenter = function (center) {
  this._center = this._projection.lngLatToPoint(new BMap.Point(center[0], center[1]));
};

BMapCoordSys.prototype.setMapOffset = function (mapOffset) {
  this._mapOffset = mapOffset;
};

BMapCoordSys.prototype.getBMap = function () {
  return this._bmap;
};

BMapCoordSys.prototype.dataToPoint = function (data) {
  var point = new BMap.Point(data[0], data[1]); // TODO mercator projection is toooooooo slow
  // var mercatorPoint = this._projection.lngLatToPoint(point);
  // var width = this._api.getZr().getWidth();
  // var height = this._api.getZr().getHeight();
  // var divider = Math.pow(2, 18 - 10);
  // return [
  //     Math.round((mercatorPoint.x - this._center.x) / divider + width / 2),
  //     Math.round((this._center.y - mercatorPoint.y) / divider + height / 2)
  // ];

  var px = this._bmap.pointToOverlayPixel(point);

  var mapOffset = this._mapOffset;
  return [px.x - mapOffset[0], px.y - mapOffset[1]];
};

BMapCoordSys.prototype.pointToData = function (pt) {
  var mapOffset = this._mapOffset;

  var pt = this._bmap.overlayPixelToPoint({
    x: pt[0] + mapOffset[0],
    y: pt[1] + mapOffset[1]
  });

  return [pt.lng, pt.lat];
};

BMapCoordSys.prototype.getViewRect = function () {
  var api = this._api;
  return new graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight());
};

BMapCoordSys.prototype.getRoamTransform = function () {
  return matrix.create();
};

BMapCoordSys.prototype.prepareCustoms = function (data) {
  var rect = this.getViewRect();
  return {
    coordSys: {
      // The name exposed to user is always 'cartesian2d' but not 'grid'.
      type: 'bmap',
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    },
    api: {
      coord: zrUtil.bind(this.dataToPoint, this),
      size: zrUtil.bind(dataToCoordSize, this)
    }
  };
};

function dataToCoordSize(dataSize, dataItem) {
  dataItem = dataItem || [0, 0];
  return zrUtil.map([0, 1], function (dimIdx) {
    var val = dataItem[dimIdx];
    var halfSize = dataSize[dimIdx] / 2;
    var p1 = [];
    var p2 = [];
    p1[dimIdx] = val - halfSize;
    p2[dimIdx] = val + halfSize;
    p1[1 - dimIdx] = p2[1 - dimIdx] = dataItem[1 - dimIdx];
    return Math.abs(this.dataToPoint(p1)[dimIdx] - this.dataToPoint(p2)[dimIdx]);
  }, this);
}

var Overlay; // For deciding which dimensions to use when creating list data

BMapCoordSys.dimensions = BMapCoordSys.prototype.dimensions;

function createOverlayCtor() {
  function Overlay(root) {
    this._root = root;
  }

  Overlay.prototype = new BMap.Overlay();
  /**
   * 初始化
   *
   * @param {BMap.Map} map
   * @override
   */

  Overlay.prototype.initialize = function (map) {
    map.getPanes().labelPane.appendChild(this._root);
    return this._root;
  };
  /**
   * @override
   */


  Overlay.prototype.draw = function () {};

  return Overlay;
}

BMapCoordSys.create = function (ecModel, api) {
  var bmapCoordSys;
  var root = api.getDom(); // TODO Dispose

  ecModel.eachComponent('bmap', function (bmapModel) {
    var painter = api.getZr().painter;
    var viewportRoot = painter.getViewportRoot();

    if (typeof BMap === 'undefined') {
      throw new Error('BMap api is not loaded');
    }

    Overlay = Overlay || createOverlayCtor();

    if (bmapCoordSys) {
      throw new Error('Only one bmap component can exist');
    }

    if (!bmapModel.__bmap) {
      // Not support IE8
      var bmapRoot = root.querySelector('.ec-extension-bmap');

      if (bmapRoot) {
        // Reset viewport left and top, which will be changed
        // in moving handler in BMapView
        viewportRoot.style.left = '0px';
        viewportRoot.style.top = '0px';
        root.removeChild(bmapRoot);
      }

      bmapRoot = document.createElement('div');
      bmapRoot.style.cssText = 'width:100%;height:100%'; // Not support IE8

      bmapRoot.classList.add('ec-extension-bmap');
      root.appendChild(bmapRoot);
      var bmap = bmapModel.__bmap = new BMap.Map(bmapRoot);
      var overlay = new Overlay(viewportRoot);
      bmap.addOverlay(overlay); // Override

      painter.getViewportRootOffset = function () {
        return {
          offsetLeft: 0,
          offsetTop: 0
        };
      };
    }

    var bmap = bmapModel.__bmap; // Set bmap options
    // centerAndZoom before layout and render

    var center = bmapModel.get('center');
    var zoom = bmapModel.get('zoom');

    if (center && zoom) {
      var pt = new BMap.Point(center[0], center[1]);
      bmap.centerAndZoom(pt, zoom);
    }

    bmapCoordSys = new BMapCoordSys(bmap, api);
    bmapCoordSys.setMapOffset(bmapModel.__mapOffset || [0, 0]);
    bmapCoordSys.setZoom(zoom);
    bmapCoordSys.setCenter(center);
    bmapModel.coordinateSystem = bmapCoordSys;
  });
  ecModel.eachSeries(function (seriesModel) {
    if (seriesModel.get('coordinateSystem') === 'bmap') {
      seriesModel.coordinateSystem = bmapCoordSys;
    }
  });
};

var _default = BMapCoordSys;
module.exports = _default;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var echarts = __webpack_require__(0);

function v2Equal(a, b) {
  return a && b && a[0] === b[0] && a[1] === b[1];
}

var _default = echarts.extendComponentModel({
  type: 'bmap',
  getBMap: function () {
    // __bmap is injected when creating BMapCoordSys
    return this.__bmap;
  },
  setCenterAndZoom: function (center, zoom) {
    this.option.center = center;
    this.option.zoom = zoom;
  },
  centerOrZoomChanged: function (center, zoom) {
    var option = this.option;
    return !(v2Equal(center, option.center) && zoom === option.zoom);
  },
  defaultOption: {
    center: [104.114129, 37.550339],
    zoom: 5,
    mapStyle: {},
    roam: false
  }
});

module.exports = _default;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var echarts = __webpack_require__(0);

var _default = echarts.extendComponentView({
  type: 'bmap',
  render: function (bMapModel, ecModel, api) {
    var rendering = true;
    var bmap = bMapModel.getBMap();
    var viewportRoot = api.getZr().painter.getViewportRoot();
    var coordSys = bMapModel.coordinateSystem;

    var moveHandler = function (type, target) {
      if (rendering) {
        return;
      }

      var offsetEl = viewportRoot.parentNode.parentNode.parentNode;
      var mapOffset = [-parseInt(offsetEl.style.left, 10) || 0, -parseInt(offsetEl.style.top, 10) || 0];
      viewportRoot.style.left = mapOffset[0] + 'px';
      viewportRoot.style.top = mapOffset[1] + 'px';
      coordSys.setMapOffset(mapOffset);
      bMapModel.__mapOffset = mapOffset;
      api.dispatchAction({
        type: 'bmapRoam'
      });
    };

    function zoomEndHandler() {
      if (rendering) {
        return;
      }

      api.dispatchAction({
        type: 'bmapRoam'
      });
    }

    bmap.removeEventListener('moving', this._oldMoveHandler); // FIXME
    // Moveend may be triggered by centerAndZoom method when creating coordSys next time
    // bmap.removeEventListener('moveend', this._oldMoveHandler);

    bmap.removeEventListener('zoomend', this._oldZoomEndHandler);
    bmap.addEventListener('moving', moveHandler); // bmap.addEventListener('moveend', moveHandler);

    bmap.addEventListener('zoomend', zoomEndHandler);
    this._oldMoveHandler = moveHandler;
    this._oldZoomEndHandler = zoomEndHandler;
    var roam = bMapModel.get('roam');

    if (roam && roam !== 'scale') {
      bmap.enableDragging();
    } else {
      bmap.disableDragging();
    }

    if (roam && roam !== 'move') {
      bmap.enableScrollWheelZoom();
      bmap.enableDoubleClickZoom();
      bmap.enablePinchToZoom();
    } else {
      bmap.disableScrollWheelZoom();
      bmap.disableDoubleClickZoom();
      bmap.disablePinchToZoom();
    }

    var originalStyle = bMapModel.__mapStyle;
    var newMapStyle = bMapModel.get('mapStyle') || {}; // FIXME, Not use JSON methods

    var mapStyleStr = JSON.stringify(newMapStyle);

    if (JSON.stringify(originalStyle) !== mapStyleStr) {
      // FIXME May have blank tile when dragging if setMapStyle
      if (Object.keys(newMapStyle).length) {
        bmap.setMapStyle(newMapStyle);
      }

      bMapModel.__mapStyle = JSON.parse(mapStyleStr);
    }

    rendering = false;
  }
});

module.exports = _default;

/***/ })
/******/ ]);
});