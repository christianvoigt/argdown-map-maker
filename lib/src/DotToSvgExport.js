'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _viz = require('viz.js');

var _viz2 = _interopRequireDefault(_viz);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DotToSvgExport = function () {
    _createClass(DotToSvgExport, [{
        key: 'config',
        set: function set(config) {
            var previousSettings = this.settings;
            if (!previousSettings) {
                previousSettings = {};
            }
            this.settings = _.defaultsDeep({}, config, previousSettings);
            // enforce svg export
            this.settings.format = 'svg';
        }
    }]);

    function DotToSvgExport(config) {
        _classCallCheck(this, DotToSvgExport);

        this.name = "DotExport";
        this.config = config;
    }

    _createClass(DotToSvgExport, [{
        key: 'run',
        value: function run(data) {
            if (data.config) {
                if (data.config.dotToSvg) {
                    this.config = data.config.dotToSvg;
                } else if (data.config.DotToSvgExport) {
                    this.config = data.config.DotToSvgExport;
                }
            }
            if (!data.dot) {
                return data;
            }
            data.svg = (0, _viz2.default)(data.dot, this.settings);
            return data;
        }
    }]);

    return DotToSvgExport;
}();

module.exports = {
    DotToSvgExport: DotToSvgExport
};
//# sourceMappingURL=DotToSvgExport.js.map