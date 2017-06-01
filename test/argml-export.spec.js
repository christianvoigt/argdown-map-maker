import { expect } from 'chai';
import {ArgdownApplication, ModelPlugin} from 'argdown-parser';
import {MapMaker, ArgMLExport} from '../src/index.js';
import fs from 'fs';

let app = new ArgdownApplication();
let modelPlugin = new ModelPlugin();
app.addPlugin(modelPlugin,'build-model');
let mapMaker = new MapMaker({groupMode:'none'});
let argMLExport = new ArgMLExport();
app.addPlugin(mapMaker, "export-argml");
app.addPlugin(argMLExport, "export-argml");

describe("ArgMLExport", function() {
  it("sanity test", function(){
    let source = "<Argument 1>\n  + [Statement 1]: Hello World!\n    +<Argument 2>: Description";
    app.parse(source);
    let result = app.run(['build-model','export-argml']);
    // console.log(result.argml.end({
    //     pretty: true,
    //     indent: '  ',
    //     newline: '\n',
    //     allowEmpty: false
    // }));
    expect(result.argml).to.exist;
  });
  it("can export Argdown intro", function(){
    let source = fs.readFileSync("./test/intro.argdown", 'utf8');
    app.parse(source);
    let result = app.run(['build-model','export-argml']);
    // console.log(result.argml.end({
    //     pretty: true,
    //     indent: '  ',
    //     newline: '\n',
    //     allowEmpty: false
    // }));
    expect(result.argml).to.exist;
  });
});
