import {Argument} from 'argdown-parser';
import * as _ from 'lodash';
import {Node} from './model/Node.js';
import {Edge} from './model/Edge.js';

class MapMaker{
  constructor(config){
    this.name = "MapMaker";
    this.config = config;
  }
  set config(config){
    this.settings = _.defaults(config ||{}, {
      statementSelectionMode : "roots", //options: all | titled | roots | statement-trees | with-relations
      excludeDisconnected : true,
      groupMode : "heading", //options: heading | tag | none
      groupDepth : 2,
      addNodeText : true
    });
  }
  run(data){
    if(data.config){
      if(data.config.map){
        this.config = data.config.map;
      }else if(data.config.MapMaker){
        this.config = data.config.MapMaker;
      }
    }

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
        let node = new Node("statement", statementKey, id);
        if(this.settings.addNodeText){
          const lastMember = _.last(equivalenceClass.members);
          if(lastMember){
            node.text = lastMember.text;            
          }
        }
        statementNodes[statementKey] = node;
        map.nodes.push(node)

        //add all outgoing relations of each statement node
        for(let relation of equivalenceClass.relations){
          if(relation.from == equivalenceClass && relation.type !== "contradictory"){
            relationsForMap.push(relation);              
          }else if(relation.type == "contradictory" && !_.includes(relationsForMap, relation)){
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
      let node = new Node("argument", argument.title, id);
      if(this.settings.addNodeText){
        const lastMember = _.last(argument.descriptions);
        if(lastMember){
          node.text = lastMember.text;          
        }
      }

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
            if(relation.to == equivalenceClass || relation.type == "contradictory"){
              hasRelations = true;
            }
          }
        }else if(statement.role == "conclusion" && statement == argument.pcs[argument.pcs.length - 1]){
          roles.conclusionIn.push(node);

          for(let relation of equivalenceClass.relations){
            if(relation.from == equivalenceClass){
              hasRelations = true;
              //add all outgoing relations of the argument's main conclusion, if the conclusion has not been inserted as a statement node
              //if the conclusion has been inserted as a statement node, the outgoing relations have already been added
              if(!statementNodes[statement.title] && (!relation.type == "contradictory" ||!_.includes(relationsForMap,relation))){
                relationsForMap.push(relation);
              }
            }else if(relation.type == "contradictory" && !_.includes(relationsForMap,relation)){
              hasRelations = true;
              relationsForMap.push(relation);
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
    //These will connect the different occurrences of a statement (or more precisely the occurrences of an "equivalence class") within the graph.
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
          froms.push.apply(froms, roles.conclusionIn);
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
          tos.push.apply(tos, roles.premiseIn);
        }
      }else{ //push either the argument node or the statement node to the targets list
        tos.push(toNode);
      }

      if(relation.type == "contradictory"){
        //special case: both statements of a contradictory are represented as statement nodes
        //in this case there have to be two attack relations going both ways
        //we have to add the "reverse direction" edge here
        if(fromNode && toNode && !(fromNode instanceof Argument) && !(toNode instanceof Argument)){
          let edgeId = 'e'+edgeCount;
          edgeCount++;
          let edge = new Edge({
                      id:edgeId,
                      from:toNode, //node
                      to:fromNode, //node
                      fromStatement: toStatement, //statement
                      toStatement: fromStatement, //statement
                      type:"attack",
                      status: "reconstructed"
                    });
          map.edges.push(edge);         
        }
        let fromRoles = statementRoles[relation.from.title];
        if(fromRoles && fromRoles.premiseIn){
          for(let argumentNode of fromRoles.premiseIn){
            for(let to of tos){
              let edgeId = 'e'+edgeCount;
              edgeCount++;
              map.edges.push(new Edge({
                id:edgeId,
                from:to,
                to:argumentNode,
                fromStatement:toStatement,
                toStatement: fromStatement,
                type:"attack",
                status:"reconstructed"
              }));
            }
          }
        }

      }
      
      //now add an edge from each source to each target
      let edgeType = relation.type;
      if(edgeType == 'contradictory' ||edgeType == 'contrary'){
        edgeType = 'attack';
      }else if(edgeType == 'entails'){
        edgeType = 'support';
      }
      for(let from of froms){
        for(let to of tos){
          let edgeId = 'e'+edgeCount;
          edgeCount++;
          map.edges.push(new Edge({
            id:edgeId,
            from:from, //node
            to:to, //node
            fromStatement: fromStatement, //statement
            toStatement: toStatement, //statement
            type:edgeType,
            status: relation.status
          }));
        }
      }
    }

    //Add support edges to represent equivalence relations between sentences or sentence occurrences
    //1) From all argument nodes that use p as main conclusion to statement node p
    //2) From statement node p to all arguments that use p as premise
    for(let node of map.nodes){
      if(node.type == 'statement'){
        let roles = statementRoles[node.title];
        let statement = data.statements[node.title];
        if(roles){
          //1) add conclusion +> statementNode edges
          for(let argumentNode of roles.conclusionIn){
            let edgeId = 'e'+edgeCount;
            edgeCount++;
            map.edges.push(new Edge({
              id:edgeId,
              from:argumentNode, //node
              to:node, //node
              fromStatement: statement, //statement
              toStatement: statement, //statement
              type:'support',
              status: 'reconstructed'
            }));
          }

          //2) add statementNode +> premise edges
          for(let argumentNode of roles.premiseIn){
            let edgeId = 'e'+edgeCount;
            edgeCount++;
            map.edges.push(new Edge({
              id:edgeId,
              from:node, //node
              to:argumentNode, //node
              fromStatement: statement, //statement
              toStatement: statement, //statement
              type:'support',
              status: 'reconstructed'
            }));
          }
        }
      }
    }
    
    //groups
    //groups are added to map.nodes
    //nodes contained within a group are removed from map.nodes and pushed into group.nodes instead.
    //groups within groups are also pushed to group.nodes.
    if(this.settings.groupMode && this.settings.groupMode != 'none'){
      const nodeList = map.nodes;
      map.nodes = [];
      
      const groupDict = {};
      const groupList = [];
      
      let maxGroupLevel = 0;
      
      for(let node of nodeList){
        let section = null;
        if(node.type == "argument"){
          let argument = data.arguments[node.title];
          if(argument.section){
            section = argument.section;
          }else{
            for(let member of argument.descriptions){
              if(member.section){
                section = member.section;
                break;
              }
            }            
          }
        }else{
          let equivalenceClass = data.statements[node.title];
          for(let member of equivalenceClass.members){
            if(member.section){
              section = member.section;
              break;
            }
          }
        }
        
        if(section){
          if(maxGroupLevel < section.level){
            maxGroupLevel = section.level;
          }
          let group = groupDict[section.id];
          if(!group){
            group = {
              type: "group",
              id:section.id, 
              title: section.title, 
              level: section.level, 
              nodes: []
            };
            if(section.parent){
              group.parent = section.parent.id;
            }
            groupDict[section.id] = group;
            groupList.push(group);
          }
          group.nodes.push(node);
        }else{
          map.nodes.push(node);
        }
      }
      
      //normalize group levels
      const minGroupLevel = maxGroupLevel - this.settings.groupDepth + 1;
      for(let group of groupList){
        group.level = group.level - minGroupLevel;
      }
      for(let group of groupList){
        if(group.level < 0){
          for(let node of group.nodes){
            map.nodes.push(node);
          }
        }else{
          let parentGroup = groupDict[group.parent];
          if(parentGroup && parentGroup.level >= 0){
            parentGroup.nodes.push(group);
          }else{
            map.nodes.push(group);
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
