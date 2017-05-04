"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Edge = function () {
  function Edge(_ref) {
    var _ref$id = _ref.id,
        id = _ref$id === undefined ? null : _ref$id,
        _ref$from = _ref.from,
        from = _ref$from === undefined ? null : _ref$from,
        _ref$to = _ref.to,
        to = _ref$to === undefined ? null : _ref$to,
        _ref$fromStatement = _ref.fromStatement,
        fromStatement = _ref$fromStatement === undefined ? null : _ref$fromStatement,
        _ref$toStatement = _ref.toStatement,
        toStatement = _ref$toStatement === undefined ? null : _ref$toStatement,
        _ref$type = _ref.type,
        type = _ref$type === undefined ? null : _ref$type,
        _ref$status = _ref.status,
        status = _ref$status === undefined ? null : _ref$status;

    _classCallCheck(this, Edge);

    this.id = id;
    this.from = from;
    this.to = to;
    this.fromStatement = fromStatement;
    this.toStatement = toStatement;
    this.type = type;
    this.status = status;
  }

  _createClass(Edge, [{
    key: "toJSON",
    value: function toJSON() {
      var edge = {
        id: this.id,
        type: this.type,
        status: this.status
      };
      if (this.from) {
        edge.from = this.from.id;
      }
      if (this.to) {
        edge.to = this.to.id;
      }
      if (this.fromStatement) {
        edge.fromStatement = this.fromStatement.title;
      }
      if (this.toStatement) {
        edge.toStatement = this.toStatement.title;
      }
      return edge;
    }
  }]);

  return Edge;
}();

module.exports = {
  Edge: Edge
};
//# sourceMappingURL=Edge.js.map