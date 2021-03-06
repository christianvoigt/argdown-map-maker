"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _argdownParser = require("argdown-parser");

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _Node = require("./model/Node.js");

var _Edge = require("./model/Edge.js");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapMaker = function () {
    function MapMaker(config) {
        _classCallCheck(this, MapMaker);

        this.name = "MapMaker";
        this.defaults = _.defaultsDeep({}, config, {
            statementSelectionMode: "roots", // options: all | titled | roots | statement-trees | with-relations
            argumentLabelMode: "hide-untitled", // hide-untitled | title | description
            statementLabelMode: "hide-untitled", // hide-untitled | title | text
            excludeDisconnected: true,
            groupMode: "heading", //options: heading | tag | none
            groupDepth: 2,
            addTags: true
        });
    }

    _createClass(MapMaker, [{
        key: "getSettings",
        value: function getSettings(request) {
            if (request.map) {
                return request.map;
            } else if (request.MapMaker) {
                return request.MapMaker;
            } else {
                request.map = {};
                return request.map;
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
            response.map = this.makeMap(request, response);
            return response;
        }
    }, {
        key: "makeMap",
        value: function makeMap(request, response) {
            var settings = this.getSettings(request);
            var map = { nodes: [], edges: [] };
            var nodeCount = 0; //used for generating node ids
            var edgeCount = 0; //used for generating edge ids
            var statementNodes = {}; //a dictionary of statement nodes. The key is the statement's title
            var argumentNodes = {}; //a dictionary of argument nodes. The key is the argument's title
            var relationsForMap = []; //the relations that have to be visualized by edges between nodes in the map (each relation can be represented by more than one edge)

            var untitledTest = /^Untitled/;

            //1) find all statement classes that should be inserted as nodes
            //2) Add all outgoing relations of each of these statements to the relations to be represented with edges
            var statementKeys = Object.keys(response.statements);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = statementKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var statementKey = _step.value;

                    var _equivalenceClass = response.statements[statementKey];
                    var selectionTest = true;

                    var isConnected = _equivalenceClass.relations.length > 0 || _equivalenceClass.isUsedAsPremise || _equivalenceClass.isUsedAsConclusion;
                    var notUsedInArgumentButWithRelations = _equivalenceClass.relations.length > 0 && !_equivalenceClass.isUsedAsPremise && !_equivalenceClass.isUsedAsConclusion;

                    if (settings.statementSelectionMode == "all") {
                        selectionTest = true;
                    }
                    if (settings.statementSelectionMode == "titled") {
                        selectionTest = notUsedInArgumentButWithRelations || !untitledTest.exec(_equivalenceClass.title);
                    } else if (settings.statementSelectionMode == "roots") {
                        selectionTest = notUsedInArgumentButWithRelations || _equivalenceClass.isUsedAsRootOfStatementTree;
                    } else if (settings.statementSelectionMode == "statement-trees") {
                        selectionTest = _equivalenceClass.isUsedAsRootOfStatementTree || _equivalenceClass.isUsedAsChildOfStatementTree;
                    } else if (settings.statementSelectionMode == "with-relations") {
                        selectionTest = _equivalenceClass.relations.length > 0;
                    }
                    if ((!settings.excludeDisconnected || isConnected) && selectionTest) {
                        nodeCount++;
                        var _node2 = this.createNode("statement", statementKey, nodeCount);
                        if (settings.statementLabelMode != "title") {
                            var lastMember = _.last(_equivalenceClass.members);
                            if (lastMember) {
                                _node2.labelText = lastMember.text;
                            }
                        }
                        if (settings.statementLabelMode != "text" || _.isEmpty(_node2.labelText)) {
                            if (settings.statementLabelMode == "title" || !statementKey.startsWith("Untitled")) {
                                _node2.labelTitle = statementKey;
                            }
                        }
                        if (settings.addTags && _equivalenceClass.sortedTags) {
                            _node2.tags = _equivalenceClass.sortedTags;
                        }
                        statementNodes[statementKey] = _node2;
                        map.nodes.push(_node2);

                        //add all outgoing relations of each statement node
                        var _iteratorNormalCompletion12 = true;
                        var _didIteratorError12 = false;
                        var _iteratorError12 = undefined;

                        try {
                            for (var _iterator12 = _equivalenceClass.relations[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                                var relation = _step12.value;

                                if (relation.from == _equivalenceClass && relation.type !== "contradictory") {
                                    relationsForMap.push(relation);
                                } else if (relation.type == "contradictory" && !_.includes(relationsForMap, relation)) {
                                    relationsForMap.push(relation);
                                }
                            }
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

            var argumentKeys = Object.keys(response.arguments);
            var statementRoles = {}; //a dictionary mapping statement titles to {premiseIn:[nodeId], conclusionIn:[nodeId]} objects
            var excludedArguments = []; // An array of all argument nodes excluded from the map in the first step
            //1) add all (connected) arguments as argument nodes (except those that are only connected by conclusion-premise equivalence. Those will be added in the next step)
            //2) add all outgoing relations of each argument to relationsForMap
            //3) add all outgoing relations of each main conclusion to relationsForMap, if the conclusion is not represented by a statement node.
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = argumentKeys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var argumentKey = _step2.value;

                    var hasRelations = false;
                    var _argument = response.arguments[argumentKey];
                    nodeCount++;
                    var _node3 = this.createNode("argument", _argument.title, nodeCount);
                    if (settings.argumentLabelMode != "title") {
                        var _lastMember = _.last(_argument.descriptions);
                        if (_lastMember) {
                            _node3.labelText = _lastMember.text;
                        }
                    }
                    if (settings.argumentLabelMode != "description" || _.isEmpty(_node3.labelText)) {
                        if (!_argument.title.startsWith("Untitled") || settings.argumentLabelMode == "title") {
                            _node3.labelTitle = _argument.title;
                        }
                    }
                    if (settings.addTags && _argument.sortedTags) {
                        _node3.tags = _argument.sortedTags;
                    }

                    var _iteratorNormalCompletion13 = true;
                    var _didIteratorError13 = false;
                    var _iteratorError13 = undefined;

                    try {
                        for (var _iterator13 = _argument.relations[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                            var _relation = _step13.value;

                            hasRelations = true;
                            //add all outgoing relations from each argument node
                            if (_relation.from == _argument) {
                                relationsForMap.push(_relation);
                            }
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

                    var _iteratorNormalCompletion14 = true;
                    var _didIteratorError14 = false;
                    var _iteratorError14 = undefined;

                    try {
                        for (var _iterator14 = _argument.pcs[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                            var statement = _step14.value;

                            var roles = statementRoles[statement.title];
                            var _equivalenceClass2 = response.statements[statement.title];
                            if (!roles) {
                                roles = { premiseIn: [], conclusionIn: [] };
                                statementRoles[statement.title] = roles;
                            }
                            if (statementNodes[statement.title]) {
                                //argument node has a support relation to statement node
                                hasRelations = true;
                            }
                            if (statement.role === "premise") {
                                roles.premiseIn.push(_node3);
                                var _iteratorNormalCompletion15 = true;
                                var _didIteratorError15 = false;
                                var _iteratorError15 = undefined;

                                try {
                                    for (var _iterator15 = _equivalenceClass2.relations[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                                        var _relation2 = _step15.value;

                                        if (_relation2.to == _equivalenceClass2 || _relation2.type === "contradictory") {
                                            hasRelations = true;
                                        }
                                    }
                                } catch (err) {
                                    _didIteratorError15 = true;
                                    _iteratorError15 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion15 && _iterator15.return) {
                                            _iterator15.return();
                                        }
                                    } finally {
                                        if (_didIteratorError15) {
                                            throw _iteratorError15;
                                        }
                                    }
                                }
                            } else if (statement.role === "conclusion" && statement == _.last(_argument.pcs)) {
                                roles.conclusionIn.push(_node3);

                                var _iteratorNormalCompletion16 = true;
                                var _didIteratorError16 = false;
                                var _iteratorError16 = undefined;

                                try {
                                    for (var _iterator16 = _equivalenceClass2.relations[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                                        var _relation3 = _step16.value;

                                        if (_relation3.from == _equivalenceClass2) {
                                            hasRelations = true;
                                            //add all outgoing relations of the argument's main conclusion, if the conclusion has not been inserted as a statement node
                                            //if the conclusion has been inserted as a statement node, the outgoing relations have already been added
                                            if (!statementNodes[statement.title] && (!_relation3.type === "contradictory" || !_.includes(relationsForMap, _relation3))) {
                                                relationsForMap.push(_relation3);
                                            }
                                        } else if (_relation3.type === "contradictory" && !_.includes(relationsForMap, _relation3)) {
                                            hasRelations = true;
                                            relationsForMap.push(_relation3);
                                        }
                                    }
                                } catch (err) {
                                    _didIteratorError16 = true;
                                    _iteratorError16 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion16 && _iterator16.return) {
                                            _iterator16.return();
                                        }
                                    } finally {
                                        if (_didIteratorError16) {
                                            throw _iteratorError16;
                                        }
                                    }
                                }
                            }
                        }
                        //add argument node
                    } catch (err) {
                        _didIteratorError14 = true;
                        _iteratorError14 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion14 && _iterator14.return) {
                                _iterator14.return();
                            }
                        } finally {
                            if (_didIteratorError14) {
                                throw _iteratorError14;
                            }
                        }
                    }

                    if (!settings.excludeDisconnected || hasRelations) {
                        argumentNodes[argumentKey] = _node3;
                        map.nodes.push(_node3);
                    } else {
                        excludedArguments.push(_node3);
                    }
                }

                // Add arguments to map that are connected by conclusion-premise equivalence
                // These can only be found by checking
                // 1) for all main conclusions, if there is an equivalent statement used as premise
                // 2) for all premises, if there is an equivalent statement used as main conclusion
                // The latter information is only available after we built a statementRoles dictionary (statement.role only states if the statement is a conclusion, not if it is the main conclusion)
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
                for (var _iterator3 = excludedArguments[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var _node4 = _step3.value;

                    var _argument2 = response.arguments[_node4.title];
                    var mainConclusion = _.last(_argument2.pcs);
                    if (_argument2.pcs) {
                        var _iteratorNormalCompletion17 = true;
                        var _didIteratorError17 = false;
                        var _iteratorError17 = undefined;

                        try {
                            for (var _iterator17 = _argument2.pcs[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                                var _statement = _step17.value;

                                var _roles = statementRoles[_statement.title];
                                if (_statement.role === "premise" && _roles.conclusionIn && Object.keys(_roles.conclusionIn).length > 0) {
                                    argumentNodes[_argument2.title] = _node4;
                                    map.nodes.push(_node4);
                                } else if (_statement.role === "conclusion" && _statement === mainConclusion && _roles.premiseIn && Object.keys(_roles.premiseIn).length > 0) {
                                    argumentNodes[_argument2.title] = _node4;
                                    map.nodes.push(_node4);
                                }
                            }
                        } catch (err) {
                            _didIteratorError17 = true;
                            _iteratorError17 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion17 && _iterator17.return) {
                                    _iterator17.return();
                                }
                            } finally {
                                if (_didIteratorError17) {
                                    throw _iteratorError17;
                                }
                            }
                        }
                    }
                }

                //Create edges representing the selected relations
                //One relation can be represented by multiple edges in the graph, as the same sentence (the same equivalence class) can be used in several arguments as premise or conclusion.
                //If a source/target of a relation is a statementNode, all edges, representing the relation, have to start/end at the statementNode.
                //In the next step, "implicit" support edges are added that represent the equivalence relations between statements.
                //These will connect the different occurrences of a statement (or more precisely the occurrences of an "equivalence class") within the graph.
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
                for (var _iterator4 = relationsForMap[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var _relation4 = _step4.value;

                    var froms = []; //a list of source nodes for the edges representing the relation in the graph
                    var tos = []; //a list of target nodes for the edges representing the relation in the graph

                    var fromNode = void 0;
                    var fromStatement = void 0;

                    if (_relation4.from instanceof _argdownParser.Argument) {
                        fromNode = argumentNodes[_relation4.from.title];
                    } else {
                        fromNode = statementNodes[_relation4.from.title];
                        fromStatement = response.statements[_relation4.from.title];
                    }

                    if (!fromNode) {
                        //no node representing the source, so look for all arguments that use the source as conclusion
                        var _roles2 = statementRoles[_relation4.from.title];
                        fromStatement = response.statements[_relation4.from.title];
                        if (_roles2) {
                            froms.push.apply(froms, _roles2.conclusionIn);
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
                        toStatement = response.statements[_relation4.to.title];
                    }

                    if (!toNode) {
                        //no node representing the target, so look for all arguments that use the target as premise
                        var _roles3 = statementRoles[_relation4.to.title];
                        toStatement = response.statements[_relation4.to.title];
                        if (_roles3) {
                            tos.push.apply(tos, _roles3.premiseIn);
                        }
                    } else {
                        //push either the argument node or the statement node to the targets list
                        tos.push(toNode);
                    }

                    if (_relation4.type == "contradictory") {
                        //special case: both statements of a contradictory are represented as statement nodes
                        //in this case there have to be two attack relations going both ways
                        //we have to add the "reverse direction" edge here
                        if (fromNode && toNode && !(fromNode instanceof _argdownParser.Argument) && !(toNode instanceof _argdownParser.Argument)) {
                            var edgeId = "e" + edgeCount;
                            edgeCount++;
                            var edge = new _Edge.Edge({
                                id: edgeId,
                                from: toNode, //node
                                to: fromNode, //node
                                fromStatement: toStatement, //statement
                                toStatement: fromStatement, //statement
                                type: "attack",
                                status: "reconstructed"
                            });
                            map.edges.push(edge);
                        }
                        var fromRoles = statementRoles[_relation4.from.title];
                        if (fromRoles && fromRoles.premiseIn) {
                            var _iteratorNormalCompletion18 = true;
                            var _didIteratorError18 = false;
                            var _iteratorError18 = undefined;

                            try {
                                for (var _iterator18 = fromRoles.premiseIn[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
                                    var argumentNode = _step18.value;
                                    var _iteratorNormalCompletion19 = true;
                                    var _didIteratorError19 = false;
                                    var _iteratorError19 = undefined;

                                    try {
                                        for (var _iterator19 = tos[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
                                            var to = _step19.value;

                                            var _edgeId = "e" + edgeCount;
                                            edgeCount++;
                                            map.edges.push(new _Edge.Edge({
                                                id: _edgeId,
                                                from: to,
                                                to: argumentNode,
                                                fromStatement: toStatement,
                                                toStatement: fromStatement,
                                                type: "attack",
                                                status: "reconstructed"
                                            }));
                                        }
                                    } catch (err) {
                                        _didIteratorError19 = true;
                                        _iteratorError19 = err;
                                    } finally {
                                        try {
                                            if (!_iteratorNormalCompletion19 && _iterator19.return) {
                                                _iterator19.return();
                                            }
                                        } finally {
                                            if (_didIteratorError19) {
                                                throw _iteratorError19;
                                            }
                                        }
                                    }
                                }
                            } catch (err) {
                                _didIteratorError18 = true;
                                _iteratorError18 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion18 && _iterator18.return) {
                                        _iterator18.return();
                                    }
                                } finally {
                                    if (_didIteratorError18) {
                                        throw _iteratorError18;
                                    }
                                }
                            }
                        }
                    }

                    //now add an edge from each source to each target
                    var edgeType = _relation4.type;
                    if (edgeType == "contradictory" || edgeType == "contrary") {
                        edgeType = "attack";
                    } else if (edgeType == "entails") {
                        edgeType = "support";
                    }
                    var _iteratorNormalCompletion20 = true;
                    var _didIteratorError20 = false;
                    var _iteratorError20 = undefined;

                    try {
                        for (var _iterator20 = froms[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
                            var from = _step20.value;
                            var _iteratorNormalCompletion21 = true;
                            var _didIteratorError21 = false;
                            var _iteratorError21 = undefined;

                            try {
                                for (var _iterator21 = tos[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
                                    var _to = _step21.value;

                                    var _edgeId2 = "e" + edgeCount;
                                    edgeCount++;
                                    map.edges.push(new _Edge.Edge({
                                        id: _edgeId2,
                                        from: from, //node
                                        to: _to, //node
                                        fromStatement: fromStatement, //statement
                                        toStatement: toStatement, //statement
                                        type: edgeType,
                                        status: _relation4.status
                                    }));
                                }
                            } catch (err) {
                                _didIteratorError21 = true;
                                _iteratorError21 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion21 && _iterator21.return) {
                                        _iterator21.return();
                                    }
                                } finally {
                                    if (_didIteratorError21) {
                                        throw _iteratorError21;
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError20 = true;
                        _iteratorError20 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion20 && _iterator20.return) {
                                _iterator20.return();
                            }
                        } finally {
                            if (_didIteratorError20) {
                                throw _iteratorError20;
                            }
                        }
                    }
                }

                // Add support edges to represent equivalence relations between statement occurrences (between conclusions, premises, statement nodes)
                // 1) From all argument nodes that use p as main conclusion to statement node p
                // 2) From statement node p to all arguments that use p as premise
                // 3) If p is not represented by a statement node: From all argument nodes that use p as main conclusion to all arguments that use p as premise
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

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = map.nodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _node5 = _step5.value;

                    if (_node5.type == "statement") {
                        var _roles4 = statementRoles[_node5.title];
                        var _statement2 = response.statements[_node5.title];
                        if (_roles4) {
                            //1) add conclusion +> statementNode edges
                            var _iteratorNormalCompletion22 = true;
                            var _didIteratorError22 = false;
                            var _iteratorError22 = undefined;

                            try {
                                for (var _iterator22 = _roles4.conclusionIn[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
                                    var _argumentNode = _step22.value;

                                    var _edgeId3 = "e" + edgeCount;
                                    edgeCount++;
                                    map.edges.push(new _Edge.Edge({
                                        id: _edgeId3,
                                        from: _argumentNode, //node
                                        to: _node5, //node
                                        fromStatement: _statement2, //statement
                                        toStatement: _statement2, //statement
                                        type: "support",
                                        status: "reconstructed"
                                    }));
                                }

                                //2) add statementNode +> premise edges
                            } catch (err) {
                                _didIteratorError22 = true;
                                _iteratorError22 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion22 && _iterator22.return) {
                                        _iterator22.return();
                                    }
                                } finally {
                                    if (_didIteratorError22) {
                                        throw _iteratorError22;
                                    }
                                }
                            }

                            var _iteratorNormalCompletion23 = true;
                            var _didIteratorError23 = false;
                            var _iteratorError23 = undefined;

                            try {
                                for (var _iterator23 = _roles4.premiseIn[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
                                    var _argumentNode2 = _step23.value;

                                    var _edgeId4 = "e" + edgeCount;
                                    edgeCount++;
                                    map.edges.push(new _Edge.Edge({
                                        id: _edgeId4,
                                        from: _node5, //node
                                        to: _argumentNode2, //node
                                        fromStatement: _statement2, //statement
                                        toStatement: _statement2, //statement
                                        type: "support",
                                        status: "reconstructed"
                                    }));
                                }
                            } catch (err) {
                                _didIteratorError23 = true;
                                _iteratorError23 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion23 && _iterator23.return) {
                                        _iterator23.return();
                                    }
                                } finally {
                                    if (_didIteratorError23) {
                                        throw _iteratorError23;
                                    }
                                }
                            }
                        }
                    } else if (_node5.type == "argument") {
                        // 3) add support relations between argument nodes
                        var argumentSrc = response.arguments[_node5.title];
                        var conclusion = argumentSrc.pcs ? _.last(argumentSrc.pcs) : null;
                        if (conclusion && !statementNodes[conclusion.title]) {
                            var conclusionEquivalenceClass = response.statements[conclusion.title];
                            // argument is reconstructed and conclusion is not represented by statement node
                            var _roles5 = statementRoles[conclusion.title];
                            if (_roles5 && _roles5.premiseIn) {
                                // argument +> argument
                                var _iteratorNormalCompletion24 = true;
                                var _didIteratorError24 = false;
                                var _iteratorError24 = undefined;

                                try {
                                    for (var _iterator24 = _roles5.premiseIn[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
                                        var argumentTargetNode = _step24.value;

                                        var _edgeId5 = "e" + edgeCount;
                                        edgeCount++;
                                        map.edges.push(new _Edge.Edge({
                                            id: _edgeId5,
                                            from: _node5, //node
                                            to: argumentTargetNode, //node
                                            fromStatement: conclusionEquivalenceClass,
                                            toStatement: conclusionEquivalenceClass,
                                            type: "support",
                                            status: "reconstructed"
                                        }));
                                    }
                                } catch (err) {
                                    _didIteratorError24 = true;
                                    _iteratorError24 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion24 && _iterator24.return) {
                                            _iterator24.return();
                                        }
                                    } finally {
                                        if (_didIteratorError24) {
                                            throw _iteratorError24;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                //groups
                //groups are added to map.nodes
                //nodes contained within a group are removed from map.nodes and pushed into group.nodes instead.
                //groups within groups are also pushed to group.nodes.
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

            if (settings.groupMode && settings.groupMode != "none") {
                var nodeList = map.nodes;
                map.nodes = [];

                var groupDict = {};
                var groupList = [];

                var maxGroupLevel = 0;

                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = nodeList[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var node = _step6.value;

                        var section = null;
                        if (node.type == "argument") {
                            var argument = response.arguments[node.title];
                            if (argument.section) {
                                section = argument.section;
                            } else {
                                var _iteratorNormalCompletion9 = true;
                                var _didIteratorError9 = false;
                                var _iteratorError9 = undefined;

                                try {
                                    for (var _iterator9 = argument.descriptions[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                        var member = _step9.value;

                                        if (member.section) {
                                            section = member.section;
                                            break;
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
                        } else {
                            var equivalenceClass = response.statements[node.title];
                            var _iteratorNormalCompletion10 = true;
                            var _didIteratorError10 = false;
                            var _iteratorError10 = undefined;

                            try {
                                for (var _iterator10 = equivalenceClass.members[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                                    var _member = _step10.value;

                                    if (_member.section) {
                                        section = _member.section;
                                        break;
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

                        if (section) {
                            if (maxGroupLevel < section.level) {
                                maxGroupLevel = section.level;
                            }
                            var group = groupDict[section.id];
                            if (!group) {
                                group = {
                                    type: "group",
                                    id: section.id,
                                    title: section.title,
                                    labelTitle: section.title,
                                    level: section.level,
                                    nodes: []
                                };
                                groupDict[section.id] = group;
                                groupList.push(group);
                                if (section.parent) {
                                    group.parent = section.parent.id;
                                    var parentGroup = groupDict[group.parent];
                                    if (!parentGroup) {
                                        var currentGroup = group;
                                        var currentSection = section;
                                        while (currentGroup.parent) {
                                            parentGroup = groupDict[currentGroup.parent];
                                            if (parentGroup) {
                                                if (!_.includes(parentGroup.nodes, currentGroup)) {
                                                    parentGroup.nodes.push(currentGroup);
                                                }
                                                break;
                                            }
                                            var parentSection = currentSection.parent;
                                            parentGroup = {
                                                type: "group",
                                                id: parentSection.id,
                                                title: parentSection.title,
                                                labelTitle: parentSection.title,
                                                level: parentSection.level,
                                                nodes: [currentGroup]
                                            };
                                            if (parentSection.parent) {
                                                parentGroup.parent = parentSection.parent.id;
                                            }
                                            groupDict[currentGroup.parent] = parentGroup;
                                            groupList.push(parentGroup);
                                            currentGroup = parentGroup;
                                            currentSection = parentSection;
                                        }
                                    } else if (!_.includes(parentGroup.nodes, group)) {
                                        parentGroup.nodes.push(group);
                                    }
                                }
                            }
                            group.nodes.push(node);
                        } else {
                            map.nodes.push(node);
                        }
                    }

                    //normalize group levels
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

                var minGroupLevel = maxGroupLevel - settings.groupDepth + 1;
                var _iteratorNormalCompletion7 = true;
                var _didIteratorError7 = false;
                var _iteratorError7 = undefined;

                try {
                    for (var _iterator7 = groupList[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                        var _group = _step7.value;

                        _group.level = _group.level - minGroupLevel;
                    }
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

                var _iteratorNormalCompletion8 = true;
                var _didIteratorError8 = false;
                var _iteratorError8 = undefined;

                try {
                    for (var _iterator8 = groupList[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                        var _group2 = _step8.value;

                        if (_group2.level < 0) {
                            var _iteratorNormalCompletion11 = true;
                            var _didIteratorError11 = false;
                            var _iteratorError11 = undefined;

                            try {
                                for (var _iterator11 = _group2.nodes[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                                    var _node = _step11.value;

                                    map.nodes.push(_node);
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
                        } else if (!_group2.parent) {
                            map.nodes.push(_group2);
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
            }

            return map;
        }
    }, {
        key: "createNode",
        value: function createNode(nodeType, title, nodeCount) {
            var id = "n" + nodeCount;
            return new _Node.Node(nodeType, title, id);
        }
    }]);

    return MapMaker;
}();

module.exports = {
    MapMaker: MapMaker
};
//# sourceMappingURL=MapMaker.js.map