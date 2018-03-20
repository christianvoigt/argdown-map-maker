import Viz from 'viz.js';
import * as _ from 'lodash';

class DotToSvgExport {
    set config(config) {
        let previousSettings = this.settings;
        if (!previousSettings) {
            previousSettings = {};
        }
        this.settings = _.defaultsDeep({}, config, previousSettings);
        // enforce svg export
        this.settings.format = 'svg';
    }
    constructor(config) {
        this.name = "DotToSvgExport";
        this.config = config;
    }
    run(data) {
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
        data.svg = Viz(data.dot, this.settings);
        return data;
    }
}
module.exports = {
    DotToSvgExport: DotToSvgExport
}
