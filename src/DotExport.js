import * as _ from 'lodash';

class DotExport{
  set config(config){
    this.settings = _.defaults(config ||{}, {
      useHtmlLabels : true,
      graphname: 'Argument Map',
      lineLength: 25,
      groupColors: ["#DADADA","#BABABA","#AAAAAA"],
      rankDir: 'TB',
      argumentLabelMode: 'hide-untitled', //hide-untitled | title | description
      statementLabelMode: 'hide-untitled', //hide-untitled | title | text
    });
  }
  constructor(config){
    this.name = "DotExport";
    this.config = config;
  }
  run(data){
    this.groupCount = 0;
    let dot = "digraph \""+this.settings.graphname+"\" {\n\n";
    if(this.settings.rankDir){
      dot += "rankDir = "+this.settings.rankDir+";\n";
    }

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
    
    let title = node.title;
    let text = null;
    let label = "";
    if(node.type == "argument"){
      let lastDescription = _.last(element.descriptions);
      if(lastDescription){
        text = lastDescription.text;        
      }
      if(this.settings.argumentLabelMode == 'hide-untitled'){
        label = this.getLabel(title, text);        
      }else if(this.settings.argumentLabelMode == 'title'){
        label = this.getLabel(title, null);
      }else{
        label = this.getLabel(null, text);
      }
      dot += "  "+node.id + " [label="+label+", shape=\"box\", style=\"filled,rounded\", fillcolor=\"#63AEF2\",  type=\""+node.type+"\"];\n";
    }else if(node.type == "statement"){
      let lastMember = _.last(element.members);
      if(lastMember){
        text = lastMember.text;
      }
      if(this.settings.statementLabelMode == 'hide-untitled'){
        label = this.getLabel(title, text);        
      }else if(this.settings.statementLabelMode == 'title'){
        label = this.getLabel(title, null);
      }else{
        label = this.getLabel(null, text);
      }      
      dot += "  "+node.id + " [label="+label+", shape=\"box\", style=\"filled,rounded,bold\", color=\"#63AEF2\", fillcolor=\"white\", labelfontcolor=\"white\", type=\""+node.type+"\"];\n";
    }        
    return dot;
  }
  getLabel(title, text){
    let label = "";
    if(this.settings.useHtmlLabels){
      label += "<<FONT FACE=\"Arial\" POINT-SIZE=\"8\"><TABLE BORDER=\"0\" CELLSPACING=\"0\">";
      if(!_.isEmpty(title) && !title.startsWith("Untitled")){
          let titleLabel = this.foldAndEscape(title);
          titleLabel = "<TR><TD ALIGN=\"center\"><B>"+titleLabel+"</B></TD></TR>";
          label += titleLabel;
      }
      if(!_.isEmpty(text)){
        let textLabel = this.foldAndEscape(text);
        textLabel = "<TR><TD ALIGN=\"center\">"+textLabel+"</TD></TR>";
        label += textLabel;
      }
      label += "</TABLE></FONT>>";
    }else{
      label = "\""+this.escapeQuotesForDot(title)+"\"";
    }    
    return label;
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
