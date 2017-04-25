import {Argument} from 'argdown-parser';
import * as _ from 'lodash';

class MapMaker{
  constructor(config){
    this.name = "MapMaker";
    this.config = config;
  }
  set config(config){
    this.settings = _.defaults(config ||{}, {
      statementSelectionMode : "roots", //options: all | titled | roots | statement-trees | with-relations
      excludeDisconnected : true
    });
  }
  run(data){
    data.map = this.makeMap(data);
    return data;
  }
  makeMap(data){
    let map = {nodes: [], edges: []};
    let nodeCount = 0; //used for generating node ids
    let edgeCount = 0; //used for generating edge ids
    let statementNodes = {}; //a dictionary of statement nodes. The key is the statement's title
    let argumentNodes = {}; //a dictionary of argument nodes. The key is the argument's title
    let relationsForMap = []; //the relations that have to be visualized by edges between nodes in the map (each relation can be represented by more than one edge)

    const untitledTest = /^Untitled/;

    //1) find all statement classes that should be inserted as nodes
    //2) Add all outgoing relations of each of these statements to the relations to be represented with edges
    let statementKeys = Object.keys(data.statements);
    for(let statementKey of statementKeys){
      let equivalenceClass = data.statements[statementKey];
      let selectionTest = true;

      let isConnected = equivalenceClass.relations.length > 0 || equivalenceClass.isUsedAsPremise || equivalenceClass.isUsedAsConclusion;
      let notUsedInArgumentButWithRelations = equivalenceClass.relations.length > 0 && !equivalenceClass.isUsedAsPremise && !equivalenceClass.isUsedAsConclusion;
      
      if(this.settings.statementSelectionMode == "all"){
        selectionTest = true;
      }if(this.settings.statementSelectionMode == "titled"){
        selectionTest = notUsedInArgumentButWithRelations || !untitledTest.exec(equivalenceClass.title);
      }else if(this.settings.statementSelectionMode == "roots"){
        selectionTest = notUsedInArgumentButWithRelations || equivalenceClass.isUsedAsRootOfStatementTree;
      }else if(this.settings.statementSelectionMode == "statement-trees"){
        selectionTest = equivalenceClass.isUsedAsRootOfStatementTree || equivalenceClass.isUsedAsChildOfStatementTree;
      }else if(this.settings.statementSelectionMode == "with-relations"){
        selectionTest = equivalenceClass.relations.length > 0;        
      }
      if((!this.settings.excludeDisconnected ||isConnected) && selectionTest){
        let id = "n"+nodeCount;
        nodeCount++;
        let node = {type:"statement", title:statementKey, id:id};
        statementNodes[statementKey] = node;
        map.nodes.push(node)

        //add all outgoing relations of each statement node
        for(let relation of equivalenceClass.relations){
          if(relation.from == equivalenceClass){
            relationsForMap.push(relation);
          }
        }
      }
    }

    let argumentKeys = Object.keys(data.arguments);
    let statementRoles = {}; //a dictionary mapping statement titles to {premiseIn:[nodeId], conclusionIn:[nodeId]} objects

    //1) add all (connected) arguments as argument nodes
    //2) add all outgoing relations of each argument to relationsForMap
    //3) add all outgoing relations of each main conclusion to relationsForMap, if the conclusion is not represented by a statement node.
    for(let argumentKey of argumentKeys){
      let hasRelations = false;
      let argument = data.arguments[argumentKey];
      let id = "n"+nodeCount;
      nodeCount++;
      let node = {type:"argument", title:argument.title, id:id};

      for(let relation of argument.relations){
        hasRelations = true;
        //add all outgoing relations from each argument node
        if(relation.from == argument){
          relationsForMap.push(relation);
        }
      }
      for(let statement of argument.pcs){
        let roles = statementRoles[statement.title];
        let equivalenceClass = data.statements[statement.title];
        if(!roles){
          roles = {premiseIn:[], conclusionIn:[]};
          statementRoles[statement.title] = roles;
        }
        if(statementNodes[statement.title]){
          //argument node has a support relation to statement node
          hasRelations = true;
        }
        if(statement.role == "premise"){
          roles.premiseIn.push(node);
          for(let relation of equivalenceClass.relations){
            if(relation.to == equivalenceClass){
              hasRelations = true;
              break;
            }
          }
        }else if(statement.role == "conclusion" && statement == argument.pcs[argument.pcs.length - 1]){
          roles.conclusionIn.push(node);

          for(let relation of equivalenceClass.relations){
            if(relation.from == equivalenceClass){
              hasRelations = true;
              //add all outgoing relations of the argument's main conclusion, if the conclusion has not been inserted as a statement node
              //if the conclusion has been inserted as a statement node, the outgoing relations have already been added
              if(!statementNodes[statement.title]){
                relationsForMap.push(relation);
              }

            }
          }
        }
      }
      //add argument node
      if(!this.settings.excludeDisconnected || hasRelations){
        argumentNodes[argumentKey] = node;
        map.nodes.push(node);
      }
    }


    //Create edges representing the selected relations
    //One relation can be represented by multiple edges in the graph, as the same sentence (the same equivalence class) can be used in several arguments as premise or conclusion.
    //If a source/target of a relation is a statementNode, all edges, representing the relation, have to start/end at the statementNode.
    //In the next step, "implicit" support edges are added that represent the equivalence relations between statements.
    //These will connect the different occurrences of a statement (or more precisely an "equivalence class" of statements) within the graph.
    for(let relation of relationsForMap){
      let froms = []; //a list of source nodes for the edges representing the relation in the graph
      let tos = []; //a list of target nodes for the edges representing the relation in the graph

      let fromNode;
      let fromStatement;

      if(relation.from instanceof Argument){
        fromNode = argumentNodes[relation.from.title];
      }else{
        fromNode = statementNodes[relation.from.title];
        fromStatement = data.statements[relation.from.title];
      }

      if(!fromNode){ //no node representing the source, so look for all arguments that use the source as conclusion
        let roles = statementRoles[relation.from.title];
        fromStatement = data.statements[relation.from.title];
        if(roles){
          froms = roles.conclusionIn;
        }
      }else{ //push either the argument node or the statement node to the sources list
        froms.push(fromNode);
      }

      let toNode;
      let toStatement;

      if(relation.to instanceof Argument){
        toNode = argumentNodes[relation.to.title];
      }else{
        toNode = statementNodes[relation.to.title];
        toStatement = data.statements[relation.to.title];
      }

      if(!toNode){ //no node representing the target, so look for all arguments that use the target as premise
        let roles = statementRoles[relation.to.title];
        toStatement = data.statements[relation.to.title];
        if(roles){
          tos = roles.premiseIn;
        }
      }else{ //push either the argument node or the statement node to the targets list
        tos.push(toNode);
      }

      //special case: both statements of a contradiction are represented as statement nodes
      //in this case there have to be two attack relations going both ways
      //we have to add the "reverse direction" edge here
      if(relation.type == "contradiction" && fromNode && toNode){
        let edgeId = 'e'+edgeCount;
        edgeCount++;
        map.edges.push({
          id:edgeId,
          from:toNode, //node
          to:fromNode, //node
          fromStatement: toStatement, //statement
          toStatement: fromStatement, //statement
          type:"attack",
          status: "reconstructed"
        });
      }

      //now add an edge from each source to each target
      let edgeType = relation.type;
      if(edgeType == "contradiction"){
        edgeType = "attack";
      }
      for(let from of froms){
        for(let to of tos){
          let edgeId = 'e'+edgeCount;
          edgeCount++;
          map.edges.push({
            id:edgeId,
            from:from, //node
            to:to, //node
            fromStatement: fromStatement, //statement
            toStatement: toStatement, //statement
            type:edgeType,
            status: relation.status
          });
        }
      }
    }

    //Add support edges to represent equivalence relations between sentences or sentence occurrences
    //1) From all argument nodes that use p as main conclusion to statement node p
    //2) From statement node p to all arguments that use p as premise
    for(let node of map.nodes){
      if(node.type == "statement"){
        let roles = statementRoles[node.title];
        let statement = data.statements[node.title];
        if(roles){
          //1) add conclusion +> statementNode edges
          for(let argumentNode of roles.conclusionIn){
            let edgeId = 'e'+edgeCount;
            edgeCount++;
            map.edges.push({
              id:edgeId,
              from:argumentNode, //node
              to:node, //node
              fromStatement: statement, //statement
              toStatement: statement, //statement
              type:"support",
              status: "reconstructed"
            });
          }

          //2) add statementNode +> premise edges
          for(let argumentNode of roles.premiseIn){
            let edgeId = 'e'+edgeCount;
            edgeCount++;
            map.edges.push({
              id:edgeId,
              from:node, //node
              to:argumentNode, //node
              fromStatement: statement, //statement
              toStatement: statement, //statement
              type:"support",
              status: "reconstructed"
            });
          }
        }
      }
    }

    return map;
  }
}
module.exports = {
  MapMaker: MapMaker
}
