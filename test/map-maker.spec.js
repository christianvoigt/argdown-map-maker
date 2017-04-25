import { expect } from 'chai';
import {ArgdownApplication, ArgdownPreprocessor} from 'argdown-parser';
import {MapMaker} from '../src/index.js';

let app = new ArgdownApplication();
let preprocessor = new ArgdownPreprocessor();
app.addPlugin(preprocessor,'preprocessor');
let mapMaker = new MapMaker({statementSelectionMode:"all"});
app.addPlugin(mapMaker, "make-map");

describe("MapMaker", function() {
  it("can create map from one statement and two argument definitions", function(){
    let source = "<Argument 1>\n  + [Statement 1]: Hello World!\n    +<Argument 2>: Description";
    app.parse(source);
    let result = app.run(['preprocessor','make-map']);
    //console.log(JSON.stringify(result.map, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);

    expect(result.map.nodes.length).to.equal(3);
    expect(result.map.nodes[0].title).to.equal("Statement 1");
    expect(result.map.nodes[1].title).to.equal("Argument 1");
    expect(result.map.nodes[2].title).to.equal("Argument 2");
    expect(result.map.edges.length).to.equal(2);
  });
  it("can create a map from two argument reconstructions", function(){
    mapMaker.config = {statementSelectionMode: "with-relations"};
    let source = "<Argument 1>\n\n  (1)[Statement 1]: A\n  (2)[Statement 2]: B\n  ----\n  (3)[Statement 2]: C"+
    "\n\n<Argument 2>\n\n  (1)[Statement 4]: A\n  (2)[Statement 5]: B\n  ----\n  (3)[Statement 6]: C\n  ->[Statement 1]";
    app.parse(source);
    let result = app.run(['preprocessor','make-map']);
    //console.log(JSON.stringify(result.map, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.map.edges);

    expect(result.map.nodes.length).to.equal(4);
    expect(result.map.edges.length).to.equal(3);

    expect(result.map.edges[0].type).to.equals("attack");
    expect(result.map.edges[0].from.title).to.equals("Statement 6");
    expect(result.map.edges[0].to.title).to.equals("Statement 1");

    expect(result.map.edges[1].type).to.equals("support");
    expect(result.map.edges[1].from.title).to.equals("Statement 1");
    expect(result.map.edges[1].to.title).to.equals("Argument 1");

    expect(result.map.edges[2].type).to.equals("support");
    expect(result.map.edges[2].from.title).to.equals("Argument 2");
    expect(result.map.edges[2].to.title).to.equals("Statement 6");
  });
  it("selects argument if premises or conclusions are selected as statement nodes", function(){
    mapMaker.config = {statementSelectionMode: "statement-trees"};
    let source = `<!--Hier wird das Argument nicht richtig gezeichnet.-->

[ZT]: ZT

[T1]: T1

<Argument 1>: Argument 1.

(1) [T1]
(2) P2
-- Inference rule --
(3) [ZT]`;
    app.parse(source);
    let result = app.run(['preprocessor','make-map']);

    expect(result.map.nodes.length).to.equal(3);
    expect(result.map.edges.length).to.equal(2);
  });  
  it("adds attack relation if statement is contradictory to premiss", function(){
    mapMaker.config = {statementSelectionMode: "statement-trees"};
    let source = `
[T1]: T1

[T2]: T2

(1) P1
  >< [T1]
(2) P2
----
(3) C1 
  >< [T2]`;
    app.parse(source);
    let result = app.run(['preprocessor','make-map']);
    expect(result.map.nodes.length).to.equal(3);
    expect(result.map.edges.length).to.equal(2);
  });    
it("does not add duplicate arrows for contradictions", function(){
  mapMaker.config = {statementSelectionMode: "with-relations"};
  let source = `<A>: A
  >< [T2]: B
  
<A>

(1) A
----
(2) [T1]: C`;
  app.parse(source);
  let result = app.run(['preprocessor','make-map']);
  expect(result.map.nodes.length).to.equal(3);
  expect(result.map.edges.length).to.equal(3);
});    
});
