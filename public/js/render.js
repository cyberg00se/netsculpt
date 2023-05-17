function renderNeuralNetworkModelD3(model) {
    console.log(model);

    const canvas = document.getElementById('editor-container');
    while (canvas.lastChild) {
        canvas.removeChild(canvas.lastChild);
    }
    if (!model) {
        return Promise.resolve();
    }

    try {
        var graph = new dagreD3.graphlib.Graph({compound:true}).setGraph({});

        for(const nodeModel of model.nodes) { 
            const label = `${nodeModel.getId()}\n${nodeModel.getType()}\n${JSON.stringify(nodeModel.getAttributes())}`;
            const nodeClass = `node-${nodeModel.getType()}`;
            graph.setNode(nodeModel.getId(), { 
                label,  
                rx: 5,
                ry: 5,
                padding: 10,
                class: `node ${nodeClass}`
            });
        };
        for(const linkModel of model.connections) { 
            graph.setEdge(linkModel.source, linkModel.target, {
                class: 'edgePath',
                curve: d3.curveCardinal.tension(1),
                arrowhead: 'undirected',
            });
        };

        const svg = d3.select('#editor-container');
        const inner = svg.append('g');
        
        var zoom = d3.zoom().on("zoom", function(event) {
            inner.attr("transform", event.transform);
        });;
        svg.call(zoom);

        var render = new dagreD3.render();
        render(inner, graph);

        return;
    } catch (error) {
        return Promise.reject(error);
    }
}

const renderNeuralNetworkModel = renderNeuralNetworkModelD3;

export { renderNeuralNetworkModel };
