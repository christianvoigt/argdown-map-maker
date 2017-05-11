import * as _ from 'lodash';

class DotExport{
  set config(config){
    this.settings = _.defaults(config ||{}, {
      useHtmlLabels : true,
      onlyTitlesInHtmlLabels: false,
      graphname: 'Argument Map',
      lineLength: 25,
      groupColors: ["#DADADA","#BABABA","#AAAAAA"]
    });
  }
  constructor(config){
    this.name = "DotExport";
    this.config = config;
  }
  run(data){
    this.groupCount = 0;
    let dot = "digraph \""+this.settings.graphname+"\" {\n\n";

    for(let node of data.map.nodes){
      dot += this.exportNodesRecursive(node, data);
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
  exportNodesRecursive(node, data){
    let dot = "";
    let element;
    if(node.type == "statement"){
      element = data.statements[node.title];
    }else if(node.type == "argument"){
      element = data.arguments[node.title];
    }else if(node.type == "group"){
      this.groupCount++;
      let dotGroupId = "cluster_"+this.groupCount;
      let groupLabel = node.title;
      if(this.settings.useHtmlLabels){
        groupLabel = this.foldAndEscape(groupLabel);        
        groupLabel = "<<FONT FACE=\"Arial\" POINT-SIZE=\"10\">"+groupLabel+"</FONT>>";
      }else{
        groupLabel = "\""+this.escapeQuotesForDot(groupLabel)+"\"";
      }
      let groupColor = "#CCCCCC";
      if(this.settings.groupColors && this.settings.groupColors.length > 0){
        if(this.settings.groupColors.length >= node.level){
          groupColor = this.settings.groupColors[node.level];                  
        }else{
          groupColor = this.settings.groupColors[this.settings.groupColors.length - 1];
        }
      }
      
      dot += "\nsubgraph "+dotGroupId+" {\n";
      dot += "  label = "+groupLabel+";\n";
      dot += "  color = \""+groupColor+"\";\n";
      dot += "  style = filled;\n\n";
      
      for(let child of node.nodes){
        dot += this.exportNodesRecursive(child, data);
      }
      dot += "\n}\n\n";
      return dot;
    }
    
    let label = "";
    if(this.settings.useHtmlLabels){
      label = this.foldAndEscape(node.title);
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
            content = this.foldAndEscape(content);
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
    
    
    return dot;
  }
  foldAndEscape(str){
    let strArray = this.fold(str, this.settings.lineLength, true);
    for(let i = 0; i < strArray.length; i++){
      strArray[i] = this.escapeForHtml(strArray[i]);
    }
    return strArray.join('<br/>');
  }
  escapeForHtml(s) {
      return s.replace(/[^0-9A-Za-z ]/g, function(c) {
          return "&#" + c.charCodeAt(0) + ";";
      } );
  }
  escapeQuotesForDot(str){
    return str.replace(/\"/g,'\\"');
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
