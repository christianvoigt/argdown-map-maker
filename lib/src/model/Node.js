"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Node = function () {
  function Node(nodeType, title, id) {
    _classCallCheck(this, Node);

    this.type = nodeType;
    this.title = title;
    this.id = id;
  }

  _createClass(Node, [{
    key: "toJSON",
    value: function toJSON() {
      var node = {
        id: this.id,
        title: this.title,
        type: this.type,
        labelTitle: this.labelTitle,
        labelText: this.labelText
      };
      return node;
    }
  }]);

  return Node;
}();

module.exports = {
  Node: Node
};
//# sourceMappingURL=Node.js.map