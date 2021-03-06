"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DotExport = function () {
    function DotExport(config) {
        _classCallCheck(this, DotExport);

        var defaultSettings = {
            useHtmlLabels: true,
            graphname: "Argument Map",
            lineLength: 25,
            groupColors: ["#DADADA", "#BABABA", "#AAAAAA"],
            graphVizSettings: {
                rankdir: "BT", //BT | TB | LR | RL
                concentrate: "false",
                ratio: "auto",
                size: "10,10"
            },
            colorNodesByTag: true
        };
        this.defaults = _.defaultsDeep({}, config, defaultSettings);
        this.name = "DotExport";
    }

    _createClass(DotExport, [{
        key: "getSettings",
        value: function getSettings(request) {
            if (request.dot) {
                return request.dot;
            } else if (request.DotExport) {
                return request.DotExport;
            } else {
                request.dot = {};
                return request.dot;
            }
        }
    }, {
        key: "prepare",
        value: function prepare(request) {
            _.defaultsDeep(this.getSettings(request), this.defaults);
        }
    }, {
        key: "run",
        value: function run(request, response) {
            if (!response.map || !response.statements || !response.arguments) {
                return response;
            }
            var settings = this.getSettings(request);

            response.groupCount = 0;
            var dot = 'digraph "' + settings.graphname + '" {\n\n';
            if (settings.graphVizSettings) {
                var keys = Object.keys(settings.graphVizSettings);
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var key = _step.value;

                        var value = settings.graphVizSettings[key];
                        dot += key + ' = "' + value + '";\n';
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = response.map.nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var node = _step2.value;

                    dot += this.exportNodesRecursive(node, response, settings);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            dot += "\n\n";

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = response.map.edges[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var edge = _step3.value;

                    var color = "green";
                    if (edge.type == "attack") {
                        color = "red";
                    } else if (edge.type == "undercut") {
                        color = "purple";
                    }
                    var attributes = 'color="' + color + '", type="' + edge.type + '"';
                    dot += "  " + edge.from.id + " -> " + edge.to.id + " [" + attributes + "];\n";
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            dot += "\n}";

            response.dot = dot;
            return response;
        }
    }, {
        key: "exportNodesRecursive",
        value: function exportNodesRecursive(node, response, settings) {
            var dot = "";
            if (node.type == "group") {
                response.groupCount++;
                var dotGroupId = "cluster_" + response.groupCount;
                var groupLabel = node.labelTitle;
                if (settings.useHtmlLabels) {
                    groupLabel = this.foldAndEscape(groupLabel, settings);
                    groupLabel = '<<FONT FACE="Arial" POINT-SIZE="10">' + groupLabel + "</FONT>>";
                } else {
                    groupLabel = '"' + this.escapeQuotesForDot(groupLabel) + '"';
                }
                var groupColor = "#CCCCCC";
                if (settings.groupColors && settings.groupColors.length > 0) {
                    if (settings.groupColors.length >= node.level) {
                        groupColor = settings.groupColors[node.level];
                    } else {
                        groupColor = settings.groupColors[settings.groupColors.length - 1];
                    }
                }

                dot += "\nsubgraph " + dotGroupId + " {\n";
                dot += "  label = " + groupLabel + ";\n";
                dot += '  color = "' + groupColor + '";\n';
                dot += "  style = filled;\n";
                var labelloc = "t";
                if (settings.graphVizSettings.rankdir == "BT") {
                    labelloc = "b";
                }
                dot += ' labelloc = "' + labelloc + '";\n\n';

                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = node.nodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var child = _step4.value;

                        dot += this.exportNodesRecursive(child, response, settings);
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }

                dot += "\n}\n\n";
                return dot;
            }

            var title = node.labelTitle;
            var text = node.labelText;
            var label = "";
            var color = "#63AEF2";
            if (settings.colorNodesByTag && node.tags && response.tagsDictionary) {
                var tag = node.tags[0];
                var tagData = response.tagsDictionary[tag];
                if (tagData && tagData.color) {
                    color = tagData.color;
                }
            }
            label = this.getLabel(title, text, settings);
            if (node.type == "argument") {
                dot += "  " + node.id + " [label=" + label + ', shape="box", style="filled,rounded", fillcolor="' + color + '",  type="' + node.type + '"];\n';
            } else if (node.type == "statement") {
                dot += "  " + node.id + " [label=" + label + ', shape="box", style="filled,rounded,bold", color="' + color + '", fillcolor="white", labelfontcolor="white", type="' + node.type + '"];\n';
            }
            return dot;
        }
    }, {
        key: "getLabel",
        value: function getLabel(title, text, settings) {
            var label = "";
            if (settings.useHtmlLabels) {
                label += '<<FONT FACE="Arial" POINT-SIZE="8"><TABLE BORDER="0" CELLSPACING="0">';
                if (!_.isEmpty(title)) {
                    var titleLabel = this.foldAndEscape(title, settings);
                    titleLabel = '<TR><TD ALIGN="center"><B>' + titleLabel + "</B></TD></TR>";
                    label += titleLabel;
                }
                if (!_.isEmpty(text)) {
                    var textLabel = this.foldAndEscape(text, settings);
                    textLabel = '<TR><TD ALIGN="center">' + textLabel + "</TD></TR>";
                    label += textLabel;
                }
                label += "</TABLE></FONT>>";
            } else {
                label = '"' + this.escapeQuotesForDot(title) + '"';
            }
            return label;
        }
    }, {
        key: "foldAndEscape",
        value: function foldAndEscape(str, settings) {
            var strArray = this.fold(str, settings.lineLength, true);
            for (var i = 0; i < strArray.length; i++) {
                strArray[i] = this.escapeForHtml(strArray[i]);
            }
            return strArray.join("<br/>");
        }
    }, {
        key: "escapeForHtml",
        value: function escapeForHtml(s) {
            return s.replace(/[^0-9A-Za-z ]/g, function (c) {
                return "&#" + c.charCodeAt(0) + ";";
            });
        }
    }, {
        key: "escapeQuotesForDot",
        value: function escapeQuotesForDot(str) {
            return str.replace(/\"/g, '\\"');
        }

        //http://jsfiddle.net/jahroy/Rwr7q/18/
        //http://stackoverflow.com/questions/17895039/how-to-insert-line-break-after-every-80-characters
        // Folds a string at a specified length, optionally attempting
        // to insert newlines after whitespace characters.
        //
        // s          -  input string
        // n          -  number of chars at which to separate lines
        // useSpaces  -  if true, attempt to insert newlines at whitespace
        // a          -  array used to build result
        //
        // Returns an array of strings that are no longer than n
        // characters long.  If a is specified as an array, the lines
        // found in s will be pushed onto the end of a.
        //
        // If s is huge and n is very small, this method will have
        // problems... StackOverflow.
        //

    }, {
        key: "fold",
        value: function fold(s, n, useSpaces, a) {
            if (!s) return [];

            a = a || [];
            if (s.length <= n) {
                a.push(s);
                return a;
            }
            var line = s.substring(0, n);
            if (!useSpaces) {
                // insert newlines anywhere
                a.push(line);
                return this.fold(s.substring(n), n, useSpaces, a);
            } else {
                // attempt to insert newlines after whitespace
                var lastSpaceRgx = /\s(?!.*\s)/;
                var idx = line.search(lastSpaceRgx);
                var nextIdx = n;
                if (idx > 0) {
                    line = line.substring(0, idx);
                    nextIdx = idx;
                }
                a.push(line);
                return this.fold(s.substring(nextIdx), n, useSpaces, a);
            }
        }
    }]);

    return DotExport;
}();

module.exports = {
    DotExport: DotExport
};
//# sourceMappingURL=DotExport.js.map