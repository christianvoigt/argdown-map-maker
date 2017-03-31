import * as _ from 'lodash';

class DotExport{
  set config(config){
    this.settings = _.defaults(config ||{}, {
      useHtmlLabels : true,
      onlyTitlesInHtmlLabels: false,
      graphname: 'Argument Map',
      lineLength: 25
    });
  }
  constructor(config){
    this.name = "DotExport";
    this.config = config;
  }
  run(data){
    let dot = "digraph \""+this.settings.graphname+"\" {\n\n";

    for(let node of data.map.nodes){
      let element;
      if(node.type == "statement"){
        element = data.statements[node.title];
      }else{
        element = data.arguments[node.title];
      }
      let label = "";
      if(this.settings.useHtmlLabels){
        label = this.escapeQuotesForDot(node.title);
        let labelArray = this.fold(label, this.settings.lineLength, true);
        label = labelArray.join('<br/>');
        label = "<<FONT FACE=\"Arial\" POINT-SIZE=\"8\"><TABLE BORDER=\"0\" CELLSPACING=\"0\"><TR><TD ALIGN=\"center\"><B>"+label+"</B></TD></TR>";
        if(!this.settings.onlyTitlesInHtmlLabels){
          let lastMember;
          if(node.type == "statement"){
            lastMember = _.last(element.members);
          }else{
            lastMember = _.last(element.descriptions);
          }
          if(lastMember){
            let content = lastMember.text;
            if(content){
              content = this.escapeQuotesForDot(content);
              let contentArray = this.fold(content, this.settings.lineLength, true);
              content = contentArray.join('<br/>');
              label += "<TR><TD ALIGN=\"center\">"+content+"</TD></TR>";
            }
          }
        }
        label += "</TABLE></FONT>>";
      }else{
        label = "\""+this.escapeQuotesForDot(node.title)+"\"";
      }
      if(node.type == "statement"){
        dot += "  "+node.id + " [label="+label+", shape=\"box\", style=\"filled,rounded,bold\", color=\"#63AEF2\", fillcolor=\"white\", labelfontcolor=\"white\", type=\""+node.type+"\"];\n";
      }else{
        dot += "  "+node.id + " [label="+label+", shape=\"box\", style=\"filled,rounded\", fillcolor=\"#63AEF2\",  type=\""+node.type+"\"];\n";
      }
    }

    dot +="\n\n";

    for(let edge of data.map.edges){
      let color = "green";
      if(edge.type == "attack"){
        color = "red";
      }
      let attributes = "color=\""+color+"\", type=\""+edge.type+"\"";
      dot += "  "+edge.from.id + " -> " + edge.to.id + " ["+attributes+"];\n";
    }

    dot += "\n}";

    data.dot = dot;
    return data;
  }
  escapeQuotesForDot(str){
    return str.replace(/\"/g,'\\\"');
  }


  //http://jsfiddle.net/jahroy/Rwr7q/18/
  //http://stackoverflow.com/questions/17895039/how-to-insert-line-break-after-every-80-characters
  // Folds a string at a specified length, optionally attempting
  // to insert newlines after whitespace characters.
  //
  // s          -  input string
  // n          -  number of chars at which to separate lines
  // useSpaces  -  if true, attempt to insert newlines at whitespace
  // a          -  array used to build result
  //
  // Returns an array of strings that are no longer than n
  // characters long.  If a is specified as an array, the lines
  // found in s will be pushed onto the end of a.
  //
  // If s is huge and n is very small, this method will have
  // problems... StackOverflow.
  //

  fold(s, n, useSpaces, a) {
    if(!s)
      return [];

      a = a || [];
      if (s.length <= n) {
          a.push(s);
          return a;
      }
      var line = s.substring(0, n);
      if (! useSpaces) { // insert newlines anywhere
          a.push(line);
          return this.fold(s.substring(n), n, useSpaces, a);
      }
      else { // attempt to insert newlines after whitespace
          var lastSpaceRgx = /\s(?!.*\s)/;
          var idx = line.search(lastSpaceRgx);
          var nextIdx = n;
          if (idx > 0) {
              line = line.substring(0, idx);
              nextIdx = idx;
          }
          a.push(line);
          return this.fold(s.substring(nextIdx), n, useSpaces, a);
      }
  }

}
module.exports = {
  DotExport: DotExport
}
