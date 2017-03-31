# Argdown Map Maker

This package contains three plugins for Argdown applications:

  - the __MapMaker plugin__ creates graphs (nodes and edges) from Argdown data
  - the __DotExport plugin__ exports these graphs into the .dot format
  - the __ArgMLExport plugin__ exports these graphs into a variant of the graphML format, extended with informations specific to argument maps

All plugins require that the Preprocessor plugin from the argdown-parser package has processed the Argdown data.
The two export plugins also require that the MapMaker plugin has processed the Argdown data.

The MapMaker plugin adds a map object to the data returned from the Argdown application. This map object contains a nodes array and an edges array with all informations necessary to create an argument map.

Note, that at this point the graphml export is of limited use:

  - there is no graph layout plugin, so all node positions in the graphml file are set to (0,0). You can import the file to [yEd](http://www.yworks.com/products/yed) to use one of yEd's graph layouts.
  - currently the node label heights in the graphml are not calculated, so you have to adjust the labels manually as well.

<!-- The ArgMLExport uses the [xmlbuilder](https://github.com/oozcitak/xmlbuilder-js) package and returns the xml object generated by it, so you can use its .end method. For further details see the example or the xmlbuilder documentation. -->

## Example

```JavaScript
import {ArgdownApplication, ArgdownPreprocessor,MapMaker, ArgMLExport} from 'argdown-parser';

let app = new ArgdownApplication();
let preprocessor = new ArgdownPreprocessor();
app.addPlugin(preprocessor,'preprocessor'); //needs to run before mapMaker
let mapMaker = new MapMaker();
let argMLExport = new ArgMLExport();
let dotExport = new DotExport();
app.addPlugin(mapMaker, "export"); //needs to run before dotExport and argMLExport
app.addPlugin(dotExport, "export");
app.addPlugin(argMLExport, "export");
let source = "<Argument 1>\n  + [Statement 1]: Hello World!\n    +<Argument 2>: Description";
app.parse(source);
let result = app.run(['preprocessor','export']);
console.log(result.argml.end({
    pretty: true,
    indent: '  ',
    newline: '\n',
    allowEmpty: false
}));
console.log(result.dot);

```
