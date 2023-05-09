export class Connection {
    constructor(id, fromNode, toNode) {
      this.id = id;
      this.fromNode = fromNode;
      this.toNode = toNode;
      this.source = fromNode.getId();
      this.target = toNode.getId();
    }
  
    updateConnectionProperties(properties) {
        Object.assign(this, properties);
    }

    getId() {
        return this.id;
    }
    
    getFromNode() {
        return this.fromNode;
    }
    
    getToNode() {
        return this.toNode;
    }

    setFromNode(fromNode) {
        this.fromNode = fromNode;
        this.source = fromNode.getId();
    }

    setToNode(toNode) {
        this.toNode = toNode;
        this.target = toNode.getId();
    }

    isEqual(otherConnection) {
        if (otherConnection instanceof Connection) {
            return this.fromNode.getId() === otherConnection.fromNode.getId() &&
                this.toNode.getId() === otherConnection.toNode.getId();
        }
        return false;
    }
} 
