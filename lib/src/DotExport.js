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
        onlyTitlesInHtmlLabels: false,
        graphname: 'Argument Map',
        lineLength: 25
      });
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
      var dot = "digraph \"" + this.settings.graphname + "\" {\n\n";

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data.map.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var node = _step.value;

          var element = void 0;
          if (node.type == "statement") {
            element = data.statements[node.title];
          } else {
            element = data.arguments[node.title];
          }
          var label = "";
          if (this.settings.useHtmlLabels) {
            label = this.escapeForHtml(node.title);
            var labelArray = this.fold(label, this.settings.lineLength, true);
            label = labelArray.join('<br/>');
            label = "<<FONT FACE=\"Arial\" POINT-SIZE=\"8\"><TABLE BORDER=\"0\" CELLSPACING=\"0\"><TR><TD ALIGN=\"center\"><B>" + label + "</B></TD></TR>";
            if (!this.settings.onlyTitlesInHtmlLabels) {
              var lastMember = void 0;
              if (node.type == "statement") {
                lastMember = _.last(element.members);
              } else {
                lastMember = _.last(element.descriptions);
              }
              if (lastMember) {
                var content = lastMember.text;
                if (content) {
                  content = this.escapeForHtml(content);
                  var contentArray = this.fold(content, this.settings.lineLength, true);
                  content = contentArray.join('<br/>');
                  label += "<TR><TD ALIGN=\"center\">" + content + "</TD></TR>";
                }
              }
            }
            label += "</TABLE></FONT>>";
          } else {
            label = "\"" + this.escapeQuotesForDot(node.title) + "\"";
          }
          if (node.type == "statement") {
            dot += "  " + node.id + " [label=" + label + ", shape=\"box\", style=\"filled,rounded,bold\", color=\"#63AEF2\", fillcolor=\"white\", labelfontcolor=\"white\", type=\"" + node.type + "\"];\n";
          } else {
            dot += "  " + node.id + " [label=" + label + ", shape=\"box\", style=\"filled,rounded\", fillcolor=\"#63AEF2\",  type=\"" + node.type + "\"];\n";
          }
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