function testRenderNeuralNetworkModel(model) {
    console.log(model);
    try {
        const canvas = document.getElementById('editor-container');
        while (canvas.lastChild) {
            canvas.removeChild(canvas.lastChild);
        }
        if (!model) {
            return Promise.resolve();
        }

        model.nodes.forEach(node => {
            var newNode = document.createElement("div");
            newNode.className = "node"; 
            newNode.id = node.id;
          
            var nodeTexts = [
                { label: "ID", value: node.getId() },
                { label: "Name", value: node.getName() },
                { label: "Type", value: node.getType() },
                //{ label: "Inputs", value: node.getInputs() },
                //{ label: "Outputs", value: node.getOutputs() },
                { label: "Attributes", value: node.getAttributes() },
            ];
          
            nodeTexts.forEach(nodeText => {
                var textElement = document.createElement("div");
                textElement.className = "node-text"; 
                textElement.textContent = `${nodeText.label}: ${nodeText.value}`;
                newNode.appendChild(textElement);
            });
          
            canvas.appendChild(newNode);
        });
        model.connections.forEach(connection => {
            var textElement = document.createElement("div"); 
            textElement.textContent = `ID:${connection.id} From:${connection.getFromNode().getId()} To:${connection.getToNode().getId()}`;
            canvas.appendChild(textElement);
        });
        return;
    } catch (error) {
        return Promise.reject(error);
    }
}

function renderNeuralNetworkModelGoJS(model) {
    console.log(model);

    const canvas = document.getElementById('editor-container');
    if (canvas.hasChildNodes()) {
        const diagram = go.Diagram.fromDiv(canvas);
        if (typeof diagram !== 'undefined' && diagram !== null) {
            diagram.div = null;
        }
    }
    if (!model) {
        return Promise.resolve();
    }

    try {
        var diagram = new go.Diagram("editor-container",
            { 
                "undoManager.isEnabled": true,
                layout: new go.LayeredDigraphLayout({ 
                    columnSpacing: 30, 
                    layerSpacing: 35,
                    direction: 90
                })
            });

        diagram.nodeTemplate =
            new go.Node("Horizontal",
                { background: "wheat" })
                .add(new go.TextBlock(
                    "empty_id",
                    { margin: 12, stroke: "darkorange", font: "bold 16px sans-serif" })
                    .bind("text", "text"));

        diagram.linkTemplate =
            new go.Link(
                { routing: go.Link.Orthogonal, corner: 5 })
                .add(new go.Shape({ strokeWidth: 3, stroke: "darkorange" }));

        const displayNodes = model.nodes.map(nodeModel => { 
            return { 
                key: nodeModel.getId(),
                text: `${nodeModel.getId()}\n${nodeModel.getType()}\n${JSON.stringify(nodeModel.getAttributes())}`,
                type: nodeModel.getType(),
                attr: nodeModel.getAttributes()
            } 
        });
        const displayLinks = model.connections.map(linkModel => { 
            return { 
                from: linkModel.source,
                to: linkModel.target
            } 
        });
        diagram.model = new go.GraphLinksModel(displayNodes, displayLinks);

        return;
    } catch (error) {
        return Promise.reject(error);
    }
}

const renderNeuralNetworkModel = renderNeuralNetworkModelGoJS;

export { renderNeuralNetworkModel };
