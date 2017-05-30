import * as _ from 'lodash';
//import {EquivalenceClass} from 'argdown-parser';
var builder = require('xmlbuilder');
var Chance = require('chance');
var chance = new Chance();

class ArgMLExport{
  set config(config){
    let previousSettings = this.settings;
    if(!previousSettings){
      previousSettings = {
        convertToString: true
      };
    }
    this.settings = _.defaultsDeep({}, config, previousSettings);
  }
  constructor(config){
    this.name = "ArgMLExport";
    this.config = config;
  }
  run(data){
    if(data.config){
      if(data.config.argml){
        this.config = data.config.argml;
      }else if(data.config.ArgMLExport){
        this.config = data.config.ArgMLExport;
      }
    }
    
    let argml = builder.create('graphml',{version: '1.0',
encoding: 'UTF-8',
standalone: true})
      .a('xmlns' , 'http://graphml.graphdrawing.org/xmlns')
      .a('xmlns:arg' , 'xmlns:arg="http://www.argunet.org/xml/argml')
      .a('xmlns:xsi' , 'http://www.w3.org/2001/XMLSchema-instance')
      .a('xmlns:y'  , 'http://www.yworks.com/xml/graphml')
      .a('xsi:schemaLocation' , 'http://www.argunet.org/xml/argml argunetxml.xsd http://graphml.graphdrawing.org/xmlns http://www.yworks.com/xml/schema/graphml/1.1/ygraphml.xsd');

      argml.e('key',{
        'attr.name' :  'arg.debate',
        'id' : 'd0'
      });
      argml.e('key',{
        'for' : 'graphml',
        'yfiles.type' :  'resources',
        'id' : 'd1'
      });
      argml.e('key',{
        'attr.name' :  'arg.node',
        'for' : 'node',
        'id' : 'd2'
      });
      argml.e('key',{
        'for' : 'node',
        'yfiles.type' :  'nodegraphics',
        'id' : 'd3'
      });
      argml.e('key',{
        'attr.name' : 'arg.edge',
        'for' :  'edge',
        'id' : 'd4'
      });
      argml.e('key',{
        'for' : 'edge',
        'yfiles.type' :  'edgegraphics',
        'id' : 'd5'
      });

    let graph = argml.e('graph',{
      'edgedefault' : 'directed',
      'id' : 'G'
    });

    let statementArgMLIds = {};
    let argumentArgMLIds = {};
    let nodesByTitle = {};
    //first we create argmlIds for every node and statement
    //we could do this on the fly, but this way its cleaner
    for(let node of data.map.nodes){
      nodesByTitle[node.title] = node;
      if(node.type == "statement"){
        node.argmlId = statementArgMLIds[node.title];
        if(!node.argmlId){
            node.argmlId = this.getId();
            statementArgMLIds[node.title] = node.argmlId;
        }
      }else if(node.type == "argument"){
        node.argmlId = argumentArgMLIds[node.title];
        if(!node.argmlId){
            node.argmlId = this.getId();
            argumentArgMLIds[node.title] = node.argmlId;
        }

        let argument = data.arguments[node.title];
        for(let statement of argument.pcs){
          let argmlId = statementArgMLIds[statement.title];
          if(!argmlId){
              argmlId = this.getId();
              statementArgMLIds[statement.title] = argmlId;
          }
        }
      }
    }

    for(let node of data.map.nodes){
      let nodeEl = graph.e('node',{id: node.id});
      let argDataEl = nodeEl.e('data',{'key':'d2'});

      if(node.type == "statement"){
        let statement = data.statements[node.title];
        let thesisEl = argDataEl.e('arg:thesis',{'id':node.argmlId, 'colorIndex':'0'}).e('arg:title', null, statement.title).up();
        let lastMember = _.last(statement.members);
        thesisEl.e('arg:content', null, lastMember.text);
        let shapeNode = nodeEl.e('data',{'key':'d3'}).e('y:shapeNode');
        shapeNode.e('y:Geometry',{
          'width':'135.0',
          'x':'0',
          'y':'0'
        });
        shapeNode.e('y:Fill',{
          'color':'#FFFFFF',
          'transparent':'false'
        });
        shapeNode.e('y:BorderStyle',{
          'color':'#63AEF2',
          'type':'line',
          'width':'3.0'
        });
        shapeNode.e('y:NodeLabel',{
          'alignment':'center',
          'autoSizePolicy':'node_width',
          'configuration':'CroppingLabel',
          'fontFamily':'Dialog',
          'fontSize':'12',
          'fontStyle':'plain',
          'hasBackgroundColor':'false',
          'hasLineColor':'false',
          'height':'0.0',
          'modelName':'internal',
          'modelPosition':'c',
          'textColor':'#000000',
          'visible':'true',
          'width':'135.0',
          x:'0.0'
        });
        shapeNode.e('y:NodeLabel',{
          'alignment':'center',
          'autoSizePolicy':'content',
          'fontFamily':'Arial',
          'fontSize':'13',
          'fontStyle':'bold',
          'hasBackgroundColor':'false',
          'hasLineColor':'false',
          'modelName':'internal',
          'modelPosition':'t',
          'textColor':'#000000',
          'visible':'true',
          'width':'118.0',
          'x':'8.5'
        },node.title);

        shapeNode.e('y:NodeLabel',{
          'alignment':'center',
          'autoSizePolicy':'content',
          'fontFamily':'Arial',
          'fontSize':'13',
          'fontStyle':'plain',
          'hasBackgroundColor':'false',
          'hasLineColor':'false',
          'modelName':'internal',
          'modelPosition':'b',
          'textColor':'#000000',
          'visible':'true',
          'width':'128.0',
          'x':'3.5'
        },lastMember.text);
        shapeNode.e('y:Shape',{'type':'roundrectangle'});

      }else if(node.type == "argument"){
        let argument = data.arguments[node.title];
        let lastDescriptionStatement = _.last(argument.descriptions.members);
        let description = (lastDescriptionStatement)?lastDescriptionStatement.text : "";
        let argEl = argDataEl.e('arg:argument',{
          'id' : node.argmlId,
          'colorIndex' : '0',
        }).e('arg:title',null,argument.title).up();
        argEl.e('arg:description', null, description);
        for(let i = 0; i < argument.pcs.length; i++){
          let statement = argument.pcs[i];
          let equivalenceClass = data.statements[statement.title];
          let lastMember = _.last(equivalenceClass.members);
          let propositionType = 'premise';
          let argmlId = statementArgMLIds[statement.title];

          if(statement.role == 'conclusion'){
            if(i == argument.pcs.length - 1){
              propositionType = 'conclusion';
            }else{
              propositionType = 'preliminaryConclusion';
            }
          }
          argEl.e('arg:proposition',{
            'id' : argmlId,
            'type' : propositionType
          }).e('arg:content', null, lastMember.text);
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
        let shapeNode = nodeEl.e('data',{'key':'d3'}).e('y:shapeNode');
        shapeNode.e('y:Geometry',{
          'width': '135',
          'x':'0',
          'y':'0'
        });
        shapeNode.e('y:Fill',{
          'color':'#63AEF2',
          'color2':'#82BEF5',
          'transparent':'false'
        });
        shapeNode.e('y:BorderStyle',{
          'color':'#000000',
          'type':'line',
          'width':'1.0'
        });
        shapeNode.e('y:NodeLabel',{
          'alignment':'center',
          'autoSizePolicy':'node_width',
          'configuration':'CroppingLabel',
          'fontFamily':'Dialog',
          'fontSize':'12',
          'fontStyle':'plain',
          'hasBackgroundColor':'false',
          'hasLineColor':'false',
          'height':'0.0',
          'modelName':'internal',
          'modelPosition':'c',
          'textColor':'#000000',
          'visible':'true',
          'width':'135.0',
          'x':'0.0'
        });
        shapeNode.e('y:NodeLabel',{
          'alignment':'center',
          'autoSizePolicy':'content',
          'fontFamily':'Arial',
          'fontSize':'13',
          'fontStyle':'bold',
          'hasBackgroundColor':'false',
          'hasLineColor':'false',
          'modelName':'internal',
          'modelPosition':'t',
          'textColor':'#000000',
          'visible':'true',
          'width':'88.0',
          x:'23.5'
        }, node.title);

        shapeNode.e('y:NodeLabel',{
          'alignment':'center',
          'autoSizePolicy':'content',
          'fontFamily':'Arial',
          'fontSize':'13',
          'fontStyle':'plain',
          'hasBackgroundColor':'false',
          'hasLineColor':'false',
          'modelName':'internal',
          'modelPosition':'b',
          'textColor':'#000000',
          'visible':'true',
          'width':'131.0',
          'x':'2.0'
        }, description);
        shapeNode.e('y:Shape',{'type':'roundrectangle'});

      }
    }

    for(let edge of data.map.edges){
      let edgeEl = graph.e('edge',{id:edge.id, source:edge.from.id, target:edge.to.id});
      let edgeType;
      let edgeColor = '#00FF00';
      if(edge.type == 'attack'){
        edgeColor = '#FF0000';
        if(edge.status == "sketched"){
          edgeType = "sketchedAttack";
        }else{
          edgeType = "attack";
        }
      }else if(edge.type == "support"){
        if(edge.status == "sketched"){
          edgeType = "sketchedSupport";
        }else{
          edgeType = "support";
        }
      }
      let argEdgeAttributes = {
        'sourceNodeId': edge.from.argmlId,
        'targetNodeId': edge.to.argmlId,
        'type': edgeType
      };
      if(edge.fromStatement){
        argEdgeAttributes.sourcePropositionId = statementArgMLIds[edge.fromStatement.title];
      }
      if(edge.toStatement){
        argEdgeAttributes.targetPropositionId = statementArgMLIds[edge.toStatement.title];
      }
      edgeEl.e('data',{'key':'d4'}).e('arg:edge', argEdgeAttributes);

      let polyLineEdge = edgeEl.e('data',{'key':'d5'}).e('y:PolyLineEdge');
      polyLineEdge.e('y:LineStyle',{
        'color':edgeColor,
        'type':'line',
        'width':'2.0'
      });
      polyLineEdge.e('y:Path',{
        'sx':'0',
        'sy':'0',
        'tx':'0',
        'ty':'0'
      }).e('y:Point',{'x':'0','y':'0'}).up().e('y:Point',{'x':'0','y':'0'});
      polyLineEdge.e('y:Arrows',{
        'source':'none',
        'target':'standard'
      });
      polyLineEdge.e('y:BendStyle', {
        'smoothed':'false'
      });
    }
    if(this.settings.convertToString){
      data.argml = argml.end({
          pretty: true,
          indent: '  ',
          newline: '\n',
          allowEmpty: false
      });
    }else{
      data.argml = argml;
    }
    return data;
  }
  getId(){
    return chance.natural({min:0, max:9223372036854775807}); //positive long value
  }
}
module.exports = {
  ArgMLExport: ArgMLExport
}
