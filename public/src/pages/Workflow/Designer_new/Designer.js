import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactFlow, {
    removeElements,
    addEdge,
    MiniMap,
    Controls,
    Background,
} from 'react-flow-renderer';
import Sidebar from './Sidebar';


const position = { x: 0, y: 0 };
const edgeType = 'smoothstep';
const style = { background: "#ccc", width: 50, height: 50, borderRadius: 50 };
class Designer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            elements: [
                {
                    id: '1',
                    type: 'input',
                    data: {
                        label: (
                            <>
                                Start
                            </>
                        ),
                    },
                    style: style,
                    position: { x: 250, y: 0 },
                },
                {
                    id: '2',
                    data: {
                        label: (
                            <>
                                This is a <strong>default node</strong>
                            </>
                        ),
                    },
                    position: { x: 100, y: 100 },
                },
                {
                    id: '3',
                    data: {
                        label: (
                            <>
                                This one has a <strong>custom style</strong>
                            </>
                        ),
                    },
                    position: { x: 400, y: 100 },
                    style: {
                        background: '#D6D5E6',
                        color: '#333',
                        border: '1px solid #222138',
                        width: 180,
                    },
                },
                {
                    id: '4',
                    position: { x: 250, y: 200 },
                    data: {
                        label: 'Another default node',
                    },
                },
                {
                    id: '5',
                    data: {
                        label: 'Node id: 5',
                    },
                    position: { x: 250, y: 325 },
                },
                {
                    id: '6',
                    type: 'output',
                    data: {
                        label: (
                            <>
                                An <strong>output node</strong>
                            </>
                        ),
                    },
                    position: { x: 100, y: 480 },
                },
                {
                    id: '7',
                    type: 'output',
                    data: { label: 'Another output node' },
                    position: { x: 400, y: 450 },
                },
                { id: 'e1-2', source: '1', target: '2', type: edgeType, animated: true },
                { id: 'e1-3', source: '1', target: '3', type: edgeType, animated: true },
                { id: 'e3-4', source: '3', target: '4', type: edgeType, animated: true },
                { id: 'e4-5', source: '4', target: '5', type: edgeType, animated: true },
                { id: 'e5-6', source: '5', target: '6', type: edgeType, animated: true },
                { id: 'e5-7', source: '5', target: '7', type: edgeType, animated: true },
            ],
            reactFlowInstance: null
        };

    }

    onConnect = (params) => {
        console.log(params);
    }

    onElementsRemove = (elementsToRemove) => {

    }


    render() {
        console.log("state: ", this.state);
        const graphStyles = { width: "100%", height: "800px" };
        const elements = this.state.elements;
        return (
            <div>
                <div className="dndflow">
                    {/* <ReactFlowProvider>
                        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                            <ReactFlow
                                style={graphStyles}
                                elements={elements}
                                onConnect={this.onConnect}
                                onElementsRemove={onElementsRemove}
                                onLoad={onLoad}
                                onDrop={onDrop}
                                onDragOver={onDragOver}>
                                <Controls />
                            </ReactFlow>
                        </div>
                        <Sidebar />
                    </ReactFlowProvider> */}
                </div >
            </div >

        );
    }
}

const mapStateToProps = (state) => {
    return {}
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(Designer)
