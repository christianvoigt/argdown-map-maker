'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _argdownParser = require('argdown-parser');

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapMaker = function () {
  function MapMaker(config) {
    _classCallCheck(this, MapMaker);

    this.name = "MapMaker";
    this.config = config;
  }

  _createClass(MapMaker, [{
    key: 'run',
    value: function run(data) {
      data.map = this.makeMap(data);
      return data;
    }
  }, {
    key: 'makeMap',
    value: function makeMap(data) {
      var map = { nodes: [], edges: [] };
      var nodeCount = 0; //used for generating node ids
      var edgeCount = 0; //used for generating edge ids
      var statementNodes = {}; //a dictionary of statement nodes. The key is the statement's title
      var argumentNodes = {}; //a dictionary of argument nodes. The key is the argument's title
      var relationsForMap = []; //the relations that have to be visualized by edges between nodes in the map (each relation can be represented by more than one edge)

      var untitledTest = /^Untitled/;

      //1) find all statement classes that should be inserted as nodes
      //2) Add all outgoing relations of each of these statements to the relations to be represented with edges
      var statementKeys = Object.keys(data.statements);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = statementKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var statementKey = _step.value;

          var equivalenceClass = data.statements[statementKey];
          var selectionTest = true;

          var isConnected = equivalenceClass.relations.length > 0 || equivalenceClass.isUsedAsPremise || equivalenceClass.isUsedAsConclusion;
          var notUsedInArgumentButWithRelations = equivalenceClass.relations.length > 0 && !equivalenceClass.isUsedAsPremise && !equivalenceClass.isUsedAsConclusion;

          if (this.settings.statementSelectionMode == "all") {
            selectionTest = true;
          }if (this.settings.statementSelectionMode == "titled") {
            selectionTest = notUsedInArgumentButWithRelations || !untitledTest.exec(equivalenceClass.title);
          } else if (this.settings.statementSelectionMode == "roots") {
            selectionTest = notUsedInArgumentButWithRelations || equivalenceClass.isUsedAsRootOfStatementTree;
          } else if (this.settings.statementSelectionMode == "statement-trees") {
            selectionTest = equivalenceClass.isUsedAsRootOfStatementTree || equivalenceClass.isUsedAsChildOfStatementTree;
          } else if (this.settings.statementSelectionMode == "with-relations") {
            selectionTest = equivalenceClass.relations.length > 0;
          }
          if ((!this.settings.excludeDisconnected || isConnected) && selectionTest) {
            var id = "n" + nodeCount;
            nodeCount++;
            var node = { type: "statement", title: statementKey, id: id };
            statementNodes[statementKey] = node;
            map.nodes.push(node);

            //add all outgoing relations of each statement node
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
              for (var _iterator5 = equivalenceClass.relations[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var relation = _step5.value;

                if (relation.from == equivalenceClass) {
                  relationsForMap.push(relation);
                }
              }
            } catch (err) {
              _didIteratorError5 = true;
              _iteratorError5 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                  _iterator5.return();
                }
              } finally {
                if (_didIteratorError5) {
                  throw _iteratorError5;
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

      var argumentKeys = Object.keys(data.arguments);
      var statementRoles = {}; //a dictionary mapping statement titles to {premiseIn:[nodeId], conclusionIn:[nodeId]} objects

      //1) add all (connected) arguments as argument nodes
      //2) add all outgoing relations of each argument to relationsForMap
      //3) add all outgoing relations of each main conclusion to relationsForMap, if the conclusion is not represented by a statement node.
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = argumentKeys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var argumentKey = _step2.value;

          var hasRelations = false;
          var argument = data.arguments[argumentKey];
          var _id = "n" + nodeCount;
          nodeCount++;
          var _node = { type: "argument", title: argument.title, id: _id };

          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = argument.relations[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var _relation = _step6.value;

              hasRelations = true;
              //add all outgoing relations from each argument node
              if (_relation.from == argument) {
                relationsForMap.push(_relation);
              }
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }

          var _iteratorNormalCompletion7 = true;
          var _didIteratorError7 = false;
          var _iteratorError7 = undefined;

          try {
            for (var _iterator7 = argument.pcs[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
              var statement = _step7.value;

              var roles = statementRoles[statement.title];
              var _equivalenceClass = data.statements[statement.title];
              if (!roles) {
                roles = { premiseIn: [], conclusionIn: [] };
                statementRoles[statement.title] = roles;
              }
              if (statement.role == "premise") {
                roles.premiseIn.push(_node);
                var _iteratorNormalCompletion8 = true;
                var _didIteratorError8 = false;
                var _iteratorError8 = undefined;

                try {
                  for (var _iterator8 = _equivalenceClass.relations[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var _relation2 = _step8.value;

                    if (_relation2.to == _equivalenceClass) {
                      hasRelations = true;
                      break;
                    }
                  }
                } catch (err) {
                  _didIteratorError8 = true;
                  _iteratorError8 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion8 && _iterator8.return) {
                      _iterator8.return();
                    }
                  } finally {
                    if (_didIteratorError8) {
                      throw _iteratorError8;
                    }
                  }
                }
              } else if (statement.role == "conclusion" && statement == argument.pcs[argument.pcs.length - 1]) {
                roles.conclusionIn.push(_node);

                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                  for (var _iterator9 = _equivalenceClass.relations[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var _relation3 = _step9.value;

                    if (_relation3.from == _equivalenceClass) {
                      hasRelations = true;
                      //add all outgoing relations of the argument's main conclusion, if the conclusion has not been inserted as a statement node
                      //if the conclusion has been inserted as a statement node, the outgoing relations have already been added
                      if (!statementNodes[statement.title]) {
                        relationsForMap.push(_relation3);
                      }
                    }
                  }
                } catch (err) {
                  _didIteratorError9 = true;
                  _iteratorError9 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion9 && _iterator9.return) {
                      _iterator9.return();
                    }
                  } finally {
                    if (_didIteratorError9) {
                      throw _iteratorError9;
                    }
                  }
                }
              }
            }
            //add argument node
          } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion7 && _iterator7.return) {
                _iterator7.return();
              }
            } finally {
              if (_didIteratorError7) {
                throw _iteratorError7;
              }
            }
          }

          if (!this.settings.excludeDisconnected || hasRelations) {
            argumentNodes[argumentKey] = _node;
            map.nodes.push(_node);
          }
        }

        //Create edges representing the selected relations
        //One relation can be represented by multiple edges in the graph, as the same sentence (the same equivalence class) can be used in several arguments as premise or conclusion.
        //If a source/target of a relation is a statementNode, all edges, representing the relation, have to start/end at the statementNode.
        //In the next step, "implicit" support edges are added that represent the equivalence relations between statements.
        //These will connect the different occurrences of a statement (or more precisely an "equivalence class" of statements) within the graph.
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
        for (var _iterator3 = relationsForMap[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _relation4 = _step3.value;

          var froms = []; //a list of source nodes for the edges representing the relation in the graph
          var tos = []; //a list of target nodes for the edges representing the relation in the graph

          var fromNode = void 0;
          var fromStatement = void 0;

          if (_relation4.from instanceof _argdownParser.Argument) {
            fromNode = argumentNodes[_relation4.from.title];
          } else {
            fromNode = statementNodes[_relation4.from.title];
            fromStatement = data.statements[_relation4.from.title];
          }

          if (!fromNode) {
            //no node representing the source, so look for all arguments that use the source as conclusion
            var _roles = statementRoles[_relation4.from.title];
            fromStatement = data.statements[_relation4.from.title];
            if (_roles) {
              froms = _roles.conclusionIn;
            }
          } else {
            //push either the argument node or the statement node to the sources list
            froms.push(fromNode);
          }

          var toNode = void 0;
          var toStatement = void 0;

          if (_relation4.to instanceof _argdownParser.Argument) {
            toNode = argumentNodes[_relation4.to.title];
          } else {
            toNode = statementNodes[_relation4.to.title];
            toStatement = data.statements[_relation4.to.title];
          }

          if (!toNode) {
            //no node representing the target, so look for all arguments that use the target as premise
            var _roles2 = statementRoles[_relation4.to.title];
            toStatement = data.statements[_relation4.to.title];
            if (_roles2) {
              tos = _roles2.premiseIn;
            }
          } else {
            //push either the argument node or the statement node to the targets list
            tos.push(toNode);
          }

          //special case: both statements of a contradiction are represented as statement nodes
          //in this case there have to be two attack relations going both ways
          //we have to add the "reverse direction" edge here
          if (_relation4.type == "contradiction" && fromNode && toNode) {
            var edgeId = 'e' + edgeCount;
            edgeCount++;
            map.edges.push({
              id: edgeId,
              from: toNode, //node
              to: fromNode, //node
              fromStatement: toStatement, //statement
              toStatement: fromStatement, //statement
              type: "attack",
              status: "reconstructed"
            });
          }

          //now add an edge from each source to each target
          var edgeType = _relation4.type;
          if (edgeType == "contradiction") {
            edgeType = "attack";
          }
          var _iteratorNormalCompletion10 = true;
          var _didIteratorError10 = false;
          var _iteratorError10 = undefined;

          try {
            for (var _iterator10 = froms[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
              var from = _step10.value;
              var _iteratorNormalCompletion11 = true;
              var _didIteratorError11 = false;
              var _iteratorError11 = undefined;

              try {
                for (var _iterator11 = tos[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                  var to = _step11.value;

                  var _edgeId = 'e' + edgeCount;
                  edgeCount++;
                  map.edges.push({
                    id: _edgeId,
                    from: from, //node
                    to: to, //node
                    fromStatement: fromStatement, //statement
                    toStatement: toStatement, //statement
                    type: edgeType,
                    status: _relation4.status
                  });
                }
              } catch (err) {
                _didIteratorError11 = true;
                _iteratorError11 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion11 && _iterator11.return) {
                    _iterator11.return();
                  }
                } finally {
                  if (_didIteratorError11) {
                    throw _iteratorError11;
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError10 = true;
            _iteratorError10 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion10 && _iterator10.return) {
                _iterator10.return();
              }
            } finally {
              if (_didIteratorError10) {
                throw _iteratorError10;
              }
            }
          }
        }

        //Add support edges to represent equivalence relations between sentences or sentence occurrences
        //1) From all argument nodes that use p as main conclusion to statement node p
        //2) From statement node p to all arguments that use p as premise
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

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = map.nodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var _node2 = _step4.value;

          if (_node2.type == "statement") {
            var _roles3 = statementRoles[_node2.title];
            var _statement = data.statements[_node2.title];
            if (_roles3) {
              //1) add conclusion +> statementNode edges
              var _iteratorNormalCompletion12 = true;
              var _didIteratorError12 = false;
              var _iteratorError12 = undefined;

              try {
                for (var _iterator12 = _roles3.conclusionIn[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                  var argumentNode = _step12.value;

                  var _edgeId2 = 'e' + edgeCount;
                  edgeCount++;
                  map.edges.push({
                    id: _edgeId2,
                    from: argumentNode, //node
                    to: _node2, //node
                    fromStatement: _statement, //statement
                    toStatement: _statement, //statement
                    type: "support",
                    status: "reconstructed"
                  });
                }

                //2) add statementNode +> premise edges
              } catch (err) {
                _didIteratorError12 = true;
                _iteratorError12 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion12 && _iterator12.return) {
                    _iterator12.return();
                  }
                } finally {
                  if (_didIteratorError12) {
                    throw _iteratorError12;
                  }
                }
              }

              var _iteratorNormalCompletion13 = true;
              var _didIteratorError13 = false;
              var _iteratorError13 = undefined;

              try {
                for (var _iterator13 = _roles3.premiseIn[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                  var _argumentNode = _step13.value;

                  var _edgeId3 = 'e' + edgeCount;
                  edgeCount++;
                  map.edges.push({
                    id: _edgeId3,
                    from: _node2, //node
                    to: _argumentNode, //node
                    fromStatement: _statement, //statement
                    toStatement: _statement, //statement
                    type: "support",
                    status: "reconstructed"
                  });
                }
              } catch (err) {
                _didIteratorError13 = true;
                _iteratorError13 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion13 && _iterator13.return) {
                    _iterator13.return();
                  }
                } finally {
                  if (_didIteratorError13) {
                    throw _iteratorError13;
                  }
                }
              }
            }
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

      return map;
    }
  }, {
    key: 'config',
    set: function set(config) {
      this.settings = _.defaults(config || {}, {
        statementSelectionMode: "roots", //options: all | titled | roots | statement-trees | with-relations
        excludeDisconnected: true
      });
    }
  }]);

  return MapMaker;
}();

module.exports = {
  MapMaker: MapMaker
};
//# sourceMappingURL=MapMaker.js.map