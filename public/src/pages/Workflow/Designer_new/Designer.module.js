import { config }  from '../../../utils/workflow.config';
import * as Designer from './Designer';

export const overlayPlus = (source, target, position = '') => {
    let overlay = {
        create: (component) => {
            let plusIcon = document.createElement('div');
            plusIcon.classList.add('overlay-plus');
            plusIcon.innerHTML = '<div class="dropable-zone unselectable" data-position="' + position + '" data-source="' + source + '" data-target="' + target + '"><span class="fa fa-plus fc-task-placeholder"></span></div>';
            // //console.log(plusIcon)
            return plusIcon;
        },
        location: 0.5,
        id: "overlayPLus"
    }
    // //console.log(overlay)
    return overlay
}

// if enough space for new node -> no need move flowchart down
export const isFlowchartWillMove = (nodes, parent, position, newNode, source, target) => {
    let sourceH = nodes[source].element.offsetHeight;
    let targetH = nodes[target].element.offsetHeight;

    let currentGap = nodes[target].element.offsetTop - nodes[source].element.offsetTop - sourceH;
    let expectGap = config.nodeGap;
    if (newNode.branch >= 1) expectGap += config.nodeGap * 2 + config.nodeSizeDefault / 2;
    // else if (newNode.branch === 1) expectGap += config.nodeGap*2 + config.nodeSizeDefault;
    else expectGap += config.nodeSizeDefault + config.nodeGap;
    //console.log('0206 ', expectGap, currentGap)
    return expectGap > currentGap;
}

export const shouldLoopNodeExpand = (loopNode, jsPlumbInstance) => {
    //console.log('shouldLoopNodeExpand ', loopNode)
    let loopNodeP = loopNode.split('-');
    let endNode = `${loopNodeP[0]}-end-${loopNodeP[1]}`;
    let leftbot = `${loopNodeP[0]}-leftbot-${loopNodeP[1]}`;
    let connection = jsPlumbInstance.getConnections({ source: leftbot, target: endNode })[0].connector;
    let bBox = connection.svg.getBBox();
    //console.log(bBox.width)
    return bBox.width <= 100 + config.nodeWidthDefault / 2 + 10;
}

export const isExpandBranchNode = (nodes, parent, jsPlumbInstance) => {
    //console.log('isExpandBranchNode', nodes, parent, nodes[parent])
    let nextNode = nodes[parent].next.left;
    // //console.log('2605',nodes, parent, nextNode, jsPlumbInstance.getConnections({source: parent, target: nextNode}))
    let connection = jsPlumbInstance.getConnections({ source: parent, target: nextNode })[0].connector;
    //console.log('isExpandBranchNode', connection)
    let bBox = connection.svg.getBBox();
    // //console.log('2605', connection, parent, nextNode, bBox.width);
    return (bBox.width <= config.nodeWidthDefault / 2 + 100);
}

function isExpandWhileNode(nodes, parent, jsPlumbInstance) {

}

export const getWidthOfGroup = (nodes, node) => {
    let endId = `node-end-${nodes[node].count}`;
    let cItem = nodes[node].next[0];
    let right = Number.MIN_SAFE_INTEGER;
    let left = Number.MAX_SAFE_INTEGER;
    let leftChange = false;
    let rightChange = false;
    //console.log(cItem, endId, node, nodes[node])
    while (cItem !== endId) {
        //console.log('0106 getWidthOfGroup', node, cItem)
        if (nodes[cItem].branch === 1) {
            let l = nodes[`node-lefttop-${nodes[node].count}`].element.offsetLeft;
            let r = nodes[`node-righttop-${nodes[node].count}`].element.offsetLeft;
            if (l < left) {
                left = l;
                leftChange = true;
            }
            if (r > right) {
                right = r;
                rightChange = true;
            }
        }
        else if (nodes[cItem].branch >= 2) {
            nodes[cItem][0].forEach(l => {
                let v = nodes[l].element.offsetLeft;
                if (v < left) {
                    leftChange = true;
                    left = v;
                }
            });
            nodes[cItem][nodes[cItem].branch - 1].forEach(r => {
                let v = nodes[r].element.offsetLeft;
                //console.log('====> r ', r, nodes[r].type, Designer.SPECIAL_END_NODE, Designer.SPECIAL_CORNER_NODE)
                if (nodes[r].type !== Designer.SPECIAL_END_NODE && nodes[r].type !== Designer.SPECIAL_CORNER_NODE) {
                    //console.log('here*******', v)
                    v += config.nodeWidthDefault;
                }
                //console.log(v, right)
                if (v > right) {
                    rightChange = true;
                    right = v;
                }
            });

        }
        if (nodes[cItem].branch >= 1) {
            cItem = nodes[`node-end-${nodes[cItem].count}`].next;
        }
        else {
            cItem = nodes[cItem].next;
        }
    }
    //console.log(leftChange, rightChange)
    return ({
        left: leftChange ? left : false,
        right: rightChange ? right : false
    });
    //console.log('getWidthOfGroup ', left, right)
}

export const addTaskMenuIcon = (task) => {
    let menu = document.createElement('div');
    menu.innerHTML =
        `<div class="task-iconmenu-container">
            <div class="task-iconmenu-inner" >
                <div class="task-iconmenu-btn fa fa-ellipsis-h">
                </div>
                <div class="task-iconmenu-board">
                    <div class="task-iconmenu-board-inner" data-task="${task.getAttribute('id')}">
                        <div class="task-iconmenu-item" data-btn="copy"><span class="fa fa-copy"></span>Copy</div>
                        <div class="task-iconmenu-item" data-btn="rename"><span class="fa fa-pencil"></span>Rename</div>
                        <div class="task-iconmenu-item" data-btn="disabled"><span class="fa fa-ban"></span>Disabled/Enabled</div>
                        <div class="task-iconmenu-item" data-btn="delete"><span class="fa fa-trash"></span>Delete</div>
                    </div>
                </div>
            </div>
        </div>`;
    task.append(menu);
}

export const getTaskData = (task, nodes) => {
    //console.log('getTaskData ', task, nodes)
    let next = task.next;
    let previous = task.previous;
    //console.log(next, previous, Designer.NODE_END, Designer.NODE_START)
    if (next === Designer.NODE_END) next = null;
    else if (typeof next === 'object' && next !== null) {
        next = nodes[`node-end-${task.count}`].next;
        if (next === Designer.NODE_END) next = null;
    }
    else if (next && nodes[next].type === Designer.SPECIAL_CORNER_NODE) next = null;

    if (previous === Designer.NODE_START) previous = null;
    else if (previous && nodes[previous].type === Designer.SPECIAL_END_NODE) previous = nodes[previous].parent;
    else if (previous && nodes[previous].type === Designer.SPECIAL_CORNER_NODE) previous = null;

    if (next) next = Number(next.split('-')[1]);
    if (previous) previous = Number(previous.split('-')[1]);

    return {
        "number": task.number,
        "next": next,
        "previous": previous,
        "parent": task.parent,
        "configuration": task.configuration,
        "branches": task.branches,
        "taskType": task.taskType,
        "datatype": task.datatype
    }
}

export const toggleDisabledTask = (taskId, tasks) => {
    if (tasks[taskId].configuration.isDisabled) tasks[taskId].element.classList.remove('is-disabled');
    else tasks[taskId].element.classList.add('is-disabled');

    tasks[taskId].configuration.isDisabled = !tasks[taskId].configuration.isDisabled;
}

export const renameTask = (taskId, tasks, value) => {

    tasks[taskId].configuration.actionName = value;
    tasks[taskId].schema.title = value;
    document.getElementById(taskId).querySelector('.task-palette-title').innerHTML = value;
}

function getJsonDataFromFile() {

}

export const generateGuid = () => {
    var d = new Date().getTime();
    if (window.performance && typeof window.performance.now === "function") {
        d += performance.now();; //use high-precision timer if available
    }
    var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return guid;
}

export const getFileNameParam = () => {
    let search = window.location.search;
    if (!search) return null;
    search = search.split('?')[1];

    search = search.split('&');
    //console.log('search ', search)
    search = search.map(e => e.split('='));
    //console.log('search ', search)
    search.filter(s =>  s[0] === 'filename' );
    //console.log('search ', search)
    return search[0][1];
}

// module.exports = {
//     overlayPlus,
//     isFlowchartWillMove,
//     isExpandBranchNode,
//     shouldLoopNodeExpand,
//     getWidthOfGroup,
//     addTaskMenuIcon,
//     toggleDisabledTask,
//     renameTask,
//     getTaskData,
//     generateGuid,
//     getFileNameParam
// }
