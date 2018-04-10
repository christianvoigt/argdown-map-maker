import * as _ from "lodash";

class DotExport {
    constructor(config) {
        const defaultSettings = {
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
    getSettings(request) {
        if (request.dot) {
            return request.dot;
        } else if (request.DotExport) {
            return request.DotExport;
        } else {
            request.dot = {};
            return request.dot;
        }
    }
    prepare(request) {
        _.defaultsDeep(this.getSettings(request), this.defaults);
    }
    run(request, response) {
        if (!response.map || !response.statements || !response.arguments) {
            return response;
        }
        const settings = this.getSettings(request);

        response.groupCount = 0;
        let dot = 'digraph "' + settings.graphname + '" {\n\n';
        if (settings.graphVizSettings) {
            const keys = Object.keys(settings.graphVizSettings);
            for (let key of keys) {
                const value = settings.graphVizSettings[key];
                dot += key + ' = "' + value + '";\n';
            }
        }

        for (let node of response.map.nodes) {
            dot += this.exportNodesRecursive(node, response, settings);
        }

        dot += "\n\n";

        for (let edge of response.map.edges) {
            let color = "green";
            if (edge.type == "attack") {
                color = "red";
            } else if (edge.type == "undercut") {
                color = "purple";
            }
            let attributes = 'color="' + color + '", type="' + edge.type + '"';
            dot += "  " + edge.from.id + " -> " + edge.to.id + " [" + attributes + "];\n";
        }

        dot += "\n}";

        response.dot = dot;
        return response;
    }
    exportNodesRecursive(node, response, settings) {
        let dot = "";
        if (node.type == "group") {
            response.groupCount++;
            let dotGroupId = "cluster_" + response.groupCount;
            let groupLabel = node.labelTitle;
            if (settings.useHtmlLabels) {
                groupLabel = this.foldAndEscape(groupLabel, settings);
                groupLabel = '<<FONT FACE="Arial" POINT-SIZE="10">' + groupLabel + "</FONT>>";
            } else {
                groupLabel = '"' + this.escapeQuotesForDot(groupLabel) + '"';
            }
            let groupColor = "#CCCCCC";
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
            let labelloc = "t";
            if (settings.graphVizSettings.rankdir == "BT") {
                labelloc = "b";
            }
            dot += ' labelloc = "' + labelloc + '";\n\n';

            for (let child of node.nodes) {
                dot += this.exportNodesRecursive(child, response, settings);
            }
            dot += "\n}\n\n";
            return dot;
        }

        let title = node.labelTitle;
        let text = node.labelText;
        let label = "";
        let color = "#63AEF2";
        if (settings.colorNodesByTag && node.tags && response.tagsDictionary) {
            const tag = node.tags[0];
            let tagData = response.tagsDictionary[tag];
            if (tagData && tagData.color) {
                color = tagData.color;
            }
        }
        label = this.getLabel(title, text, settings);
        if (node.type == "argument") {
            dot +=
                "  " +
                node.id +
                " [label=" +
                label +
                ', shape="box", style="filled,rounded", fillcolor="' +
                color +
                '",  type="' +
                node.type +
                '"];\n';
        } else if (node.type == "statement") {
            dot +=
                "  " +
                node.id +
                " [label=" +
                label +
                ', shape="box", style="filled,rounded,bold", color="' +
                color +
                '", fillcolor="white", labelfontcolor="white", type="' +
                node.type +
                '"];\n';
        }
        return dot;
    }
    getLabel(title, text, settings) {
        let label = "";
        if (settings.useHtmlLabels) {
            label += '<<FONT FACE="Arial" POINT-SIZE="8"><TABLE BORDER="0" CELLSPACING="0">';
            if (!_.isEmpty(title)) {
                let titleLabel = this.foldAndEscape(title, settings);
                titleLabel = '<TR><TD ALIGN="center"><B>' + titleLabel + "</B></TD></TR>";
                label += titleLabel;
            }
            if (!_.isEmpty(text)) {
                let textLabel = this.foldAndEscape(text, settings);
                textLabel = '<TR><TD ALIGN="center">' + textLabel + "</TD></TR>";
                label += textLabel;
            }
            label += "</TABLE></FONT>>";
        } else {
            label = '"' + this.escapeQuotesForDot(title) + '"';
        }
        return label;
    }
    foldAndEscape(str, settings) {
        let strArray = this.fold(str, settings.lineLength, true);
        for (let i = 0; i < strArray.length; i++) {
            strArray[i] = this.escapeForHtml(strArray[i]);
        }
        return strArray.join("<br/>");
    }
    escapeForHtml(s) {
        return s.replace(/[^0-9A-Za-z ]/g, function(c) {
            return "&#" + c.charCodeAt(0) + ";";
        });
    }
    escapeQuotesForDot(str) {
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

    fold(s, n, useSpaces, a) {
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
}
module.exports = {
    DotExport: DotExport
};
