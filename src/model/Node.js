class Node{
  constructor(nodeType, title, id){
    this.type = nodeType;
    this.title = title;
    this.id = id;
  }
  toJSON(){
    let node = {
      id: this.id,
      title: this.title,
      type: this.type,
      labelTitle: this.labelTitle,
      labelText: this.labelText
    }
    return node;
  }
}
module.exports = {
  Node: Node
}
