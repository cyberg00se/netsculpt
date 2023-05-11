import * as parser from './parsers/parser.js';
import { Node } from "./models/Node.js";

export default new Vuex.Store({
    state: {
      currentModel: null
    },
    mutations: {
      setCurrentModel (state, model) {
        state.currentModel = model
      },
      addNode (state, { nodeId, nodeName, nodeType, inputs, outputs, attributes }) {
        const newNode = new Node(
          nodeId,
          nodeType,
          nodeName,
          inputs.filter(x => x !== ""),
          outputs.filter(x => x !== ""),
          attributes
        );
        state.currentModel.addNode(newNode);
      },
      deleteNode (state, id) {
        state.currentModel.removeNode(id);
      }
    },
    actions: {
      async loadModelFromFile ({ commit }, file) {
        const result = await parser.parseModelFromFile(file);
        commit('setCurrentModel', result)
        return result;
      }
    },
    getters: {
      getModel: state => state.currentModel
    }
});
