import { expect } from 'chai';
import {ArgdownApplication, ArgdownPreprocessor} from 'argdown-parser';
import {MapMaker, DotExport} from '../src/index.js';


let app = new ArgdownApplication();
let preprocessor = new ArgdownPreprocessor();
app.addPlugin(preprocessor,'preprocessor');
let mapMaker = new MapMaker();
let dotExport = new DotExport();
app.addPlugin(mapMaker, "export");
app.addPlugin(dotExport, "export");

describe("DotExport", function() {
  it("sanity test", function(){
    let source = `
    # Section 1
    
    <Argument with a very very long title 1>
      + [Statement with a very very long title 1]: Hello World!
          +<Argument 2>: Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.
            -[Äüö'quotes']: Some text
                -<A very convincing argument>:Too complicated to explain
                  +>[And yet another statement]: Some more text
                    +<Another Argument>: Some more text
    
    ## Section 2
    
    <Argument with a very very long title 1>: text
      - [And yet another statement]
      
    ### Section 3
    
    [And yet another statement]
      + <Argument>
        - text
    `;

    app.parse(source);
    let result = app.run(['preprocessor','export']);
    expect(result.dot).to.exist;
  });
});
