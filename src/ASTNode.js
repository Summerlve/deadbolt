class Node {
    constructor(type, name) {
        this.type = type;
        this.name = name;
    }
}

class RootNode extends Node {
    constructor(body = []) {
        super("RootNode", "RootNode");
        this.body = body;
    }
}

class RelationshipNode extends Node {
    constructor(name, params = []) {
        super("Relationship", name);
        this.params = params;
    }
}

class AdvancedNode extends Node {
    constructor(name, value) {
        super("AdvancedNode", name);
        this.value = value;
    }
}

class SingleNode extends Node {
    constructor(name, value) {
        super("SingleNode" ,name);
        this.value = value;
    }
}

module.exports.Node = Node;
module.exports.RootNode = RootNode;
module.exports.RelationshipNode = RelationshipNode;
module.exports.AdvancedNode = AdvancedNode;
module.exports.SingleNode = SingleNode;
