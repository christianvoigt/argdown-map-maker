'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//import {EquivalenceClass} from 'argdown-parser';
var builder = require('xmlbuilder');
var Chance = require('chance');
var chance = new Chance();

var ArgMLExport = function () {
  _createClass(ArgMLExport, [{
    key: 'config',
    set: function set(config) {
      var previousSettings = this.settings;
      if (!previousSettings) {
        previousSettings = {
          convertToString: true
        };
      }
      this.settings = _.defaultsDeep({}, config, previousSettings);
    }
  }]);

  function ArgMLExport(config) {
    _classCallCheck(this, ArgMLExport);

    this.name = "ArgMLExport";
    this.config = config;
  }

  _createClass(ArgMLExport, [{
    key: 'run',
    value: function run(data) {
      if (data.config) {
        if (data.config.argml) {
          this.config = data.config.argml;
        } else if (data.config.ArgMLExport) {
          this.config = data.config.ArgMLExport;
        }
      }
      if (!data.map || !data.statements || !data.arguments) {
        return data;
      }

      var argml = builder.create('graphml', { version: '1.0',
        encoding: 'UTF-8',
        standalone: true }).a('xmlns', 'http://graphml.graphdrawing.org/xmlns').a('xmlns:arg', 'xmlns:arg="http://www.argunet.org/xml/argml').a('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance').a('xmlns:y', 'http://www.yworks.com/xml/graphml').a('xsi:schemaLocation', 'http://www.argunet.org/xml/argml argunetxml.xsd http://graphml.graphdrawing.org/xmlns http://www.yworks.com/xml/schema/graphml/1.1/ygraphml.xsd');

      argml.e('key', {
        'attr.name': 'arg.debate',
        'id': 'd0'
      });
      argml.e('key', {
        'for': 'graphml',
        'yfiles.type': 'resources',
        'id': 'd1'
      });
      argml.e('key', {
        'attr.name': 'arg.node',
        'for': 'node',
        'id': 'd2'
      });
      argml.e('key', {
        'for': 'node',
        'yfiles.type': 'nodegraphics',
        'id': 'd3'
      });
      argml.e('key', {
        'attr.name': 'arg.edge',
        'for': 'edge',
        'id': 'd4'
      });
      argml.e('key', {
        'for': 'edge',
        'yfiles.type': 'edgegraphics',
        'id': 'd5'
      });

      var graph = argml.e('graph', {
        'edgedefault': 'directed',
        'id': 'G'
      });

      var statementArgMLIds = {};
      var argumentArgMLIds = {};
      var nodesByTitle = {};
      //first we create argmlIds for every node and statement
      //we could do this on the fly, but this way its cleaner
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data.map.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var node = _step.value;

          nodesByTitle[node.title] = node;
          if (node.type == "statement") {
            node.argmlId = statementArgMLIds[node.title];
            if (!node.argmlId) {
              node.argmlId = this.getId();
              statementArgMLIds[node.title] = node.argmlId;
            }
          } else if (node.type == "argument") {
            node.argmlId = argumentArgMLIds[node.title];
            if (!node.argmlId) {
              node.argmlId = this.getId();
              argumentArgMLIds[node.title] = node.argmlId;
            }

            var argument = data.arguments[node.title];
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
              for (var _iterator4 = argument.pcs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var statement = _step4.value;

                var argmlId = statementArgMLIds[statement.title];
                if (!argmlId) {
                  argmlId = this.getId();
                  statementArgMLIds[statement.title] = argmlId;
                }
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

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data.map.nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _node = _step2.value;

          var nodeEl = graph.e('node', { id: _node.id });
          var argDataEl = nodeEl.e('data', { 'key': 'd2' });

          if (_node.type == "statement") {
            var _statement = data.statements[_node.title];
            var thesisEl = argDataEl.e('arg:thesis', { 'id': _node.argmlId, 'colorIndex': '0' }).e('arg:title', null, _statement.label).up();
            var lastMember = _.last(_statement.members);
            thesisEl.e('arg:content', null, lastMember.text);
            var shapeNode = nodeEl.e('data', { 'key': 'd3' }).e('y:shapeNode');
            shapeNode.e('y:Geometry', {
              'width': '135.0',
              'x': '0',
              'y': '0'
            });
            shapeNode.e('y:Fill', {
              'color': '#FFFFFF',
              'transparent': 'false'
            });
            shapeNode.e('y:BorderStyle', {
              'color': '#63AEF2',
              'type': 'line',
              'width': '3.0'
            });
            shapeNode.e('y:NodeLabel', {
              'alignment': 'center',
              'autoSizePolicy': 'node_width',
              'configuration': 'CroppingLabel',
              'fontFamily': 'Dialog',
              'fontSize': '12',
              'fontStyle': 'plain',
              'hasBackgroundColor': 'false',
              'hasLineColor': 'false',
              'height': '0.0',
              'modelName': 'internal',
              'modelPosition': 'c',
              'textColor': '#000000',
              'visible': 'true',
              'width': '135.0',
              x: '0.0'
            });
            shapeNode.e('y:NodeLabel', {
              'alignment': 'center',
              'autoSizePolicy': 'content',
              'fontFamily': 'Arial',
              'fontSize': '13',
              'fontStyle': 'bold',
              'hasBackgroundColor': 'false',
              'hasLineColor': 'false',
              'modelName': 'internal',
              'modelPosition': 't',
              'textColor': '#000000',
              'visible': 'true',
              'width': '118.0',
              'x': '8.5'
            }, _node.title);

            shapeNode.e('y:NodeLabel', {
              'alignment': 'center',
              'autoSizePolicy': 'content',
              'fontFamily': 'Arial',
              'fontSize': '13',
              'fontStyle': 'plain',
              'hasBackgroundColor': 'false',
              'hasLineColor': 'false',
              'modelName': 'internal',
              'modelPosition': 'b',
              'textColor': '#000000',
              'visible': 'true',
              'width': '128.0',
              'x': '3.5'
            }, lastMember.text);
            shapeNode.e('y:Shape', { 'type': 'roundrectangle' });
          } else if (_node.type == "argument") {
            var _argument = data.arguments[_node.title];
            var lastDescriptionStatement = _.last(_argument.descriptions.members);
            var description = lastDescriptionStatement ? lastDescriptionStatement.text : "";
            var argEl = argDataEl.e('arg:argument', {
              'id': _node.argmlId,
              'colorIndex': '0'
            }).e('arg:title', null, _argument.title).up();
            argEl.e('arg:description', null, description);
            for (var i = 0; i < _argument.pcs.length; i++) {
              var _statement2 = _argument.pcs[i];
              var equivalenceClass = data.statements[_statement2.title];
              var _lastMember = _.last(equivalenceClass.members);
              var propositionType = 'premise';
              var _argmlId = statementArgMLIds[_statement2.title];

              if (_statement2.role == 'conclusion') {
                if (i == _argument.pcs.length - 1) {
                  propositionType = 'conclusion';
                } else {
                  propositionType = 'preliminaryConclusion';
                }
              }
              argEl.e('arg:proposition', {
                'id': _argmlId,
                'type': propositionType
              }).e('arg:content', null, _lastMember.text);
              //let equivalenceClass = data.statements[statement.title];

              //Hopefully the out-commented code will not be necessary in the future as ArgML will be cleaned up
              //Until then, not all semantic relations will be exported. In most cases, this is not a problem.
              // //In ArgML all semantic relations that are possibly not represented by edges, are saved in arg:proposition objects as arg:supportReference and arg:attackReference
              // //These are:
              // //1) Outgoing relations of premises and preliminiary conclusions
              // //2) Incoming relations of conclusions
              // for(let relation of equivalenceClass.relations){
              //   //1) save outgoing relations of premises and preliminiary conclusions
              //   if((propositionType == "premise" ||propositionType == "preliminaryConclusion") && relation.from == equivalenceClass){
              //     let referenceAttributes = {};
              //
              //     if(relation.from instanceof EquivalenceClass){
              //       let sourceArgmlId = statementArgMLIds[relation.from.title];
              //       referenceAttributes.refersToProposition = sourceArgmlId;
              //     }
              //     let sourceNode = nodesByTitle[relation.from.title];
              //     if(sourceNode){
              //       referenceAttributes.refersToNode = sourceNode.id;
              //       referenceAttributes.refersToArgunetNode = sourceNode.argmlId;
              //     }
              //
              //     if(relation.type == "attack"){
              //       propEl.e('arg:supportReference',referenceAttributes);
              //     }else if(relation.type == "support"){
              //       propEl.e('arg:attackReference',referenceAttributes);
              //     }else if(relation.type == "contradiction"){
              //       propEl.e('arg:contradictionReference',referenceAttributes);
              //     }
              //
              //   //2) save incoming relations of conclusions
              //   }else if(statement.role == "conclusion" && relation.to == equivalenceClass){
              //     let referenceAttributes = {};
              //
              //     if(relation.to instanceof EquivalenceClass){
              //       let targetArgmlId = statementArgMLIds[relation.to.title];
              //       referenceAttributes.refersToProposition = targetArgmlId;
              //     }
              //     let targetNode = nodesByTitle[relation.to.title];
              //     if(targetNode){
              //       referenceAttributes.refersToNode = targetNode.id;
              //       referenceAttributes.refersToArgunetNode = targetNode.argmlId;
              //     }
              //
              //     if(relation.type == "attack"){
              //       propEl.e('arg:supportReference',referenceAttributes);
              //     }else if(relation.type == "support"){
              //       propEl.e('arg:attackReference',referenceAttributes);
              //     }else if(relation.type == "contradiction"){
              //       propEl.e('arg:contradictionReference',referenceAttributes);
              //     }
              //
              //   }
              // }
            }
            var _shapeNode = nodeEl.e('data', { 'key': 'd3' }).e('y:shapeNode');
            _shapeNode.e('y:Geometry', {
              'width': '135',
              'x': '0',
              'y': '0'
            });
            _shapeNode.e('y:Fill', {
              'color': '#63AEF2',
              'color2': '#82BEF5',
              'transparent': 'false'
            });
            _shapeNode.e('y:BorderStyle', {
              'color': '#000000',
              'type': 'line',
              'width': '1.0'
            });
            _shapeNode.e('y:NodeLabel', {
              'alignment': 'center',
              'autoSizePolicy': 'node_width',
              'configuration': 'CroppingLabel',
              'fontFamily': 'Dialog',
              'fontSize': '12',
              'fontStyle': 'plain',
              'hasBackgroundColor': 'false',
              'hasLineColor': 'false',
              'height': '0.0',
              'modelName': 'internal',
              'modelPosition': 'c',
              'textColor': '#000000',
              'visible': 'true',
              'width': '135.0',
              'x': '0.0'
            });
            _shapeNode.e('y:NodeLabel', {
              'alignment': 'center',
              'autoSizePolicy': 'content',
              'fontFamily': 'Arial',
              'fontSize': '13',
              'fontStyle': 'bold',
              'hasBackgroundColor': 'false',
              'hasLineColor': 'false',
              'modelName': 'internal',
              'modelPosition': 't',
              'textColor': '#000000',
              'visible': 'true',
              'width': '88.0',
              x: '23.5'
            }, _node.title);

            _shapeNode.e('y:NodeLabel', {
              'alignment': 'center',
              'autoSizePolicy': 'content',
              'fontFamily': 'Arial',
              'fontSize': '13',
              'fontStyle': 'plain',
              'hasBackgroundColor': 'false',
              'hasLineColor': 'false',
              'modelName': 'internal',
              'modelPosition': 'b',
              'textColor': '#000000',
              'visible': 'true',
              'width': '131.0',
              'x': '2.0'
            }, description);
            _shapeNode.e('y:Shape', { 'type': 'roundrectangle' });
          }
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

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data.map.edges[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var edge = _step3.value;

          var edgeEl = graph.e('edge', { id: edge.id, source: edge.from.id, target: edge.to.id });
          var edgeType = void 0;
          var edgeColor = '#00FF00';
          if (edge.type == 'attack') {
            edgeColor = '#FF0000';
            if (edge.status == "sketched") {
              edgeType = "sketchedAttack";
            } else {
              edgeType = "attack";
            }
          } else if (edge.type == "support") {
            if (edge.status == "sketched") {
              edgeType = "sketchedSupport";
            } else {
              edgeType = "support";
            }
          }
          var argEdgeAttributes = {
            'sourceNodeId': edge.from.argmlId,
            'targetNodeId': edge.to.argmlId,
            'type': edgeType
          };
          if (edge.fromStatement) {
            argEdgeAttributes.sourcePropositionId = statementArgMLIds[edge.fromStatement.title];
          }
          if (edge.toStatement) {
            argEdgeAttributes.targetPropositionId = statementArgMLIds[edge.toStatement.title];
          }
          edgeEl.e('data', { 'key': 'd4' }).e('arg:edge', argEdgeAttributes);

          var polyLineEdge = edgeEl.e('data', { 'key': 'd5' }).e('y:PolyLineEdge');
          polyLineEdge.e('y:LineStyle', {
            'color': edgeColor,
            'type': 'line',
            'width': '2.0'
          });
          polyLineEdge.e('y:Path', {
            'sx': '0',
            'sy': '0',
            'tx': '0',
            'ty': '0'
          }).e('y:Point', { 'x': '0', 'y': '0' }).up().e('y:Point', { 'x': '0', 'y': '0' });
          polyLineEdge.e('y:Arrows', {
            'source': 'none',
            'target': 'standard'
          });
          polyLineEdge.e('y:BendStyle', {
            'smoothed': 'false'
          });
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

      if (this.settings.convertToString) {
        data.argml = argml.end({
          pretty: true,
          indent: '  ',
          newline: '\n',
          allowEmpty: false
        });
      } else {
        data.argml = argml;
      }
      return data;
    }
  }, {
    key: 'getId',
    value: function getId() {
      return chance.natural({ min: 0, max: 9223372036854775807 }); //positive long value
    }
  }]);

  return ArgMLExport;
}();

module.exports = {
  ArgMLExport: ArgMLExport
};
//# sourceMappingURL=ArgMLExport.js.map