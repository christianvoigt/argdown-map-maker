class Edge{
  constructor({
              id = null,
              from = null, //node
              to = null, //node
              fromStatement = null, //statement
              toStatement = null, //statement
              type = null,
              status = null
            }){
              this.id = id;
              this.from = from;
              this.to = to;
              this.fromStatement = fromStatement;
              this.toStatement = toStatement;
              this.type = type;
              this.status = status;
  }
  toJSON(){
    let edge = {
      id: this.id,
      type: this.type,
      status: this.status
    }
    if(this.from){
      edge.from = this.from.id;
    }
    if(this.to){
      edge.to = this.to.id;
    }
    if(this.fromStatement){
      edge.fromStatement = this.fromStatement.title;
    }
    if(this.toStatement){
      edge.toStatement = this.toStatement.title;
    }
  }
}
module.exports = {
  Edge: Edge
}
