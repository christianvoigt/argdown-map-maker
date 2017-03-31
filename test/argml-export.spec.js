import { expect } from 'chai';
import {ArgdownApplication, ArgdownPreprocessor} from 'argdown-parser';
import {MapMaker, ArgMLExport} from '../src/index.js';


let app = new ArgdownApplication();
let preprocessor = new ArgdownPreprocessor();
app.addPlugin(preprocessor,'preprocessor');
let mapMaker = new MapMaker();
let argMLExport = new ArgMLExport();
app.addPlugin(mapMaker, "export-argml");
app.addPlugin(argMLExport, "export-argml");

describe("ArgMLExport", function() {
  it("sanity test", function(){
    let source = "<Argument 1>\n  + [Statement 1]: Hello World!\n    +<Argument 2>: Description";
    app.parse(source);
    let result = app.run(['preprocessor','export-argml']);
    // console.log(result.argml.end({
    //     pretty: true,
    //     indent: '  ',
    //     newline: '\n',
    //     allowEmpty: false
    // }));
    expect(result.argml).to.exist;
  });
});
