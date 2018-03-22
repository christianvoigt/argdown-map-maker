import Viz from "viz.js";
import * as _ from "lodash";

class DotToSvgExport {
    set config(config) {
        let previousSettings = this.settings;
        if (!previousSettings) {
            previousSettings = {};
        }
        this.settings = _.defaultsDeep({}, config, previousSettings);
        // enforce svg export
        this.settings.format = "svg";
    }
    constructor(config) {
        this.name = "DotToSvgExport";
        this.config = config;
    }
    run(request, response) {
        if (request.dotToSvg) {
            this.config = request.dotToSvg;
        } else if (request.DotToSvgExport) {
            this.config = request.DotToSvgExport;
        }
        if (!response.dot) {
            return response;
        }
        response.svg = Viz(response.dot, this.settings);
        return response;
    }
}
module.exports = {
    DotToSvgExport: DotToSvgExport
};
