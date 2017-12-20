# Argdown Map Maker

Tools for making argument maps from Argdown documents.

For more information about the Argdown argumentation syntax, visit the [Argdown repository](https://github.com/christianvoigt/argdown).

![Argdown](https://cdn.rawgit.com/christianvoigt/argdown-map-maker/master/argdown-mark.svg)

This package contains two plugins for [Argdown applications](https://github.com/christianvoigt/argdown-parser):

  - the __MapMaker plugin__ creates graphs (nodes and edges) from Argdown data
  - the __DotExport plugin__ exports these graphs into the .dot format

Both plugins require that the ParserPlugin, ModelPlugin and TagPlugin from the [argdown-parser](https://github.com/christianvoigt/argdown-parser) package have processed the Argdown data.
The DotExport also requires that the MapMaker plugin has processed the Argdown data.

The MapMaker plugin adds a map object to the data returned from the Argdown application. This map object contains a nodes array and an edges array with all informations necessary to create an argument map.

## Example

```JavaScript
import {ArgdownApplication, ParserPlugin, ModelPlugin, TagPlugin} from 'argdown-parser';
import {MapMaker, DotExport} from 'argdown-map-maker';

const app = new ArgdownApplication();
const parserPlugin = new ParserPlugin();
app.addPlugin(parserPlugin, 'parse-input');
const modelPlugin = new ModelPlugin();
app.addPlugin(modelPlugin,'build-model'); //needs to run before mapMaker
const tagPlugin = new TagPlugin();
const.addPlugin(tagPlugin,'build-model'); //needs to run before mapMaker
const mapMaker = new MapMaker();
const dotExport = new DotExport();
app.addPlugin(mapMaker, "export"); //needs to run before dotExport and argMLExport
app.addPlugin(dotExport, "export");
let source = "<Argument 1>\n  + [Statement 1]: Hello World!\n    +<Argument 2>: Description";
let result = app.run(['parse-input','build-model','export'], {input:source});
console.log(result.dot);

```
For more information about how to write an application using the Argdown parser, visit the [argdown-parser repository](https://github.com/christianvoigt/argdown-parser).
