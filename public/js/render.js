import * as uiUtils from './utils/uiUtils.js';

const render = new dagreD3.render();

function nodeClickHandler() {
    const nodeId = this.getAttribute('id');
    uiUtils.setupModal("node-content-modal", "node-content-close", [], [], [], ["node-content-textarea"]);
    uiUtils.setupNodeContentTextarea(`get-${nodeId}-content`, "node-content-textarea", nodeId);
}

function renderNeuralNetworkModelD3(model) {
    console.log(model);

    const oldNodeElements = document.getElementsByClassName('node');
    for (const nodeElement of oldNodeElements) {
        nodeElement.removeEventListener('click', nodeClickHandler);
    }

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
            const nodeAttributes = JSON.parse(JSON.stringify(nodeModel.getAttributes()));
            if(nodeAttributes.content) {
                nodeAttributes.content = "...expand";
            } else if(nodeAttributes.value?.content) {
                nodeAttributes.value.content = "...expand";
            }
            
            const label = `${nodeModel.getId()}\n${nodeModel.getType()}\n${JSON.stringify(nodeAttributes)}`;
            const nodeClass = `node-${nodeModel.getType()}`;
            graph.setNode(nodeModel.getId(), { 
                label,  
                rx: 5,
                ry: 5,
                padding: 10,
                class: `node ${nodeClass}`,
                id: nodeModel.getId()
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

        render(inner, graph);

        const nodeElements = document.getElementsByClassName('node');
        for (const nodeElement of nodeElements) {
            nodeElement.addEventListener('click', nodeClickHandler);
        }

        return;
    } catch (error) {
        return Promise.reject(error);
    }
}

const renderNeuralNetworkModel = renderNeuralNetworkModelD3;

export { renderNeuralNetworkModel };
