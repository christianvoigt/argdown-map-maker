'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DotExport = function () {
  _createClass(DotExport, [{
    key: 'config',
    set: function set(config) {
      this.settings = _.defaults(config || {}, {
        useHtmlLabels: true,
        graphname: 'Argument Map',
        lineLength: 25,
        groupColors: ["#DADADA", "#BABABA", "#AAAAAA"],
        rankDir: 'TB',
        argumentLabelMode: 'hide-untitled', //hide-untitled | title | description
        statementLabelMode: 'hide-untitled' });
    }
  }]);

  function DotExport(config) {
    _classCallCheck(this, DotExport);

    this.name = "DotExport";
    this.config = config;
  }

  _createClass(DotExport, [{
    key: 'run',
    value: function run(data) {
      this.groupCount = 0;
      var dot = "digraph \"" + this.settings.graphname + "\" {\n\n";
      if (this.settings.rankDir) {
        dot += "rankDir = " + this.settings.rankDir + ";\n";
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data.map.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var node = _step.value;

          dot += this.exportNodesRecursive(node, data);
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

      dot += "\n\n";

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data.map.edges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var edge = _step2.value;

          var color = "green";
          if (edge.type == "attack") {
            color = "red";
          }
          var attributes = "color=\"" + color + "\", type=\"" + edge.type + "\"";
          dot += "  " + edge.from.id + " -> " + edge.to.id + " [" + attributes + "];\n";
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

      dot += "\n}";

      data.dot = dot;
      return data;
    }
  }, {
    key: 'exportNodesRecursive',
    value: function exportNodesRecursive(node, data) {
      var dot = "";
      var element = void 0;
      if (node.type == "statement") {
        element = data.statements[node.title];
      } else if (node.type == "argument") {
        element = data.arguments[node.title];
      } else if (node.type == "group") {
        this.groupCount++;
        var dotGroupId = "cluster_" + this.groupCount;
        var groupLabel = node.title;
        if (this.settings.useHtmlLabels) {
          groupLabel = this.foldAndEscape(groupLabel);
          groupLabel = "<<FONT FACE=\"Arial\" POINT-SIZE=\"10\">" + groupLabel + "</FONT>>";
        } else {
          groupLabel = "\"" + this.escapeQuotesForDot(groupLabel) + "\"";
        }
        var groupColor = "#CCCCCC";
        if (this.settings.groupColors && this.settings.groupColors.length > 0) {
          if (this.settings.groupColors.length >= node.level) {
            groupColor = this.settings.groupColors[node.level];
          } else {
            groupColor = this.settings.groupColors[this.settings.groupColors.length - 1];
          }
        }

        dot += "\nsubgraph " + dotGroupId + " {\n";
        dot += "  label = " + groupLabel + ";\n";
        dot += "  color = \"" + groupColor + "\";\n";
        dot += "  style = filled;\n\n";

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = node.nodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var child = _step3.value;

            dot += this.exportNodesRecursive(child, data);
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

        dot += "\n}\n\n";
        return dot;
      }

      var title = node.title;
      var text = null;
      var label = "";
      if (node.type == "argument") {
        var lastDescription = _.last(element.descriptions);
        if (lastDescription) {
          text = lastDescription.text;
        }
        if (this.settings.argumentLabelMode == 'hide-untitled') {
          label = this.getLabel(title, text);
        } else if (this.settings.argumentLabelMode == 'title') {
          label = this.getLabel(title, null);
        } else {
          label = this.getLabel(null, text);
        }
        dot += "  " + node.id + " [label=" + label + ", shape=\"box\", style=\"filled,rounded\", fillcolor=\"#63AEF2\",  type=\"" + node.type + "\"];\n";
      } else if (node.type == "statement") {
        var lastMember = _.last(element.members);
        if (lastMember) {
          text = lastMember.text;
        }
        if (this.settings.statementLabelMode == 'hide-untitled') {
          label = this.getLabel(title, text);
        } else if (this.settings.statementLabelMode == 'title') {
          label = this.getLabel(title, null);
        } else {
          label = this.getLabel(null, text);
        }
        dot += "  " + node.id + " [label=" + label + ", shape=\"box\", style=\"filled,rounded,bold\", color=\"#63AEF2\", fillcolor=\"white\", labelfontcolor=\"white\", type=\"" + node.type + "\"];\n";
      }
      return dot;
    }
  }, {
    key: 'getLabel',
    value: function getLabel(title, text) {
      var label = "";
      if (this.settings.useHtmlLabels) {
        label += "<<FONT FACE=\"Arial\" POINT-SIZE=\"8\"><TABLE BORDER=\"0\" CELLSPACING=\"0\">";
        if (!_.isEmpty(title) && !title.startsWith("Untitled")) {
          var titleLabel = this.foldAndEscape(title);
          titleLabel = "<TR><TD ALIGN=\"center\"><B>" + titleLabel + "</B></TD></TR>";
          label += titleLabel;
        }
        if (!_.isEmpty(text)) {
          var textLabel = this.foldAndEscape(text);
          textLabel = "<TR><TD ALIGN=\"center\">" + textLabel + "</TD></TR>";
          label += textLabel;
        }
        label += "</TABLE></FONT>>";
      } else {
        label = "\"" + this.escapeQuotesForDot(title) + "\"";
      }
      return label;
    }
  }, {
    key: 'foldAndEscape',
    value: function foldAndEscape(str) {
      var strArray = this.fold(str, this.settings.lineLength, true);
      for (var i = 0; i < strArray.length; i++) {
        strArray[i] = this.escapeForHtml(strArray[i]);
      }
      return strArray.join('<br/>');
    }
  }, {
    key: 'escapeForHtml',
    value: function escapeForHtml(s) {
      return s.replace(/[^0-9A-Za-z ]/g, function (c) {
        return "&#" + c.charCodeAt(0) + ";";
      });
    }
  }, {
    key: 'escapeQuotesForDot',
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
    key: 'fold',
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