import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isEmptyString, Toast } from '../../../utils/helperFunctions';
import ModalConfirmation from '../../../components/ModalConfirmation';
import { config } from '../../../utils/workflow.config';
import { getQueryString, GetAppName } from "../../../utils/helperFunctions";
import auth from "../../../actions/auth";
import axios from "../../../utils/axiosService";
import { GetWorkflow } from "../../../actions/workflow";
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import moment from 'moment';
import WorkflowDesignSetup from '../WorkflowDesignSetup';
import {
    overlayPlus,
    isFlowchartWillMove,
    isExpandBranchNode,
    shouldLoopNodeExpand,
    getWidthOfGroup,
    addTaskMenuIcon,
    toggleDisabledTask,
    renameTask,
    getTaskData,
    generateGuid,
    getFileNameParam
} from './Designer.module';


import './Designer.scss';
// helper
import logger from '../helper/logger.helper';
import { downloadJSON } from '../helper/json.file.helper';
// component
import { Button } from 'reactstrap'
import { Switch, Route } from 'react-router-dom';
import TaskPalette from '../component/TaskPalette';
import DesignerForm from '../component/DesignerForm';
import PopupForm from '../component/PopupForm';
import JsonFileInput from '../component/JsonFileInput';
import $ from 'jquery';
import WorkflowSetting from '../component/WorkflowSetting';
import PermissionSetting from '../component/PermissionSetting';
import WorkflowSettingVariable from '../component/WorkflowSettingVariable';
import { jsPlumb } from 'jsplumb';
import { saveFlowchart, loadFileFromServer, callAWebService } from '../../../actions/workflow';
import { updateWorkflowSetting, updateWorkflowVariables, removeVariable, updateVariable, addVariable, toggleSettingVariableForm } from '../../../actions/workflowSetting.action';
// actions
export const NODE_START = 'node-start';
export const NODE_END = 'node-end';
export const SPECIAL_END_NODE = 'special_end_node';
export const SPECIAL_CORNER_NODE = 'SPECIAL_CORNER_NODE';

let taskConfig = {};
Object.values(config.taskType).map(s => {
    taskConfig = Object.assign(taskConfig, s)
});
let _count = 0; // every node has a unique name node-${_count}
let _gap = config.nodeGap + config.nodeSizeDefault;
let _xValue = window.innerWidth * 0.4 - 20;
class Designer extends Component {


    constructor(props) {
        super(props);
        this.elements = [];
        this.scale = 1;
        this.xLast = 0;  // last x location on the screen
        this.yLast = 0;  // last y location on the screen
        this.xImage = 0; // last x location on the image
        this.yImage = 0; // last y location on the image
        this.nodes = {};
        this.IsMainBranch = true;
        this.startDropPosition = { x: null, y: null };
        this.containerPosition = { x: 0, y: 0 };
        this.onDragContainer = false;
        this.variables = {};
        this.curCopyTask = false;
        this.curFocusTask = false;
        this.curTaskCallService = null;
        this.flexibleNode = {
            id: null,
            jsonData: null
        }
        this.state = {
            rolloutConfirmation: false,
            selected_item_version: null,
            newWorkflowSetup: false,
            workflow_versions: [],
            currentTab: config.tabs[1].id,
            taskPalette: {
                display: true,
                x: 0,
                y: 0
            },
            selectedVersion: '',
            modalVestionHistoryLog: false,
            paletteActive: false,
            tabs: config.tabs,
            currentNodeFocused: null,
            popupRenameFormDisplay: false,
            jsonFileInputDisplay: false,
            permission: { read: [], readAl: [], write: [], design: [] },
            options: []
        }
        this.workflowSetting = {
            variables: []
        }
        this.currentFocusOverlay = null;
        this.handleClickOverlay = this.handleClickOverlay.bind(this);
        this.togglePalette = this.togglePalette.bind(this);
        this.moveDownFlowchart = this.moveDownFlowchart.bind(this);
        this.nodes = {};
        this.exportFlowchart = this.exportFlowchart.bind(this);
        this.saveFlowchart = this.saveFlowchart.bind(this);
        this.publishFlowchart = this.publishFlowchart.bind(this);
        this.importFlowchart = this.importFlowchart.bind(this);
        this.addTaskToDropZone = this.addTaskToDropZone.bind(this);
        this.updateFormValue = this.updateFormValue.bind(this);
        this.updateFormVar = this.updateFormVar.bind(this);
        this.addEndPointToNode = this.addEndPointToNode.bind(this);
        this.connectNodes = this.connectNodes.bind(this);
        this.expandFlowchart = this.expandFlowchart.bind(this);
        this.getDataBranchTask = this.getDataBranchTask.bind(this);
        this.getDataBranchNode = this.getDataBranchNode.bind(this);
        this.addEndpoints = this.addEndpoints.bind(this);
        this.hoverTaskAction = this.hoverTaskAction.bind(this);
        this.deleteTaskById = this.deleteTaskById.bind(this);
        this.getOverlayBySourceTarget = this.getOverlayBySourceTarget.bind(this);
        this.narrowFlowchart = this.narrowFlowchart.bind(this);
        this.moveUpFlowchart = this.moveUpFlowchart.bind(this);
        this.handleRenameTask = this.handleRenameTask.bind(this);
        this.importedJsonFile = this.importedJsonFile.bind(this);
        this.reRenderFromFile = this.reRenderFromFile.bind(this);
        this.resetFlowchart = this.resetFlowchart.bind(this);
        this.getVariablesHardcode = this.getVariablesHardcode.bind(this);
        this.flowchartToJson = this.flowchartToJson.bind(this);
        this.selectTab = this.selectTab.bind(this);
        this.handleChangeWorkflowSetting = this.handleChangeWorkflowSetting.bind(this);
        this.handleChangePermissionSetting = this.handleChangePermissionSetting.bind(this);
        this.removeBranch = this.removeBranch.bind(this);
        this.addNewBranch = this.addNewBranch.bind(this);
        this.reRenderBranchTask = this.reRenderBranchTask.bind(this);
        this.removeAllEndpointOfNode = this.removeAllEndpointOfNode.bind(this);
        this.handleSubmitTaskForm = this.handleSubmitTaskForm.bind(this);
    }

    componentDidMount = async () => {
        var { options } = this.state;
        let { isNewWorkFlow } = this.props;
        this.onload();
        if (this.props.user.User_data.isTenantUser) {
            const users = await axios.apis('GET', `/api/users`, auth.headers)
            options = users.map((member) => ({ value: member._id, label: member.email }));
        } else {
            options = this.props.user.User_data.team.members.map((member) => ({ value: member.id, label: member.email }));
            options.unshift({ value: this.props.user.User_data._id, label: this.props.user.User_data.email })
        }
        this.setState({ options, newWorkflowSetup: isNewWorkFlow });
    }

    onload = async () => {
        let self = this;
        this.fileLoadedFromServer = getFileNameParam;
        this.paletteContainer = document.getElementById('task-palette-container');
        // this.paletteContainer.style.height = (window.innerHeight - this.paletteContainer.offsetTop) + 'px';
        $('.task-palette-item').on('mousedown', e => {
            e.stopPropagation();
        });

        $('.task-palette-item').on('dragstart', function (event) {
            self.draged = event.target;
            event.stopPropagation();
        })

        $('.fc-task-palette-item').on('dragstart', function (event) {
            console.log(event.target);
            self.draged = event.target;
            event.stopPropagation();
        })

        $('.task-palette-item').on('drag', function (event) {
            event.stopPropagation();
        })

        // prevent dragenter and dragover if you want drop event fired
        document.addEventListener("dragenter", function (event) {
            // highlight potential drop target when the draggable element enters it
            if (event.target.className.indexOf('jtk-overlay') >= 0) {
                event.target.classList.add('onDroping');
            }
            event.stopPropagation();
        }, false);
        /* events fired on the drop targets */
        document.addEventListener("dragover", function (event) {
            // prevent default to allow drop
            event.preventDefault();
        }, false);

        document.addEventListener("dragleave", function (event) {
            event.stopPropagation();
            // reset background of potential drop target when the draggable element leaves it
            if (event.target.className.indexOf('jtk-overlay') >= 0) {
                event.target.classList.remove('onDroping');
            }
        }, false);

        document.addEventListener("dragend", function (event) {
            // reset the transparency

        }, false);

        document.addEventListener("drop", function (event) {
            let moveTask = false, taskId = "";
            // prevent default action (open as link for some elements)
            event.preventDefault();
            // move dragged elem to the selected drop target
            if (event.target.className.indexOf('jtk-overlay') >= 0) {
                event.target.classList.remove('onDroping');

                if (self.draged.getAttribute('datatype')) {
                    var datatype = JSON.parse(self.draged.getAttribute('datatype'))
                    if (datatype && datatype.fc) {
                        taskId = self.draged.getAttribute('id');
                        moveTask = true;
                    }
                }

                if (moveTask) {
                    self.addBranchTaskToPlaceHolder(taskId, event.target);
                    self.deleteTaskById(taskId);
                } else {
                    self.addTaskToDropZone(event.target, self.draged);
                }

                //When Node Move to other place then deleted old node
                self.draged = null;
            }

        }, false);

        document.addEventListener('click', e => {
            //console.log(e.target, document.getElementById('designer-form-container'))
            //console.log(e.target.childNodes)
            if (document.getElementById('designer-form-container') && document.getElementById('designer-form-container').contains(e.target)
                || e.target.className.indexOf('glyphicon-remove') >= 0
                || (e.target.childNodes.length && e.target.childNodes[0].className && e.target.childNodes[0].className.indexOf('glyphicon-remove') >= 0)) return;

            if (e.target.className.indexOf('task-iconmenu-item') >= 0 || e.target.parentElement.className.indexOf('task-iconmenu-item') >= 0) {
                let btn = e.target.className.indexOf('task-iconmenu-item') >= 0 ? e.target : e.target.parentElement;
                let btnType = btn.getAttribute('data-btn');
                let taskId = btn.parentElement.getAttribute('data-task');
                switch (btnType) {
                    case 'copy':
                        this.curCopyTask = taskId;
                        break;
                    case 'delete':
                        self.deleteTaskById(taskId);
                        break;
                    case 'rename':
                        this.curFocusTask = taskId;
                        self.setState({ popupRenameFormDisplay: true });
                        break;
                    case 'disabled':
                        toggleDisabledTask(taskId, this.nodes);
                        break;
                    default:

                }
                return
            }
            if (e.target.className.indexOf('fc-item') >= 0 || e.target.parentElement.className.indexOf('fc-item') >= 0) {
                let target = e.target.className.indexOf('fc-item') >= 0 ? e.target : e.target.parentElement;
                let targetId = target.getAttribute('id');
                // focus on NODE_END or NODE_START
                if (targetId === NODE_START || targetId === NODE_END) {
                    return self.setState({
                        currentNodeFocused: null
                    });
                }

                /*
                let dataStr = JSON.stringify(self.nodes[target.getAttribute('id')]);
                //////console.log('1806, variables ', this.variables)
                let varsList = [];
                let valList = [];
                Object.keys(self.variables).forEach(node => {
                    varsList = [
                        ...varsList,
                        ...Object.keys(self.variables[node])
                    ];
                    valList = [
                        ...valList,
                        ...Object.keys(self.variables[node]).map(key => self.variables[node][key])
                    ];

                });
                */

                var actionObj = self.nodes[target.getAttribute('id')];
                var vars = self.props.workflowSettingReducer.variables.map((v, i) => v.name)
                console.log(vars, actionObj)

                if (actionObj.schema.properties) {
                    Object.keys(actionObj.schema.properties).forEach(key => {
                        if (actionObj.schema.properties[key].enum && actionObj.schema.properties[key].enum[0] === "<WF_Variables_setting>") {
                            actionObj.schema.properties[key].enum = vars; //vars.map(v => `<<${v}>>`);
                            actionObj.schema.properties[key].enumNames = vars;
                        }
                    })
                }
                if (actionObj.schema.items && actionObj.schema.items.properties) {
                    Object.keys(actionObj.schema.items.properties).forEach(key => {
                        if (actionObj.schema.items.properties[key].enum && actionObj.schema.items.properties[key].enum[0] === "<WF_Variables_setting>") {
                            actionObj.schema.items.properties[key].enum = vars; //vars.map(v => `<<${v}>>`);
                            actionObj.schema.items.properties[key].enumNames = vars;
                        }
                    })
                }

                /*
                varsList = varsList.map((item, i) => `${i === 0 ? '' : '"'}${item}${i + 1 === varsList.length ? '' : '"'}`);
                valList = valList.map((val, i) => `${i === 0 ? '' : '"'}${val}${i + 1 === valList.length ? '' : '"'}`);
                console.log(varsList, valList)
                dataStr = dataStr.replace(/<WF_Variables>/g, varsList.join(',') || '');
                // dataStr = dataStr.replace(/<WF_Values>/g, valList.join(',') || '');
                let settingVar = self.props.workflowSettingReducer.variables.map((v, i) => v.name)
                settingVar = settingVar.map((v, i) => `${i === 0 ? '' : '"'}${v}${i + 1 === settingVar.length ? '' : '"'}`);
                self.settingVarDefaultValue = {};
                self.props.workflowSettingReducer.variables.forEach(v => {
                    self.settingVarDefaultValue[v.name] = v.defaultValue;
                });
                console.log('settingVar, settingVarDefaultValue ', settingVar)
                if (dataStr.indexOf('<WF_Variables_setting>')>0) {
                    dataStr = dataStr.replace(/<WF_Variables_setting>/g, settingVar.join(','));
                    dataStr = JSON.parse(dataStr);
                } else {
                    dataStr = JSON.parse(dataStr);
                }

                console.log(dataStr)
                if (dataStr.schema.properties) {
                    Object.keys(dataStr.schema.properties).forEach(key => {
                        if (dataStr.schema.properties[key].enum && dataStr.schema.properties[key].enum[0] === "<WF_Values>") {
                            dataStr.schema.properties[key].enum = valList;
                        }
                    })
                }
                if (dataStr.schema.items && dataStr.schema.items.properties) {
                    Object.keys(dataStr.schema.items.properties).forEach(key => {
                        if (dataStr.schema.items.properties[key].enum && dataStr.schema.items.properties[key].enum[0] === "<WF_Values>") {
                            dataStr.schema.items.properties[key].enum = valList;
                        }
                    })
                }
                */

                self.setState({
                    currentNodeFocused: actionObj //dataStr
                });
                return;
            }
            // not focusing on Node
            if (this.state.currentTab === 'workflowSetting') return;
            return self.setState({
                currentNodeFocused: null,
                ...e.target.className.indexOf('popupform-mask') >= 0 && { popupRenameFormDisplay: false }
            })
        })

        this.firstInstance = jsPlumb.getInstance({
            Container: 'designer-area',
            DragOptions: { cursor: "pointer", zIndex: 2000 },
            PaintStyle: {
                strokeWidth: 2,
                stroke: "#9E9E9E",
                boxShadow: "0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12)",
                transition: "color 0.15s ease-in -out, background - color 0.15s ease -in -out, border - color 0.15s ease -in -out, box - shadow 0.15s ease -in -out"
            },
        });

        this.paletteBoard = document.getElementById('task-palette-container');
        if (this.paletteBoard) {
            this.firstInstance.importDefaults({
                Connector: ["Flowchart", { cornerRadius: 4, stub: 0 }],
                // ConnectionOverlays: [['Custom', overlayPlus()]]
            });
            this.containerWrapper = document.getElementById('designer-wrapper-area');
            this.container = document.getElementById('designer-area');

            this.containerWrapper.addEventListener('wheel', (e) => {
                if (e.ctrlKey) {
                    e.preventDefault();
                    let formData = document.getElementById('designer-form-container');
                    if (formData && formData.contains(e.target)) return;
                    console.log(e.target)
                    let xScreen = e.pageX - self.container.offsetLeft;
                    let yScreen = e.pageY - self.container.offsetTop;

                    // find current location on the image at the current scale
                    self.xImage = self.xImage + ((xScreen - self.xLast) * self.scale);
                    self.yImage = self.yImage + ((yScreen - self.yLast) * self.scale);

                    // determine the new scale
                    if (e.deltaY > 0) {
                        self.scale += 0.02;
                    }
                    else {
                        self.scale += -0.02;
                    }
                    if (self.scale < 0.3) {
                        self.scale = 0.3;
                        return;
                    }
                    else if (self.scale > 2) {
                        self.scale = 2;
                        return;
                    }

                    // determine the location on the screen at the new scale
                    let xNew = (xScreen - self.xImage) / self.scale;
                    let yNew = (yScreen - self.yImage) / self.scale;

                    // save the current screen location
                    self.xLast = xScreen;
                    self.yLast = yScreen;

                    // redraw
                    self.container.style.cssText = [
                        `-webkit-transform: scale(${self.scale})`,
                        `-moz-transform: scale(${self.scale})`,
                        `-ms-transform: scale(${self.scale})`,
                        `-o-transform: scale(${self.scale})`,
                        `transform: scale(${self.scale})`,
                        `transform-origin: ${self.xImage}px ${self.yImage}px`,
                        // `translate: ${xNew*self.scale}px ${yNew*self.scale}px`
                    ].join(';')
                    self.container.style.left = `${self.containerPosition.x}px`;
                    self.container.style.top = `${self.containerPosition.y}px`;
                    self.firstInstance.setZoom(self.scale);
                    return false;

                } else if (this.state.currentNodeFocused === null) {
                    if (e.deltaY > 0) {
                        self.containerPosition = {
                            x: self.containerPosition.x,
                            y: self.containerPosition.y - 10
                        }
                    }
                    else {
                        self.containerPosition = {
                            x: self.containerPosition.x,
                            y: self.containerPosition.y + 10
                        }
                    }
                    self.container.style.left = `${self.containerPosition.x}px`;
                    self.container.style.top = `${self.containerPosition.y}px`;
                }
            });

            var touchStartY, touchStartX;
            this.containerWrapper.addEventListener('touchend', e => {
                touchStartY = undefined;
                touchStartX = undefined;
            });
            this.containerWrapper.addEventListener('touchmove', e => {
                if (this.state.currentNodeFocused === null) {
                    e.preventDefault();
                    //console.log("on touchmove")
                    touchStartY = touchStartY ? touchStartY : Math.round(e.touches[0].pageY);
                    touchStartX = touchStartX ? touchStartX : Math.round(e.touches[0].pageX);
                    var yEnd = Math.round(e.touches[0].pageY),
                        xEnd = Math.round(e.touches[0].pageX),
                        yDistance = yEnd - touchStartY,
                        xDistance = xEnd - touchStartX;
                    if (yDistance > 5 || yDistance < -5) {
                        touchStartY = touchStartY + yDistance
                        self.containerPosition = {
                            x: self.containerPosition.x,
                            y: self.containerPosition.y + yDistance
                        }
                        self.container.style.left = `${self.containerPosition.x}px`;
                        self.container.style.top = `${self.containerPosition.y}px`;
                    }
                    if (xDistance > 5 || xDistance < -5) {
                        touchStartX = touchStartX + xDistance
                        self.containerPosition = {
                            x: self.containerPosition.x + xDistance,
                            y: self.containerPosition.y
                        }
                        self.container.style.left = `${self.containerPosition.x}px`;
                        self.container.style.top = `${self.containerPosition.y}px`;
                    }
                }

            })

            this.containerWrapper.addEventListener('mousedown', (e) => {
                //////console.log('mousedown ', e.target)
                if (e.target === self.containerWrapper || e.target === self.container || e.target.className.indexOf('jtk-overlay') >= 0) {

                    self.startDropPosition = { x: e.pageX, y: e.pageY };
                    self.onDragContainer = true;
                }
            });

            this.containerWrapper.addEventListener('mouseup', e => {
                // if (self.onDragContainer) {
                //     self.firstInstance.repaintEverything();
                // }
                self.onDragContainer = false;
            });

            this.containerWrapper.addEventListener('mousemove', e => {
                if (self.onDragContainer) {
                    self.containerPosition = {
                        x: self.containerPosition.x + ((e.pageX - self.startDropPosition.x) / 1),
                        y: self.containerPosition.y + ((e.pageY - self.startDropPosition.y) / 1)
                    }
                    self.container.style.left = `${self.containerPosition.x}px`;
                    self.container.style.top = `${self.containerPosition.y}px`;
                    self.startDropPosition.x = e.pageX;
                    self.startDropPosition.y = e.pageY;
                }
            });

            this.containerWrapper.addEventListener('click', e => {
                console.log('click', e.target)
                if ((e.target.className.indexOf('fc-task-placeholder') >= 0) && !this.state.taskPalette.display) {
                    this.setState({
                        taskPalette: {
                            display: true,
                            x: e.pageX,
                            y: e.pageY
                        }
                    })
                }
            })

            this.resetFlowchart();
            this.firstInstance.draggable([this.paletteBoard], {
                containment: document.getElementById('designer-wrapper-area'),
                stop: (params) => {
                    // ////////console.log('STOP ', params)
                },
                start: () => {
                    // ////////console.log('start')
                },
                drag: (e) => {
                    // ////////console.log('dragging', e)
                    // return false;
                }
            });

            if (this.fileLoadedFromServer) {
                //   this.props.loadFileFromServer(this.fileLoadedFromServer());
            }

            //debugger
            if (getQueryString().id != "") {
                var resData = await this.props.GetWorkflow(getQueryString().id);
                console.log(resData)
                console.log(this.props)
                if (resData.data) {
                    this.importedJsonFile(resData.data);
                } else {
                    window.location = '/';
                }
            } else {
                this.setState({ newWorkflowSetup: true })
            }
        }

    }

    handleSubmitTaskForm(nodeId, e) {
        let self = this
        switch (this.nodes[nodeId].type) {
            case 'query_JSON':
                if (!e.formData.path || !e.formData.source || (!e.formData.firstResult && !e.formData.allResults)) break
                // get data
                let sourceData, data, routeData, newData = {}, oldData = []
                try {
                    sourceData = JSON.parse(e.formData.source)
                    data = sourceData
                    routeData = e.formData.path.split('.')
                    console.log(sourceData, data, routeData)
                    routeData.forEach(p => {
                        data = data[p]
                        console.log(data)
                    })
                    if (self.variables[nodeId] && self.variables[nodeId][e.formData.allResults])
                        oldData = JSON.parse(self.variables[nodeId][e.formData.allResults]) || []
                    console.log('1908 ', data, oldData)
                    if (e.formData.firstResult)
                        newData[e.formData.firstResult] = JSON.stringify(data)
                    if (e.formData.allResults)
                        newData[e.formData.allResults] = JSON.stringify([...oldData, data])
                    console.log('1908 ', newData)
                    self.variables[nodeId] = newData
                } catch (error) {
                    console.log(error)
                }
                break
            case 'Call a web service':
                this.curTaskCallService = nodeId;
                let reqHeader, reqContent;
                try {
                    reqHeader = JSON.parse(e.formData.requestHeader);
                    reqContent = JSON.parse(e.formData.requestContent);
                } catch (e) {

                } finally {
                    this.props.callAWebService(e.formData.url, e.formData.method, reqHeader, reqContent);
                }
                break
            default:
                break
        }
    }

    selectTab(tab) {
        //console.log('==================== ', tab)
        this.setState({ currentTab: tab });
    }

    handleChangeWorkflowSetting(e) {
        //console.log('-====-------> handleChangeWorkflowSetting', e)
        this.props.updateWorkflowSetting(e.formData);
    }

    handleChangePermissionSetting(inputName, e) {
        let { permission } = this.state;
        if (inputName == 'permissionRead') {
            permission.read = e
        } else if (inputName == 'permissionDesign') {
            permission.design = e
        }
        this.setState({ permission })
    }

    getVariablesHardcode() {
        let self = this;
        let listVar = {};
        this.props.workflowSettingReducer.variables.forEach(v => {
            listVar[v.name] = {
                /*"displayName": v.name,
                "dataType": {
                    "name": v.type,
                    "version": 1
                },
                "defaultValue": v.defaultValue,
                "displayDefaultValue": "",
                "output": false,
                "name": v.name,
                "source": "workflow",
                "initiate": false,
                "configuration": {
                    "description": "",
                    "defaultValue": '',
                    "displayDefaultValue": ""
                },
                "isInUse": false,
                "isUsedInActions": true,
                "usedInActions": []*/
                "name": v.name,
                "type": v.type,
                ...(v.defaultValueString !== undefined && { "defaultValueString": v.defaultValueString }),
                ...(v.defaultValueNumber !== undefined && { "defaultValueNumber": v.defaultValueNumber }),
                ...(v.defaultValueBoolean !== undefined && { "defaultValueBoolean": v.defaultValueBoolean }),
                ...(v.defaultValueObject !== undefined && { "defaultValueObject": v.defaultValueObject }),
                ...(v.defaultValueArray != undefined && { "defaultValueArray": v.defaultValueArray }),
                "value": v.value
            }
        })

        let result = [];
        Object.keys(listVar).forEach(key => result.push(listVar[key]));
        //console.log(result)
        return result;
    }

    reRenderBranchTask(task, placeholder) {
        //console.log('1307 reRenderBranchTask ', task, placeholder)
        let self = this;
        let taskCount = _count;
        self.addTaskToDropZone(placeholder, null, task.datatype, task, task.number);
        //console.log(this.nodes)
        let endId = `node-end-${task.number}`;
        for (var i = 0; i < task.branches.length; i++) {
            let cNode = task.branches[i][0];
            // console('1307 loop though branches', i, task.branches[i])
            // let countInBranch;
            ////console.log('2706 branch =====>  ', cNode, newParent)
            task.branches[i].actions.forEach((n, j) => {
                //console.log('loop in branch ', i, n, j);
                cNode = `node-${n.number}`;

                let pre;
                let nex = `node-botbranch_${i}-${task.number}`;
                if (j === 0) {
                    pre = `node-topbranch_${i}-${task.number}`
                } else {
                    pre = `node-${n.previous}`;
                    //console.log(task.branches)
                    if (task.branches[i].actions[j - 1].branches && task.branches[i].actions[j - 1].branches.length > 0) {
                        pre = `node-end-${n.previous}`;
                    }
                }

                let o = self.getOverlayBySourceTarget(pre, nex);
                if (!n.branches || !n.branches.length) {
                    self.addTaskToDropZone(o, null, n.datatype, n, n.number);
                }
                else {
                    self.reRenderBranchTask(n, o);
                }
            })
        }
    }

    reRenderFromFile() {
        this.resetFlowchart();
        let self = this;
        let previous = NODE_START;
        this.maxCount = -1;
        //console.log('1307 reRenderFromFile ', this.importData)
        this.importData.definition && this.importData.definition.actions &&
            this.importData.definition.actions.forEach((e, i) => {
                let o = self.getOverlayBySourceTarget(previous, NODE_END);
                if (e.branches && e.branches.length >= 1) {
                    self.reRenderBranchTask(e, o);
                    previous = `node-end-${e.number}`
                } else {
                    //console.log(o)
                    self.addTaskToDropZone(o, null, e.datatype, e, e.number);
                    previous = `node-${e.number}`;
                }
            });

        Object.keys(this.nodes).forEach(key => {
            if (self.nodes[key].configuration && self.nodes[key].configuration.actionName === 'set_variables') {
                self.variables[key] = {};
                self.nodes[key].configuration.properties.forEach(variable => {
                    self.variables[key][variable.var] = variable.value;
                })
            }
        });

        //console.log('bon0507 variables ', self.variables)
        _count = this.maxCount + 1;
        this.firstInstance.repaintEverything();
        console.log(this.nodes)
    }

    removeAllEndpointOfNode(node) {
        let self = this;
        this.firstInstance.selectEndpoints({ element: node }).each(ep => {
            // //console.log('1307 remove endpoint ', ep);
            self.firstInstance.deleteEndpoint(ep);

        })
        //console.log('1307 ep select after remove', node,  this.firstInstance.selectEndpoints({element: node}))
        // this.firstInstance.deleteEveryEndpoint();
        // this.firstInstance.deleteEndpoint({uuid: `${node}-ep-right`});
        // this.firstInstance.deleteEndpoint({uuid: `${node}-ep-bottom`});
        // this.firstInstance.deleteEndpoint({uuid: `${node}-ep-left`});
    }

    handleRenameTask(value) {
        renameTask(this.curFocusTask, this.nodes, value);
        this.setState({ popupRenameFormDisplay: false });
    }

    getOverlayBySourceTarget(source, target) {
        let o = document.querySelector('.jtk-overlay .dropable-zone[data-source="' + source + '"][data-target="' + target + '"]');
        //console.log('getOverlayBySourceTarget ', source, target, o)
        return o.parentElement;
    }

    resetFlowchart() {
        let self = this;
        Object.keys(this.nodes).forEach(key => {
            //console.log('0507====> key', key, self.nodes[key])
            if (self.nodes[key].element) {
                self.firstInstance.deleteConnectionsForElement(key);
                self.nodes[key].element.remove();
            }
        });
        this.firstInstance.deleteEveryEndpoint();
        this.nodes = {};
        let xValue = window.innerWidth * 0.5 - 20;
        let yMiddle = (window.innerHeight - 50) * 0.1;
        let yValue = 10 + config.nodeSizeDefault / 2 + config.nodeGap + config.nodeSizeDefault / 2;
        // add startpoint and endpoint
        this.container.innerHTML += '<div id="' + NODE_START + '" class="fc-item fc-item-draggable" style="top: ' + (yMiddle - config.nodeGap / 2 - config.nodeSizeDefault / 2) + 'px; left: ' + xValue + 'px;"><span class="fa fa-play"></span></div>';
        this.container.innerHTML += '<div id="' + NODE_END + '" class="fc-item fc-item-draggable" style="top: ' + (yMiddle + config.nodeGap / 2) + 'px; left: ' + xValue + 'px;"><span class="fa fa-stop"></span></div>'
        this.nodes.nodeStart = document.getElementById(NODE_START);
        this.nodes.nodeEnd = document.getElementById(NODE_END);
        this.addEndPointToNode(this.nodes.nodeStart, 'Bottom', `${NODE_START}-ep-bottom`);
        this.addEndPointToNode(this.nodes.nodeEnd, 'Top', `${NODE_END}-ep-top`);
        this.connectNodes(
            ['Custom', overlayPlus(NODE_START, NODE_END)],
            NODE_START + '-ep-bottom',
            NODE_END + '-ep-top'
        );
        this.nodes[NODE_START] = {
            nodeId: NODE_START,
            next: NODE_END,
            previous: null,
            element: this.nodes.nodeStart,
            type: NODE_START,
            data: {}
        };
        this.nodes[NODE_END] = {
            nodeId: NODE_END,
            next: null,
            previous: NODE_START,
            element: this.nodes.nodeEnd,
            type: NODE_END,
            data: {}
        };
        this.firstInstance.repaintEverything();
        let connections = this.firstInstance.getConnections({ source: NODE_START, target: NODE_END });
        //console.log('0507', this.nodes, connections)
    }

    deleteTaskById(taskId) {
        let previous = this.nodes[taskId].previous;
        let next = this.nodes[taskId].next;
        let branch = this.nodes[taskId].onBranch ? Number(this.nodes[taskId].onBranch) : null;
        let nodeList = [taskId];
        let parent = this.nodes[taskId].parent;
        let onBranch = this.nodes[taskId].onBranch;
        let self = this;
        if (this.nodes[taskId].branch) {
            next = this.nodes[`node-end-${this.nodes[taskId].count}`].next;
            nodeList.push(`node-end-${this.nodes[taskId].count}`);
            for (var i = 0; i < this.nodes[taskId].branch; i++) {
                for (var j = 0; j < this.nodes[taskId][i].length; j++) {
                    nodeList.push(this.nodes[taskId][i][j]);
                }
            }
        }
        if (this.nodes[taskId].wrapper) {
            nodeList = [
                ...nodeList,
                `node-lefttop-${this.nodes[taskId].count}`,
                `node-leftbot-${this.nodes[taskId].count}`,
                `node-righttop-${this.nodes[taskId].count}`,
                `node-rightbot-${this.nodes[taskId].count}`
            ];
        }
        let loopParent = parent;
        while (loopParent) {
            ////console.log(loopParent)
            let i = this.nodes[loopParent][onBranch].length;
            ////console.log('i', i, nodeList)
            while (i--) {
                ////console.log('===> ', i)
                if (nodeList.includes(this.nodes[loopParent][onBranch][i])) this.nodes[loopParent][onBranch].splice(i, 1);
            }
            onBranch = this.nodes[loopParent].onBranch;
            loopParent = this.nodes[loopParent].parent;
        }
        this.narrowFlowchart(taskId);
        this.moveUpFlowchart(taskId);
        this.firstInstance.repaintEverything();
        // delete all connections
        nodeList.forEach(n => {
            //console.log('1307 remove node ', n)
            self.firstInstance.deleteConnectionsForElement(n);
            // self.firstInstance.detach(n);
            self.removeAllEndpointOfNode(n);
        })
        // delete all nodes
        nodeList.forEach(n => {
            ////console.log(n)
            document.getElementById(n).remove();
            delete self.nodes[n];
        })

        this.connectNodes(
            ['Custom', Object.assign({}, overlayPlus(previous, next, branch))],
            `${previous}-ep-bottom`,
            `${next}-ep-top`
        );
        this.nodes[next].previous = previous;
        this.nodes[previous].next = next;
    }

    moveUpFlowchart(deletedTask) {
        let previous = this.nodes[deletedTask].previous;
        let next = this.nodes[deletedTask].next;
        if (this.nodes[deletedTask].branch) next = this.nodes[`node-end-${this.nodes[deletedTask].count}`].next;
        let currentGap = this.nodes[next].element.offsetTop - (this.nodes[previous].element.offsetTop + this.nodes[previous].element.offsetHeight);
        let gapMinus = -(currentGap - (config.nodeGap - 50));
        let parent = this.nodes[deletedTask].parent;
        ////console.log('********', previous, next, currentGap, config.nodeGap, this.nodes[deletedTask].onBranch)
        let item = deletedTask;
        let smallestGap = -gapMinus;
        // calculate gap each branch
        if (parent && this.nodes[parent].branch) {
            for (var i = 0; i < this.nodes[parent].branch; i++) {
                if (this.nodes[deletedTask].onBranch && i === +this.nodes[deletedTask].onBranch) continue;
                let botNode = `node-botbranch_${i}-${this.nodes[parent].count}`;
                let prevBot = this.nodes[botNode].previous;
                let bGap = this.nodes[botNode].element.offsetTop - (this.nodes[prevBot].element.offsetTop + this.nodes[prevBot].element.offsetHeight);
                if (smallestGap > bGap) smallestGap = bGap;
            }
        }
        ////console.log('smallestGap', smallestGap)
        if (smallestGap > config.nodeGap) gapMinus = config.nodeGap - smallestGap;
        else return;
        while (item) {
            ////console.log('08/06 ', item, gapMinus)
            this.nodes[item].element.style.top = `${this.nodes[item].element.offsetTop + gapMinus}px`;
            let itemP = item.split('-');
            let corner;

            if (itemP[1].indexOf('botbranch') >= 0) {
                let c = this.nodes[item].count;
                for (var i = 0; i < this.nodes[this.nodes[item].parent].branch; i++) {
                    if (item === `node-botbranch_${i}-${c}`) continue;
                    this.nodes[`node-botbranch_${i}-${c}`].element.style.top = `${this.nodes[`node-botbranch_${i}-${c}`].element.offsetTop + gapMinus}px`;
                }
                item = this.nodes[item].next;
                continue;
            }

            if (this.nodes[item].type === SPECIAL_END_NODE && this.nodes[item].parent && this.nodes[this.nodes[item].parent].wrapper) {
                let itemLeft = `node-leftbot-${this.nodes[item].count}`;
                let itemRight = `node-rightbot-${this.nodes[item].count}`;
                this.nodes[itemLeft].element.style.top = `${this.nodes[itemLeft].element.offsetTop + gapMinus}px`;
                this.nodes[itemRight].element.style.top = `${this.nodes[itemRight].element.offsetTop + gapMinus}px`;
            }
            if (this.nodes[item].wrapper) {
                this.nodes[`node-lefttop-${this.nodes[item].count}`].element.style.top = this.nodes[`node-lefttop-${this.nodes[item].count}`].element.offsetTop + gapMinus + 'px';
                this.nodes[`node-leftbot-${this.nodes[item].count}`].element.style.top = this.nodes[`node-leftbot-${this.nodes[item].count}`].element.offsetTop + gapMinus + 'px';
                this.nodes[`node-righttop-${this.nodes[item].count}`].element.style.top = this.nodes[`node-righttop-${this.nodes[item].count}`].element.offsetTop + gapMinus + 'px';
                this.nodes[`node-rightbot-${this.nodes[item].count}`].element.style.top = this.nodes[`node-rightbot-${this.nodes[item].count}`].element.offsetTop + gapMinus + 'px';
            }
            if (this.nodes[item].branch >= 1) {
                for (var i = 0; i < this.nodes[item].branch; i++) {
                    this.nodes[item][i].forEach(n => {
                        this.nodes[n].element.style.top = `${this.nodes[n].element.offsetTop + gapMinus}px`;
                    });
                }

                this.nodes[`node-end-${this.nodes[item].count}`].element.style.top = `${this.nodes[`node-end-${this.nodes[item].count}`].element.offsetTop + gapMinus}px`;
                item = `node-end-${this.nodes[item].count}`;
            }
            if (!this.nodes[item].branch) {
                item = this.nodes[item].next;
            }
        }
    }

    removeBranch(branchIndex, node) {
        // let self = this;
        // this.nodes[node][branchIndex].forEach(n => {
        //     self.firstInstance.deleteConnectionsForElement(n);
        //     self.firstInstance.deleteEndNo
        // })
    }

    addNewBranch() {

    }

    updateFormValue(node, value, removedIndex) {
        console.log('updateFormValue', node, value, removedIndex, this.nodes[node])
        let self = this;
        // add/remove branch
        if (value && value.branches && value.branches instanceof Array) {
            let jsonTask = self.getDataBranchNode(node);
            console.log(jsonTask)
            let previous = this.nodes[node].previous;
            let next = this.nodes[`node-end-${jsonTask.number}`].next;
            //console.log('endpoint nodestart', this.firstInstance.selectEndpoints({element: NODE_START}));
            if (value.branches.length !== this.nodes[node].configuration.properties.branches.length) {
                // remove branche
                if (value.branches.length < this.nodes[node].configuration.properties.branches.length) {
                    jsonTask.branches.splice(removedIndex, 1);
                    //console.log(jsonTask)
                    jsonTask.branch--;
                    jsonTask.configuration.properties = value;
                }
                // add branch
                else if (value.branches.length > this.nodes[node].configuration.properties.branches.length) {
                    jsonTask.branches.push({ name: value[value.length - 1], actions: [] });
                    jsonTask.configuration.properties = value;
                    jsonTask.branch++;
                }
                this.flexibleNode.id = node;
                this.flexibleNode.jsonData = jsonTask;
                let data = this.flowchartToJson();
                this.importData = data;
                self.resetFlowchart();

                this.reRenderFromFile();
            }
            // change branch name
            else {
                this.nodes[node].configuration.properties = value;
            }
            return;
        }
        this.nodes[node].configuration.properties = value;
        if (this.nodes[node].configuration.actionName === 'set_variables') {
            // value.forEach((v, i) => {
            //     if (v.var && !v.value) {
            //         v.value = this.settingVarDefaultValue[v.var];
            //     }
            // })
            this.nodes[node].configuration.properties = value;

            this.setState(Object.assign({}, {
                currentNodeFocused: Object.assign({}, this.nodes[node], {
                    schema: this.state.currentNodeFocused.schema,
                    configuration: Object.assign({}, this.nodes[node].configuration, {
                        properties: value
                    })
                })
            }));
        }
    }

    shouldComponentUpdate(newProps, newState) {
        return true;
    }

    togglePalette() {
        this.setState({
            taskPalette: Object.assign({}, this.state.taskPalette, { display: !this.state.taskPalette.display })
        })
    }

    addEndPointToNode(node, position, uuid) {
        this.firstInstance.addEndpoint(node, {
            isSource: true,
            isTarget: true,
            endpoint: 'Blank',
            uuid: uuid,
            anchor: [position],
            maxConnections: 100
        });
    }

    addEndpoints(node, position, uuids, nodeId) {
        let self = this;
        if (position && position.length) {
            position.forEach((p, i) => {
                self.addEndPointToNode(node, p, uuids[i]);
            });
            return;
        }
        else {
            self.addEndPointToNode(node, 'Left', `${nodeId}-ep-left`);
            self.addEndPointToNode(node, 'Top', `${nodeId}-ep-top`);
            self.addEndPointToNode(node, 'Right', `${nodeId}-ep-right`);
            self.addEndPointToNode(node, 'Bottom', `${nodeId}-ep-bottom`);
        }
    }

    connectNodes(overlays, endpointStart, endpointEnd, PaintStyle) {
        // //console.log('0507 connectNodes', overlays, PaintStyle, endpointStart, endpointEnd)
        let self = this;
        let connOptions = {
            uuids: [endpointStart, endpointEnd],
        }
        if (overlays) connOptions.overlays = [
            overlays
        ]
        if (PaintStyle) connOptions.paintStyle = PaintStyle;
        let conn = this.firstInstance.connect(connOptions);
        conn.bind('click', self.handleClickOverlay);
        // //console.log('0507', conn)
    }

    addTaskToDropZone(destination, node, tasktype, copyTask, countValue) {
        //console.log('1307 addTaskToDropZone', destination, node, tasktype, countValue, _count, copyTask)
        if (!destination) return;
        if (!isNaN(parseFloat(countValue)) && isFinite(countValue)) {
            _count = countValue;
            this.maxCount = _count > this.maxCount ? _count : this.maxCount;
        }
        let self = this;
        let leftPosNewNode = destination.offsetLeft - 80;
        let destinationLeft = destination.offsetLeft;
        let source = destination.querySelector('.dropable-zone').getAttribute('data-source');
        let target = destination.querySelector('.dropable-zone').getAttribute('data-target');
        let position = destination.querySelector('.dropable-zone').getAttribute('data-position');
        let datatype = node ? JSON.parse(node.getAttribute('datatype')) : tasktype;
        // //console.log('====> datatype ', datatype)
        //let item = config.taskType[datatype.parent][datatype.type];
        let item = taskConfig[datatype.type];
        let branches = copyTask ? (copyTask.branches ? copyTask.branches.length : null) : item.branch;
        let connections = this.firstInstance.getConnections({ source: source, target: target });
        let parent = '';
        let newNodeId = `node-${_count}`;
        let taskTitle = item.title;
        //console.log(branches)
        // //console.log('0806 ', this.nodes)
        if (this.nodes[source].type === SPECIAL_CORNER_NODE) parent = this.nodes[source].parent;
        if (this.nodes[source].branch >= 1) parent = source;
        if (this.nodes[target].type === SPECIAL_END_NODE) parent = this.nodes[target].parent;
        if (this.nodes[target].parent) parent = this.nodes[target].parent;

        if (parent != "" && parent && this.nodes[parent].nestedLevel >= config.MAXIMUM_NESTED) return;

        let curConnection = connections.filter(c => {
            if (!c.getOverlays().overlayPLus) return false;
            return c.getOverlays().overlayPLus.canvas.id === destination.getAttribute('id');
        })

        // calculate the gap between source->target => decide this flowchart will be moved down or not
        // only do this when new node is adding to branch of other node
        let needToMoveFlowchart = true;
        let needToExpandBranchNode = false;
        let p = null;
        let parentExpand = null;
        if (position) {
            if (this.nodes[source].branch >= 1) p = source;
            else if (this.nodes[source].type === SPECIAL_END_NODE) p = this.nodes[this.nodes[source].parent].parent;
            else if (this.nodes[source].parent) p = this.nodes[source].parent;
            parentExpand = p;
            needToMoveFlowchart = isFlowchartWillMove(this.nodes, p, position, item, source, target);
        }

        // remove old connection -> move nodes down -> repaint
        this.firstInstance.deleteConnection(curConnection[0]);
        if (needToMoveFlowchart) {
            self.moveDownFlowchart(target, datatype.type, position, branches);
        }

        this.firstInstance.repaintEverything(); // redraw everything before you  addd new connect

        // calculate top position new node
        let sourceH = ([SPECIAL_END_NODE, SPECIAL_CORNER_NODE].includes(this.nodes[source].type) ? 0 : config.nodeSizeDefault / 2);
        let targetH = ([SPECIAL_END_NODE, SPECIAL_CORNER_NODE].includes(this.nodes[target].type) ? 0 : config.nodeSizeDefault / 2);
        // let topPos = (this.nodes[target].element.offsetTop + this.nodes[source].element.offsetTop + sourceH + targetH)/2 - config.nodeSizeDefault/2;
        let topPosNewNode = this.nodes[source].element.offsetTop + (this.nodes[source].branch === 2 ? sourceH : sourceH * 2) + config.nodeGap;

        if (branches === 2) {
            // let gapSize = this.nodes[target].element.offsetTop - (this.nodes[source].element.offsetTop + config.nodeSizeDefault);
            // topPos = (this.nodes[source].element.offsetTop + (source === NODE_START ? config.nodeStartEndSize : config.nodeSizeDefault)) + config.nodeGap;
            topPosNewNode = this.nodes[source].element.offsetTop + (this.nodes[source].branch === 2 ? sourceH : sourceH * 2) + config.nodeGap;
        }

        // create new node element -> add attribute -> append to container canvas
        let newNode = document.createElement('div');
        newNode.setAttribute('id', newNodeId);
        newNode.setAttribute('datatype', JSON.stringify({ type: item.name, parent: item.type, fc: true }));
        newNode.draggable = "true"
        newNode.className = 'fc-task-palette-item fc-item fc-item-draggable fc-item-default';
        newNode.style.cssText = 'top: ' + topPosNewNode + 'px; left: ' + (leftPosNewNode) + 'px;';
        newNode.innerHTML = node ? node.innerHTML : `
            <div  class="task-palette-icon fa fa-${item.icon} unselectable"  ></div>
            <div class="task-palette-title unselectable">${copyTask ? copyTask.configuration.actionTitle : taskTitle}</div>`;
        addTaskMenuIcon(newNode);
        this.container.append(newNode);

        $('.fc-task-palette-item').on('dragstart', function (event) {
            self.draged = event.target;
            event.stopPropagation();
        })

        // add endpoint to new node
        // 2 branches -> add RIGHT and LEFT endpoints
        //console.log('1307  check endpoint before add ', this.firstInstance.selectEndpoints({element: newNodeId}))
        this.addEndpoints(newNode, null, null, newNodeId);
        //console.log('1307 check endpoint after add ', this.firstInstance.selectEndpoints({element: newNodeId}))
        this.firstInstance.repaintEverything();
        // add TOP endpoint
        // this.addEndPointToNode(newNode, 'Top', `node-${_count}-ep-top`);


        // 2 branches -> add one more node as end of new node (end-new-node)
        let newEndNode = null;
        let newLeftTopNode = null;
        let newLeftBotNode = null;
        let newRightTopNode = null;
        let newRightBotNode = null;
        let lefttopId;
        let leftbotId;
        let righttopId;
        let rightbotId;
        let endId;
        let nodesCornerList = [];
        ////////console.log('branches ', branches)
        if (branches >= 1) {
            if (item.wrapper) {
                lefttopId = `node-lefttop-${_count}`;
                leftbotId = `node-leftbot-${_count}`;
                righttopId = `node-righttop-${_count}`;
                rightbotId = `node-rightbot-${_count}`;

                newLeftTopNode = document.createElement('div');
                newLeftBotNode = document.createElement('div');
                newRightTopNode = document.createElement('div');
                newRightBotNode = document.createElement('div');

                let gapSize = this.nodes[target].element.offsetTop - (this.nodes[source].element.offsetTop + config.nodeSizeDefault);
                let topPos = this.nodes[target].element.offsetTop - config.nodeGap;

                newLeftTopNode.setAttribute('id', `node-lefttop-${_count}`);
                newLeftBotNode.setAttribute('id', `node-leftbot-${_count}`);
                newRightTopNode.setAttribute('id', `node-righttop-${_count}`);
                newRightBotNode.setAttribute('id', `node-rightbot-${_count}`);

                newLeftTopNode.className = 'fc-item fc-item-draggable fc-item-end-point';
                newLeftBotNode.className = 'fc-item fc-item-draggable fc-item-end-point';
                newRightTopNode.className = 'fc-item fc-item-draggable fc-item-end-point';
                newRightBotNode.className = 'fc-item fc-item-draggable fc-item-end-point';

                newLeftTopNode.style.cssText = 'top: ' + (topPosNewNode + config.nodeSizeDefault / 2) + 'px; left: ' + (leftPosNewNode - 90) + 'px;';
                newLeftBotNode.style.cssText = 'top: ' + (this.nodes[target].element.offsetTop - config.nodeGap + 10) + 'px; left: ' + (leftPosNewNode - 90) + 'px;';

                newRightTopNode.style.cssText = 'top: ' + (topPosNewNode + config.nodeSizeDefault / 2) + 'px; left: ' + (leftPosNewNode + 160 + 90) + 'px;';
                newRightBotNode.style.cssText = 'top: ' + (this.nodes[target].element.offsetTop - config.nodeGap + 10) + 'px; left: ' + (leftPosNewNode + 160 + 90) + 'px;';

                this.container.append(newLeftTopNode);
                this.container.append(newRightTopNode);
                this.container.append(newRightBotNode);
                this.container.append(newLeftBotNode);

                this.addEndPointToNode(newLeftTopNode, 'Bottom', `${lefttopId}-ep-bottom`);
                this.addEndPointToNode(newLeftTopNode, 'Right', `${lefttopId}-ep-right`);

                this.addEndPointToNode(newRightTopNode, 'Bottom', `${righttopId}-ep-bottom`);
                this.addEndPointToNode(newRightTopNode, 'Left', `${righttopId}-ep-left`);

                this.addEndPointToNode(newRightBotNode, 'Top', `${rightbotId}-ep-top`);
                this.addEndPointToNode(newRightBotNode, 'Left', `${rightbotId}-ep-left`);

                this.addEndPointToNode(newLeftBotNode, 'Top', `${leftbotId}-ep-top`);
                this.addEndPointToNode(newLeftBotNode, 'Right', `${leftbotId}-ep-right`);

                this.nodes[`node-lefttop-${_count}`] = {
                    nodeId: `node-lefttop-${_count}`,
                    previous: `node-${_count}`,
                    next: `node-leftbot-${_count}`,
                    element: newLeftTopNode,
                    type: SPECIAL_CORNER_NODE,
                    data: [],
                    title: '',
                    parent: `node-${_count}`,
                    count: _count
                }
                this.nodes[`node-righttop-${_count}`] = {
                    nodeId: `node-righttop-${_count}`,
                    previous: `node-${_count}`,
                    next: `node-rightbot-${_count}`,
                    element: newRightTopNode,
                    type: SPECIAL_CORNER_NODE,
                    data: [],
                    title: '',
                    parent: `node-${_count}`,
                    count: _count
                }
                this.nodes[`node-leftbot-${_count}`] = {
                    nodeId: `node-leftbot-${_count}`,
                    previous: `node-lefttop-${_count}`,
                    next: `node-end-${_count}`,
                    element: newLeftBotNode,
                    type: SPECIAL_CORNER_NODE,
                    data: [],
                    title: '',
                    parent: `node-${_count}`,
                    count: _count
                }
                this.nodes[`node-rightbot-${_count}`] = {
                    nodeId: `node-rightbot-${_count}`,
                    previous: `node-righttop-${_count}`,
                    next: `node-end-${_count}`,
                    element: newRightBotNode,
                    type: SPECIAL_CORNER_NODE,
                    data: [],
                    title: '',
                    parent: `node-${_count}`,
                    count: _count
                }
                nodesCornerList = [lefttopId, leftbotId, righttopId, rightbotId];
            }

            // branches >= 3
            let halfBranches = Math.floor(branches / 2);
            endId = `node-end-${_count}`;
            newEndNode = document.createElement('div');
            newEndNode.setAttribute('id', `node-end-${_count}`);
            newEndNode.className = 'fc-item fc-item-draggable fc-item-end-point';
            newEndNode.style.cssText = 'top: ' + (this.nodes[target].element.offsetTop - config.nodeGap + 10) + 'px; left: ' + (destinationLeft) + 'px;';
            this.addEndpoints(newEndNode, null, null, endId);
            this.container.append(newEndNode);
            this.nodes[`node-end-${_count}`] = {
                nodeId: `node-end-${_count}`,
                previous: { left: leftbotId, right: rightbotId },
                next: target,
                element: newEndNode,
                type: SPECIAL_END_NODE,
                data: [],
                title: '',
                parent: `node-${_count}`,
                count: _count
            }

            let equalPostionLeft = null;
            let equalPostionRight = null;

            for (let i = 0; i < branches; i++) {
                let topBranchId = `node-topbranch_${i}-${_count}`;
                let botBranchId = `node-botbranch_${i}-${_count}`;
                let newTopBranchNode = document.createElement('div');
                let newBotBranchNode = document.createElement('div');
                let topPos = this.nodes[target].element.offsetTop - config.nodeGap;
                newTopBranchNode.setAttribute('id', topBranchId);
                newBotBranchNode.setAttribute('id', botBranchId);
                newTopBranchNode.className = 'fc-item fc-item-draggable fc-item-end-point';
                newBotBranchNode.className = 'fc-item fc-item-draggable fc-item-end-point';

                let left;
                let top;
                if (branches % 2 === 1 && Math.floor(branches / 2) === i) {
                    left = (leftPosNewNode + config.nodeWidthDefault / 2);
                    top = topPosNewNode + config.nodeSizeDefault;
                }
                else if (i < halfBranches) {
                    left = (leftPosNewNode + config.nodeWidthDefault / 2) - (halfBranches - i) * 180
                    // if (this.IsMainBranch) {
                    //     equalPostionLeft = (leftPosNewNode + config.nodeWidthDefault / 2) - (halfBranches - i) * 180
                    //     left = (equalPostionRight && equalPostionRight >= equalPostionLeft) ? equalPostionLeft : ((equalPostionRight / 2))
                    // }
                    top = topPosNewNode + config.nodeSizeDefault / 2;
                }
                else {
                    left = (leftPosNewNode + config.nodeWidthDefault / 2) + (i - halfBranches + (branches % 2 ? 0 : 1)) * 180;
                    // if (this.IsMainBranch) {
                    //     equalPostionRight = (leftPosNewNode + config.nodeWidthDefault / 2) + (i - halfBranches + (branches % 2 ? 0 : 1)) * 180;
                    //     left = equalPostionRight >= equalPostionLeft ? equalPostionRight : equalPostionRight;
                    // }
                    top = topPosNewNode + config.nodeSizeDefault / 2;
                }

                if (equalPostionRight != null && equalPostionLeft != null) {
                    this.IsMainBranch = false;
                }

                newTopBranchNode.style.cssText = 'top: ' + (top) + 'px; left: ' + left + 'px;';
                newBotBranchNode.style.cssText = 'top: ' + (this.nodes[target].element.offsetTop - config.nodeGap) + 'px; left: ' + left + 'px;';

                this.container.append(newTopBranchNode);
                this.container.append(newBotBranchNode);

                this.addEndpoints(newTopBranchNode, null, null, topBranchId);
                this.addEndpoints(newBotBranchNode, null, null, botBranchId);

                this.nodes[topBranchId] = {
                    nodeId: topBranchId,
                    previous: `node-${_count}`,
                    next: botBranchId,
                    element: newTopBranchNode,
                    type: SPECIAL_CORNER_NODE,
                    data: [],
                    title: '',
                    parent: `node-${_count}`,
                    count: _count,
                    positionBranch: i
                }
                this.nodes[botBranchId] = {
                    nodeId: botBranchId,
                    previous: topBranchId,
                    next: endId,
                    element: newBotBranchNode,
                    type: SPECIAL_CORNER_NODE,
                    data: [],
                    title: '',
                    parent: `node-${_count}`,
                    count: _count,
                    positionBranch: i
                }
                if (branches % 2 === 1 && Math.floor(branches / 2) === i) {
                    this.connectNodes(
                        null,
                        `node-${_count}-ep-bottom`,
                        `${topBranchId}-ep-top`
                    );
                }
                else if (i < halfBranches) {
                    this.connectNodes(
                        null,
                        `node-${_count}-ep-left`,
                        `${topBranchId}-ep-right`
                    );
                }
                else {
                    this.connectNodes(
                        null,
                        `node-${_count}-ep-right`,
                        `${topBranchId}-ep-left`
                    );
                }

                this.connectNodes(
                    ['Custom', Object.assign({}, overlayPlus(topBranchId, botBranchId, i))],
                    `${topBranchId}-ep-bottom`,
                    `${botBranchId}-ep-top`
                );
                this.connectNodes(
                    null,
                    `${botBranchId}-ep-bottom`,
                    `${endId}-ep-top`
                );

                nodesCornerList.push(topBranchId, botBranchId);
            }
            this.connectNodes(
                ['Custom', Object.assign(overlayPlus(endId, target, position))],
                `${endId}-ep-bottom`,
                `${target}-ep-top`
            );

        }

        // connect from source to new node
        // if source has 2 branches
        if (this.nodes[source].type === SPECIAL_CORNER_NODE) {
            this.connectNodes(
                [
                    'Custom',
                    Object.assign({}, overlayPlus(source, `node-${_count}`, position))
                ],
                `${source}-ep-bottom`,
                `${newNodeId}-ep-top`);
        } else {
            this.connectNodes(['Custom', Object.assign({}, overlayPlus(source, `node-${_count}`, position))], `${source}-ep-bottom`, `node-${_count}-ep-top`);

        }
        if (item.wrapper) {
            this.connectNodes(
                null,
                `node-${_count}-ep-left`,
                `${lefttopId}-ep-right`,
                { strokeWidth: 2, stroke: "#1565C0", dashstyle: "2 4" }
            );
            this.connectNodes(
                null,
                `node-${_count}-ep-right`,
                `${righttopId}-ep-left`,
                { strokeWidth: 2, stroke: "#1565C0", dashstyle: "2 4" }
            );
            this.connectNodes(
                null,
                `${leftbotId}-ep-right`,
                `${endId}-ep-left`,
                { strokeWidth: 2, stroke: "#1565C0", dashstyle: "2 4" }
            );
            this.connectNodes(
                null,
                `${rightbotId}-ep-left`,
                `${endId}-ep-right`,
                { strokeWidth: 2, stroke: "#1565C0", dashstyle: "2 4" }
            );

            this.connectNodes(
                item.wrapper ? null : ['Custom', Object.assign({}, overlayPlus(lefttopId, leftbotId, 'left'))],
                `${lefttopId}-ep-bottom`,
                `${leftbotId}-ep-top`,
                { strokeWidth: 2, stroke: "#1565C0", dashstyle: "2 4" }
            );
            this.connectNodes(
                item.wrapper ? null : ['Custom', Object.assign({}, overlayPlus(righttopId, rightbotId, 'right'))],
                `${righttopId}-ep-bottom`,
                `${rightbotId}-ep-top`,
                { strokeWidth: 2, stroke: "#1565C0", dashstyle: "2 4" }
            );
        }

        if (branches < 1) {
            if (this.nodes[target].type === SPECIAL_CORNER_NODE) {
                this.connectNodes(
                    ['Custom', Object.assign(overlayPlus(`node-${_count}`, target, position))],
                    `node-${_count}-ep-bottom`,
                    `${target}-ep-top`
                )
            } else {
                this.connectNodes(
                    ['Custom', overlayPlus(`node-${_count}`, target, position)],
                    `node-${_count}-ep-bottom`,
                    `${target}-ep-top`
                )
            }
        }

        //debugger
        //        this.firstInstance.draggable(this.paletteBoard);

        // add next previous property to new-node data
        if (position && typeof this.nodes[source].next === 'object' && this.nodes[source].next) {
            this.nodes[source].next[position] = `node-${_count}`;
        }
        else {
            this.nodes[source].next = `node-${_count}`;
        }
        // ////////console.log('source ', position, this.nodes[source].next)
        if (position && typeof this.nodes[target].previous === 'object' && this.nodes[target].previous) {
            this.nodes[target].previous[position] = newEndNode ? `node-end-${_count}` : `node-${_count}`;
        } else {
            this.nodes[target].previous = newEndNode ? `node-end-${_count}` : `node-${_count}`;
        }

        // let datatype = JSON.parse(node.getAttribute('datatype'));
        let newObject = {};
        //////console.log('1806 ', config.taskType[datatype.parent][datatype.type])

        let propertiesClone;
        if (copyTask) {
            if (copyTask.configuration.properties instanceof Array) {
                propertiesClone = [];
                copyTask.configuration.properties.forEach(prop => {
                    propertiesClone.push(Object.assign({}, prop));
                })
            } else {
                propertiesClone = Object.assign({}, copyTask.configuration.properties);
            }
        } else {
            console.log(config)
            propertiesClone = item.schema.type === 'array' ? [] : {};
            if (item.defaultFormData) {
                propertiesClone = item.defaultFormData;
            }
        }

        this.nodes[`node-${_count}`] = {
            number: _count,
            next: '',
            previous: source,
            next: '',
            configuration: {
                actionID: `node-${_count}`,
                actionTitle: item.title,
                actionName: copyTask ? copyTask.configuration.actionName : item.name,
                actionImage: item.actionImage,
                properties: propertiesClone,
                isDisabled: copyTask ? copyTask.configuration.isDisabled : false,
                isHidden: false
            },

            branches: null,
            wrapper: item.wrapper,
            count: _count,
            nodeId: `node-${_count}`,
            element: newNode,
            type: datatype.type,
            branch: branches,
            schema: copyTask && copyTask.schema ? Object.assign({}, copyTask.schema) : item.schema,
            uiSchema: copyTask && copyTask.uiSchema ? Object.assign({}, copyTask.uiSchema) : item.uiSchema,
            onBranch: position,
            parent: '',
            taskType: item.type,
            datatype: datatype,
            // code: config.taskType[datatype.parent][datatype.type].code
        }
        if (this.nodes[newNodeId].configuration.isDisabled) {
            this.nodes[newNodeId].element.classList.add('is-disabled');
        }
        if (branches > 0) {
            this.nodes[newNodeId].next = {};
            this.nodes[endId].previous = {};
            this.nodes[newNodeId].branches = [];
            for (var i = 0; i < branches; i++) {
                this.nodes[newNodeId].next[i] = `node-topbranch_${i}-${_count}`;
                this.nodes[endId].previous[i] = `node-botbranch_${i}-${_count}`;
                this.nodes[`node-${_count}`][i] = [`node-topbranch_${i}-${_count}`, `node-botbranch_${i}-${_count}`];
                this.nodes[newNodeId].branches[i] = Object.assign({}, item.branches[i], { actions: [] });
            }
        } else {
            this.nodes[newNodeId].next = target;
        }

        if (this.nodes[source].parent) {
            ////////console.log(this.nodes[source].parent, this.nodes[source]);
            if (this.nodes[source].type === SPECIAL_END_NODE) {
                parent = this.nodes[this.nodes[source].parent].parent;
            } else {
                parent = this.nodes[source].parent;
            }
        }
        this.nodes[`node-${_count}`].parent = parent;
        let fields = item.fields;

        if (branches >= 1) {
            let currentNestedLevel = 0;
            if (parent) {
                currentNestedLevel = this.nodes[parent].nestedLevel + 1;
            }
            this.nodes[`node-${_count}`].nestedLevel = currentNestedLevel;
        }

        // add this node id to parent left, right array
        if (parent) {
            if (branches >= 1 && position) {
                this.nodes[parent][position] = [
                    ...this.nodes[parent][position],
                    `node-${_count}`,
                    `node-end-${_count}`,
                    ...nodesCornerList
                ];
            }
            else if (position) {
                ////////console.log('===) add new node to parent ', parent, position, `node-${_count}`)
                if (this.nodes[parent][position]) {
                    this.nodes[parent][position].push(`node-${_count}`);
                } else {
                    this.nodes[parent][position] = [`node-${_count}`];
                }
            }

            let cP = this.nodes[parent].parent;
            while (cP) {
                if (this.nodes[cP].branch >= 1) {
                    let positionBranch;
                    for (var i = 0; i < this.nodes[cP].branch; i++) {
                        if (this.nodes[cP][i].includes(parent)) positionBranch = i;
                    }
                    if (branches >= 1) {
                        this.nodes[cP][positionBranch] = [
                            ...this.nodes[cP][positionBranch],
                            `node-${_count}`,
                            `node-end-${_count}`,
                            ...nodesCornerList
                        ]
                    }
                    else {
                        this.nodes[cP][positionBranch].push(`node-${_count}`);
                    }
                }
                ////////console.log(this.nodes[cP])
                cP = this.nodes[cP].parent;
                // ////////console.log('2605 cP ', cP)
            }
        }

        if (branches >= 1 && this.nodes[`node-${_count}`].parent) self.expandFlowchart(this.nodes[`node-${_count}`].parent, `node-${_count}`, position);

        this.firstInstance.repaintEverything();
        ////console.log(this.nodes)
        // increase _count variable
        _count++;
    }

    ////console.log(this.nodes[this.curCopyTask], this.curCopyTask)
    addBranchTaskToPlaceHolder = (task, placeholder) => {

        // this.setState({paletteActive: true});
        let plusIcon = placeholder.querySelector('.dropable-zone');
        let source = plusIcon.getAttribute('data-source');
        let target = plusIcon.getAttribute('data-target');
        let branch = plusIcon.getAttribute('data-position');
        let self = this;
        let newParent = `node-${_count}`;
        let endBranchNode;

        ////console.log('addBranchTaskToPlaceHolder', task, self.nodes)
        let taskCount = _count;
        self.addTaskToDropZone(placeholder, null, self.nodes[task].datatype, self.nodes[task]);
        // renameTask(`node-${_count-1}`, self.nodes, self.nodes[task].displayName);
        let endId = `node-end-${self.nodes[task].count}`;
        for (var i = 0; i < self.nodes[task].branch; i++) {
            let cNode = self.nodes[task].next[i];
            let countInBranch;
            ////console.log('2706 branch =====>  ', cNode, newParent)
            while (cNode !== endId) {

                ////console.log('2706 cNode ****', cNode)
                if (self.nodes[cNode].type === SPECIAL_END_NODE || self.nodes[cNode].type === SPECIAL_CORNER_NODE) {
                    cNode = self.nodes[cNode].next;
                }
                else if (cNode === newParent) {
                    cNode = `node-end-${self.nodes[cNode].count}`;
                }
                else {
                    let previous = self.nodes[cNode].previous;
                    let next = self.nodes[cNode].next;
                    ////console.log('previous, next ', previous, next, self.nodes[previous], self.nodes[next])
                    if (self.nodes[previous].type === SPECIAL_CORNER_NODE) {
                        previous = `node-topbranch_${i}-${taskCount}`;
                    } else if (self.nodes[previous].type === SPECIAL_END_NODE) {
                        previous = `node-end-${countInBranch}`;
                    }
                    else {
                        previous = `node-${_count - 1}`;
                    }
                    next = `node-botbranch_${i}-${taskCount}`;

                    let o = self.getOverlayBySourceTarget(previous, next);
                    if (!self.nodes[cNode].branch) {
                        self.addTaskToDropZone(o, null, this.nodes[cNode].datatype, self.nodes[cNode]);
                        // renameTask(`node-${_count-1}`, self.nodes, self.nodes[cNode].displayName);
                        cNode = self.nodes[cNode].next;
                    }
                    else {
                        countInBranch = _count;
                        addBranchTaskToPlaceHolder(cNode, o);
                        cNode = self.nodes[`node-end-${self.nodes[cNode].count}`].next;
                    }
                }
            }
        }
    }

    handleClickOverlay(overlay, e, i) {
        if (e.target.className.indexOf('jtk-overlay') >= 0) return;
        if (!this.curCopyTask) return;
        ////console.log('handleClickOverlay ', overlay, e, i)
        this.currentFocusOverlay = overlay;

        if (!this.nodes[this.curCopyTask].branch) {
            this.addTaskToDropZone(overlay.canvas, null, this.nodes[this.curCopyTask].datatype, this.nodes[this.curCopyTask]);
            // renameTask(`node-${_count-1}`, self.nodes, self.nodes[this.curCopyTask].displayName);
            this.curCopyTask = null;
        } else {
            let parent = this.nodes[this.curCopyTask];
            this.addBranchTaskToPlaceHolder(this.curCopyTask, overlay.canvas);
        }
        this.curCopyTask = null;
    }

    moveDownFlowchart(item, type, position, branches) {
        if (!this.nodes[item]) return;
        // this.nodes[item].element.style.top = `${this.nodes[item].element.offsetTop + _gap}px`;
        ////console.log('moveDownFlowchart', type, item, this.nodes[item].previous, this.nodes)
        let currentGap = this.nodes[item].element.offsetTop - this.nodes[this.nodes[item].previous].element.offsetTop - this.nodes[this.nodes[item].previous].element.offsetHeight;
        let gapPlus;
        let self = this;
        if (branches >= 2) {
            gapPlus = config.nodeGap * 3 + config.nodeSizeDefault / 2;
        } else if (branches === 1) {
            gapPlus = config.nodeGap * 3 + config.nodeSizeDefault;
        }
        else {
            gapPlus = config.nodeGap * 2 + config.nodeSizeDefault;
        }
        //////console.log('0806 moveDownFlowchart ', branches, item, this.nodes[item], currentGap, gapPlus)
        gapPlus = gapPlus - currentGap;
        while (item) {
            ////console.log('08/06 ', item, gapPlus)
            this.nodes[item].element.style.top = `${this.nodes[item].element.offsetTop + gapPlus}px`;
            let itemP = item.split('-');
            let corner;
            // switch (itemP[1]) {
            //     case 'leftbot':
            //         corner = 'rightbot';
            //         break;
            //     case 'lefttop':
            //         corner = 'righttop';
            //         break;
            //     case 'righttop':
            //         corner = 'lefttop';
            //         break;
            //     case 'rightbot':
            //         corner = 'leftbot';
            //         break;
            //     default:
            //         break;
            // }
            //
            // // ////////console.log('moveDownFlowchart ', item, itemP, corner)
            // if (['rightbot', 'righttop', 'lefttop', 'leftbot'].includes(itemP[1])) {
            //     this.nodes[`${itemP[0]}-${corner}-${itemP[2]}`].element.style.top = `${this.nodes[`${itemP[0]}-${corner}-${itemP[2]}`].element.offsetTop + gapPlus}px`;
            // }
            if (itemP[1].indexOf('botbranch') >= 0) {
                let c = this.nodes[item].count;
                for (var i = 0; i < this.nodes[this.nodes[item].parent].branch; i++) {
                    if (item === `node-botbranch_${i}-${c}`) continue;
                    ////////console.log('0806 move down ', `node-botbranch_${i}-${c}`, `${this.nodes[`node-botbranch_${i}-${c}`].element.style.offsetTop + gapPlus}px`)
                    this.nodes[`node-botbranch_${i}-${c}`].element.style.top = `${this.nodes[`node-botbranch_${i}-${c}`].element.offsetTop + gapPlus}px`;
                    ////////console.log('0806 move down ', this.nodes[`node-botbranch_${i}-${c}`].element.style.offsetTop)
                }
                item = this.nodes[item].next;
                continue;
            }
            // ////////console.log(this.nodes[item], position)
            // if (typeof this.nodes[item].next === 'object' && this.nodes[item].next && !position) {
            //     self.nodes[item].left.forEach(child => {
            //         self.nodes[child].element.style.top = `${this.nodes[child].element.offsetTop + gapPlus}px`;
            //     });
            //     self.nodes[item].right.forEach(child => {
            //         self.nodes[child].element.style.top = `${this.nodes[child].element.offsetTop + gapPlus}px`;
            //     });
            //     item = `${itemP[0]}-end-${itemP[1]}`;
            // }
            ////////console.log('======> ', item, self.nodes[item], `node-leftbot-${self.nodes[item].count}`, item, self.nodes)
            if (this.nodes[item].type === SPECIAL_END_NODE && this.nodes[item].parent && this.nodes[this.nodes[item].parent].wrapper) {
                let itemLeft = `node-leftbot-${self.nodes[item].count}`;
                let itemRight = `node-rightbot-${self.nodes[item].count}`;
                this.nodes[itemLeft].element.style.top = `${this.nodes[itemLeft].element.offsetTop + gapPlus}px`;
                this.nodes[itemRight].element.style.top = `${this.nodes[itemRight].element.offsetTop + gapPlus}px`;
            }
            if (this.nodes[item].wrapper) {
                //////console.log('moveDownFlowchart ', this.nodes[item])
                this.nodes[`node-lefttop-${this.nodes[item].count}`].element.style.top = this.nodes[`node-lefttop-${this.nodes[item].count}`].element.offsetTop + gapPlus + 'px';
                this.nodes[`node-leftbot-${this.nodes[item].count}`].element.style.top = this.nodes[`node-leftbot-${this.nodes[item].count}`].element.offsetTop + gapPlus + 'px';
                this.nodes[`node-righttop-${this.nodes[item].count}`].element.style.top = this.nodes[`node-righttop-${this.nodes[item].count}`].element.offsetTop + gapPlus + 'px';
                this.nodes[`node-rightbot-${this.nodes[item].count}`].element.style.top = this.nodes[`node-rightbot-${this.nodes[item].count}`].element.offsetTop + gapPlus + 'px';
            }
            if (this.nodes[item].branch >= 1) {
                for (var i = 0; i < this.nodes[item].branch; i++) {
                    this.nodes[item][i].forEach(n => {
                        this.nodes[n].element.style.top = `${this.nodes[n].element.offsetTop + gapPlus}px`;
                    });
                }

                this.nodes[`node-end-${this.nodes[item].count}`].element.style.top = `${this.nodes[`node-end-${this.nodes[item].count}`].element.offsetTop + gapPlus}px`;
                item = `node-end-${this.nodes[item].count}`;
            }
            if (!this.nodes[item].branch) {
                //////console.log(item, this.nodes[item])
                item = this.nodes[item].next;
            }
            ////////console.log(item)
        }

    }

    narrowFlowchart(deletedTask) {
        let self = this;
        let parent = this.nodes[deletedTask].parent;
        let child = deletedTask;
        while (parent) {

            let colLeft = Number.MAX_SAFE_INTEGER;
            let colRight = Number.MIN_SAFE_INTEGER;
            let deletedTaskOnBranch = Number(this.nodes[child].onBranch);
            let rightPosOfPre = Number.MIN_SAFE_INTEGER;
            let leftPosOfNext = Number.MAX_SAFE_INTEGER;
            let gapLeft, gapRight;
            let narrowLeft, narrowRight;
            let parentHalfBranch = Math.floor(this.nodes[parent].branch / 2);
            let centerPosition = self.nodes[parent].element.offsetLeft + self.nodes[parent].element.offsetWidth / 2;
            ////console.log('2606', parent, child)
            this.nodes[parent][deletedTaskOnBranch].forEach((item, i) => {
                ////console.log('asdfsadfas', item)
                if (item === deletedTask || this.nodes[item].parent === deletedTask) return;
                ////console.log('=====> ', item)
                let l = this.nodes[item].element.offsetLeft;
                // ////console.log(colLeft, l)
                if (colLeft > l) colLeft = l;
                let r = this.nodes[item].element.offsetLeft + (this.nodes[item].element.offsetWidth);
                if (colRight < r) colRight = r;
            });

            // right position of Previous branch
            if (deletedTaskOnBranch == 0) rightPosOfPre = colLeft;
            else {
                this.nodes[parent][deletedTaskOnBranch - 1].forEach((item, i) => {
                    let r = this.nodes[item].element.offsetLeft + this.nodes[item].element.offsetWidth;
                    if (rightPosOfPre < r) rightPosOfPre = r;
                });
            }

            // left position of next branch
            if (deletedTaskOnBranch + 1 == this.nodes[parent].branch) leftPosOfNext = colRight;
            else {
                this.nodes[parent][deletedTaskOnBranch + 1].forEach((item, i) => {
                    let l = this.nodes[item].element.offsetLeft;
                    if (leftPosOfNext > l) leftPosOfNext = l;
                });
            }

            gapLeft = colLeft - rightPosOfPre;
            gapRight = leftPosOfNext - colRight;

            if (gapLeft > 180) narrowLeft = gapLeft - 180;
            if (gapRight > 180) narrowRight = gapRight - 180;
            if (!narrowLeft && !narrowRight) {
                child = parent;
                parent = this.nodes[child].parent;
                return;
            }

            if (deletedTaskOnBranch === parentHalfBranch && self.nodes[parent].branch % 2) {
                if (narrowLeft) {
                    for (var i = 0; i < parentHalfBranch; i++) {
                        this.nodes[parent][i].forEach((nodeId, j) => {
                            self.nodes[nodeId].element.style.left = self.nodes[nodeId].element.offsetLeft + (narrowLeft) + 'px';
                        });
                    }
                }
                if (narrowRight) {
                    for (var i = parentHalfBranch + 1; i < self.nodes[parent].branch; i++) {
                        this.nodes[parent][i].forEach((nodeId, j) => {
                            self.nodes[nodeId].element.style.left = self.nodes[nodeId].element.offsetLeft - (narrowRight) + 'px';
                        })
                    }
                }
            }
            else if (deletedTaskOnBranch < parentHalfBranch) {
                if (narrowLeft) {
                    for (var i = 0; i < deletedTaskOnBranch; i++) {
                        this.nodes[parent][i].forEach((nodeId, j) => {
                            self.nodes[nodeId].element.style.left = self.nodes[nodeId].element.offsetLeft + (narrowLeft) + 'px';
                        });
                    }
                }
                if (narrowRight) {
                    for (var i = 0; i <= deletedTaskOnBranch; i++) {
                        this.nodes[parent][i].forEach((nodeId, j) => {
                            // depend on gap between this element and center position
                            let gap = centerPosition - colRight;
                            ////console.log('=====> nodeId', nodeId, gap, deletedTaskOnBranch + 1 === parentHalfBranch, (deletedTaskOnBranch + 1 === parentHalfBranch) ? gap - 180 : narrowRight)
                            self.nodes[nodeId].element.style.left = self.nodes[nodeId].element.offsetLeft
                                + ((deletedTaskOnBranch + 1 === parentHalfBranch) ? gap - 180 : narrowRight) + 'px';
                        });
                    }
                }
            }
            else if (deletedTaskOnBranch >= parentHalfBranch) {
                if (narrowLeft) {
                    for (var i = deletedTaskOnBranch; i < this.nodes[parent].branch; i++) {
                        ////console.log(this.nodes[parent][i])
                        // depend on gap between this element and center position
                        let gap = colLeft - centerPosition;
                        this.nodes[parent][i].forEach((nodeId, j) => {
                            self.nodes[nodeId].element.style.left = self.nodes[nodeId].element.offsetLeft
                                - ((deletedTaskOnBranch === parentHalfBranch) ? gap - 180 : narrowLeft) + 'px';
                        });
                    }
                }
                if (narrowRight) {
                    for (var i = deletedTaskOnBranch + 1; i < this.nodes[parent].branch; i++) {
                        this.nodes[parent][i].forEach((nodeId, j) => {
                            self.nodes[nodeId].element.style.left = self.nodes[nodeId].element.offsetLeft - (narrowRight) + 'px';
                        });
                    }
                }
            }
            child = parent;
            parent = this.nodes[child].parent;
        }
    }

    expandFlowchart(item, childItem, position) {
        let self = this;
        let count = 1;

        while (item) {
            let childCenter = this.nodes[`node-end-${this.nodes[childItem].count}`].element.offsetLeft;
            let self = this;
            let childColumns = self.nodes[childItem].branch;
            let childLeftColumns = Number.MAX_SAFE_INTEGER;
            let childRightColumns = Number.MIN_SAFE_INTEGER;

            this.nodes[childItem][0].forEach(nodeId => {
                if (childLeftColumns > self.nodes[nodeId].element.offsetLeft) childLeftColumns = self.nodes[nodeId].element.offsetLeft;
            });

            this.nodes[childItem][this.nodes[childItem].branch - 1].forEach(nodeId => {
                if (childRightColumns < self.nodes[nodeId].element.offsetLeft + self.nodes[nodeId].element.offsetWidth) {
                    childRightColumns = self.nodes[nodeId].element.offsetLeft + self.nodes[nodeId].element.offsetWidth;
                }
            });
            childLeftColumns = (childCenter - childLeftColumns) / 180;
            childRightColumns = (childRightColumns - childCenter) / 180;

            let childOnBranch;
            let childHalfColumn = Math.floor(childColumns / 2);
            for (var i = 0; i < self.nodes[item].branch; i++) {
                if (self.nodes[item][i].includes(childItem)) childOnBranch = i;
            }
            let parentHalfBranch = Math.floor(self.nodes[item].branch / 2);
            let leftGap;
            let rightGap;
            // calculate expect rightgap
            let leftColumnsNextBranch = Number.MAX_SAFE_INTEGER;
            if (childOnBranch + 1 === self.nodes[item].branch) {
                leftColumnsNextBranch = 0;
            } else {
                let centerNextBranch = self.nodes[`node-topbranch_${childOnBranch + 1}-${self.nodes[item].count}`].element.offsetLeft;
                this.nodes[item][childOnBranch + 1].forEach(nodeId => {
                    if (leftColumnsNextBranch > self.nodes[nodeId].element.offsetLeft) leftColumnsNextBranch = self.nodes[nodeId].element.offsetLeft;
                })
                leftColumnsNextBranch = (centerNextBranch - leftColumnsNextBranch) / 180;
            }
            // end calculate expect rightgap
            // calculate expect leftgap
            let rightColumnsPreBranch = Number.MIN_SAFE_INTEGER;
            if (childOnBranch === 0) {
                rightColumnsPreBranch = 0;
            } else {
                let centerPreBranch = self.nodes[`node-topbranch_${childOnBranch - 1}-${self.nodes[item].count}`].element.offsetLeft;
                this.nodes[item][childOnBranch - 1].forEach(nodeId => {
                    if (rightColumnsPreBranch < self.nodes[nodeId].element.offsetLeft + self.nodes[nodeId].element.offsetWidth) {
                        rightColumnsPreBranch = self.nodes[nodeId].element.offsetLeft + self.nodes[nodeId].element.offsetWidth;
                    }
                })
                rightColumnsPreBranch = (rightColumnsPreBranch - centerPreBranch) / 180;
            }
            let expectLeftGap = (childLeftColumns + rightColumnsPreBranch + 1) * 180;
            let expectRightGap = (childRightColumns + leftColumnsNextBranch + 1) * 180;

            if (childOnBranch === 0) leftGap = expectLeftGap + 1;
            else {
                leftGap = this.nodes[`node-topbranch_${childOnBranch}-${this.nodes[item].count}`].element.offsetLeft - this.nodes[`node-topbranch_${childOnBranch - 1}-${this.nodes[item].count}`].element.offsetLeft;
            }
            if (childOnBranch === self.nodes[item].branch - 1) {
                rightGap = expectRightGap + 1;
            } else {
                rightGap = - this.nodes[`node-topbranch_${childOnBranch}-${this.nodes[item].count}`].element.offsetLeft + this.nodes[`node-topbranch_${childOnBranch + 1}-${this.nodes[item].count}`].element.offsetLeft;
            }

            if (childOnBranch === parentHalfBranch && self.nodes[item].branch % 2) {
                if (leftGap <= expectLeftGap) {
                    for (var i = 0; i < parentHalfBranch; i++) {
                        this.nodes[item][i].forEach((nodeId, j) => {
                            this.nodes[nodeId].element.style.left = this.nodes[nodeId].element.offsetLeft - (expectLeftGap - leftGap) + 'px';
                        });
                    }
                }
                for (var i = parentHalfBranch + 1; i < self.nodes[item].branch; i++) {
                    this.nodes[item][i].forEach((nodeId, j) => {
                        self.nodes[nodeId].element.style.left = self.nodes[nodeId].element.offsetLeft + (expectRightGap - rightGap) + 'px';
                    })
                }
            }
            else if (childOnBranch < parentHalfBranch) {
                if (rightGap <= expectRightGap) {
                    for (var i = 0; i <= childOnBranch; i++) {
                        this.nodes[item][i].forEach((nodeId, j) => {
                            self.nodes[nodeId].element.style.left = self.nodes[nodeId].element.offsetLeft - (expectRightGap - rightGap) + 'px';
                        });
                    }
                }
                if (leftGap <= expectLeftGap) {
                    for (var i = 0; i < childOnBranch; i++) {
                        this.nodes[item][i].forEach((nodeId, j) => {
                            self.nodes[nodeId].element.style.left = self.nodes[nodeId].element.offsetLeft - (expectLeftGap - leftGap) + 'px';
                        });
                    }
                }
            }
            else if (childOnBranch >= parentHalfBranch) {
                if (leftGap <= expectLeftGap) {
                    for (var i = childOnBranch; i < this.nodes[item].branch; i++) {
                        this.nodes[item][i].forEach((nodeId, j) => {
                            ////console.log('====> bug ', nodeId)
                            self.nodes[nodeId].element.style.left = self.nodes[nodeId].element.offsetLeft + (expectLeftGap - leftGap) + 'px';
                        });
                    }
                }
                if (leftGap <= expectLeftGap) {
                    for (var i = childOnBranch + 1; i < this.nodes[item].branch; i++) {
                        this.nodes[item][i].forEach((nodeId, j) => {
                            self.nodes[nodeId].element.style.left = self.nodes[nodeId].element.offsetLeft + (expectRightGap - rightGap) + 'px';
                        });
                    }
                }
            }
            if (this.nodes[item].wrapper) {
                let itemp = item.split('-');
                let endItem = `${itemp[0]}-end-${itemp[1]}`;
                let width = 0;
                let cornerPosition = getWidthOfGroup(self.nodes, item);
                if (cornerPosition.left !== false) {
                    self.nodes[`node-lefttop-${self.nodes[item].count}`].element.style.left = `${cornerPosition.left - 15}px`;
                    self.nodes[`node-leftbot-${self.nodes[item].count}`].element.style.left = `${cornerPosition.left - 15}px`;
                }
                if (cornerPosition.right !== false) {
                    self.nodes[`node-righttop-${self.nodes[item].count}`].element.style.left = `${cornerPosition.right + 15}px`;
                    self.nodes[`node-rightbot-${self.nodes[item].count}`].element.style.left = `${cornerPosition.right + 15}px`;
                }
            }

            childItem = item;
            item = this.nodes[item].parent;
            count++;
        }
    }

    hoverTaskAction(e) {

    }

    flowchartToJson() {
        let itemId = this.nodes[NODE_START].next;
        let data = [];
        let text = '[\r\n';
        let self = this;
        let jsonData = {
            "workflowName": "",
            "workflowDescription": "",
            "workflowType": "",
            "isPublished": 0,
            "definition": {
                "variables": [],
                "actions": [],
                "settings": {}
            },
            "createdTime": "",
            "createdBy": "",
            "modifiedTime": "",
            "modifiedBy": "",

        };
        // if (this.importData) {
        //     jsonData = Object.assign({}, this.importData, {
        //         workflowDefinition: {
        //             state: { modified: false },
        //             actions: [],
        //             settings: {}
        //         }
        //     })
        // }
        while (itemId && itemId !== NODE_END) {
            //////console.log(itemId, this.nodes[itemId])
            if (this.nodes[itemId].type === SPECIAL_END_NODE) {
                itemId = this.nodes[itemId].next;
                continue;
            }
            if (this.nodes[itemId].type === 'set_variables') {
                //console.log('getTaskData call')
                jsonData.definition.actions.push(getTaskData(this.nodes[itemId], this.nodes));
            }
            else if (this.nodes[itemId].branch >= 1) {
                let data = self.getDataBranchNode(itemId);
                //console.log('0207 ---------> ', data)
                // text+= `${data},\r\n`;
                //console.log('getTaskData call')
                jsonData.definition.actions.push(getTaskData(data, this.nodes));
            }
            else {
                //console.log('getTaskData call')
                jsonData.definition.actions.push(getTaskData(this.nodes[itemId], this.nodes));

            }
            if (self.nodes[itemId].branch >= 1) {
                let itemIdP = itemId.split('-');
                itemId = `${itemIdP[0]}-end-${itemIdP[1]}`;
            } else {
                itemId = this.nodes[itemId].next;
            }
        }
        // text += ']';
        jsonData.definition.variables = self.getVariablesHardcode();
        jsonData.definition.settings = this.props.workflowSettingReducer.detail;
        jsonData.workflowType = this.props.workflowSettingReducer.detail.workflowType;
        jsonData.workflowName = this.props.workflowSettingReducer.detail.workflowName;
        jsonData.workflowDescription = this.props.workflowSettingReducer.detail.workflowDescription;
        return jsonData;
    }

    exportFlowchart() {
        let data = this.flowchartToJson();

        // downloadJSON(JSON.stringify(data, null, "\t"), 'flowchart.json', 'text/plain');
        downloadJSON(JSON.stringify(data, null, '\t'), 'flowchart.json', 'text/plain');
    }

    getDataBranchNode(node) {

        if (node === this.flexibleNode.id) {
            this.flexibleNode.id = null;
            return this.flexibleNode.jsonData;
        }

        let self = this;
        let left = self.nodes[node].next.left;
        let right = self.nodes[node].next.right;
        let leftData = [];
        let rightData = [];
        let nodeP = node.split('-');
        let newData = [];
        let actionsData = Object.assign({}, self.nodes[node], { branches: [] });

        for (var i = 0; i < self.nodes[node].branch; i++) {
            let cNode = self.nodes[self.nodes[node].next[i]].next;
            let endBranchId = `node-botbranch_${i}-${self.nodes[node].count}`;
            newData[i] = [];
            let curBranch = Object.assign({}, this.nodes[node].branches[i], { actions: [] });
            while (cNode !== endBranchId) {
                //console.log('ele in branch  ', cNode, this.nodes[cNode])
                ////console.log('get data while ', cNode, endBranchId, this.nodes[cNode])
                let l = '';
                if (this.nodes[cNode].type === SPECIAL_END_NODE || this.nodes[cNode].type === SPECIAL_CORNER_NODE) {
                    cNode = self.nodes[cNode].next;
                    continue;
                }
                if (this.nodes[cNode].type === 'set_variables') {
                    //console.log('getTaskData call')
                    curBranch.actions.push(getTaskData(this.nodes[cNode], this.nodes));
                }
                else if (self.nodes[cNode].branch >= 1) {
                    l = self.getDataBranchNode(cNode);
                    //console.log('getTaskData call')
                    curBranch.actions.push(getTaskData(l, this.nodes));
                }

                else {
                    //console.log('getTaskData call')
                    curBranch.actions.push(getTaskData(this.nodes[cNode], this.nodes));
                }
                if (self.nodes[cNode].branch >= 1) {
                    cNode = `node-end-${this.nodes[cNode].count}`;
                } else {
                    cNode = self.nodes[cNode].next;
                }
            }
            actionsData.branches[i] = curBranch;
        }
        //console.log('0207 --> ', actionsData)
        return actionsData;
    }

    getDataBranchTask(node) {
        //////console.log(node, this.nodes[node])
        let self = this;
        let cNode = this.nodes[node].next[0];
        let endId = `node-end-${this.nodes[node].count}`;
        let data = [];
        let text = '';
        let actionsData = Object.assign({}, self.nodes[node], { branches: [] });
        // if (!actionsData.branches) actionsData.branches = [];
        // actionsData.branches = [];
        //////console.log(cNode)
        let curBranch = Object.assign({}, this.nodes[node].branches[0], { actions: [] });
        while (cNode !== endId) {
            ////console.log('0106 ', cNode, this.nodes[cNode])
            let l;
            if (this.nodes[cNode].type === 'set_variables') {
                //console.log('getTaskData call')
                actionsData.branches[0].actions.push(getTaskData(this.nodes[cNode], this.nodes));
            }
            else if (self.nodes[cNode].branch >= 1) {
                l = self.getDataBranchNode(cNode);
                actionsData.branches[0].actions.push(getTaskData(cNode, this.nodes));
            }

            else if (self.nodes[cNode].type !== SPECIAL_END_NODE && this.nodes[cNode].type !== SPECIAL_CORNER_NODE) {
                //console.log('getTaskData call')
                actionsData.branches[0].actions.push(getTaskData(this.nodes[cNode], this.nodes));
            }
            // if (l) data.push(l);
            if (self.nodes[cNode].branch >= 1) {
                cNode = `node-end-${this.nodes[cNode].count}`;
            } else {
                cNode = this.nodes[cNode].next;
            }
        }
        return actionsData;
    }

    saveFlowchart = async () => {
        let { permission } = this.state;
        let data = this.flowchartToJson();
        let temPermission = {};
        let version = "0.1";
        const workflow_versions = this.state.workflow_versions.sort((a, b) => parseFloat(b.version) - parseFloat(a.version));
        if (workflow_versions.length != 0) {
            version = parseFloat((workflow_versions[0].version + 0.1).toFixed(2));
        }

        temPermission.read = permission.read ? (permission.read.map((member) => ({ id: member.value, email: member.label }))) : [];
        temPermission.design = permission.design ? (permission.design.map((member) => ({ id: member.value, email: member.label }))) : [];
        data._id = getQueryString().id != "" ? getQueryString().id : "";
        data["version"] = version;
        data["permission"] = temPermission;
        data["createdBy"] = this.props.user.User_data._id;
        data["modifiedBy"] = this.props.user.User_data._id;
        data["createdTime"] = new Date().toISOString();
        data["modifiedTime"] = new Date().toISOString();
        const resData = await this.props.onClickSaveWorkflow(data);
        workflow_versions.push(resData.workflow_versions_data);
        this.setState({ workflow_versions: workflow_versions });
    }

    publishFlowchart = async () => {
        let { permission } = this.state, data = this.flowchartToJson(), temPermission = {}, version = 1;
        const workflow_versions = this.state.workflow_versions.sort((a, b) => parseFloat(b.version) - parseFloat(a.version));
        if (workflow_versions.length != 0) {
            version = parseFloat((workflow_versions[0].version + 1).toFixed(0));
        }
        temPermission.read = permission.read ? (permission.read.map((member) => ({ id: member.value, email: member.label }))) : [];
        temPermission.design = permission.design ? (permission.design.map((member) => ({ id: member.value, email: member.label }))) : [];
        data._id = getQueryString().id != "" ? getQueryString().id : "";
        data["version"] = version;
        data["isPublished"] = 1;
        data["permission"] = temPermission;
        data["createdBy"] = this.props.user.User_data._id;
        data["modifiedBy"] = this.props.user.User_data._id;
        data["createdTime"] = new Date().toISOString();
        data["modifiedTime"] = new Date().toISOString();
        const resData = await this.props.onClickSaveWorkflow(data);
        workflow_versions.push(resData.workflow_versions_data);
        this.setState({ workflow_versions: workflow_versions })
    }

    importFlowchart() {
        //console.log('importFlowchart')
        this.setState({ jsonFileInputDisplay: !this.state.jsonFileInputDisplay });
    }

    importedJsonFile(jsonData) {
        let temPermission = jsonData.permission ? { ...jsonData.permission } : { read: [], readAl: [], write: [], design: [] }
        temPermission.read = temPermission.read ? temPermission.read.map((member) => ({ value: member.id, label: member.email })) : [];
        temPermission.design = temPermission.design ? temPermission.design.map((member) => ({ value: member.id, label: member.email })) : [];
        this.setState({ permission: temPermission, workflow_versions: jsonData.workflow_versions ? jsonData.workflow_versions : this.state.workflow_versions });
        this.importData = jsonData;
        this.reRenderFromFile();
        jsonData && jsonData.definition && this.props.updateWorkflowSetting(this.importData.definition.settings);
        jsonData && jsonData.definition && this.props.updateWorkflowVariables(this.importData.definition.variables);
    }

    updateFormVar(node, value) {
        let self = this;
        self.variables[node] = {};
        value.forEach(item => {
            //////console.log('item ', item)
            self.variables[node][item.var] = item.value;
        });
    }

    componentWillReceiveProps(newProps) {
        console.log(newProps.workflowobj)
        console.log(newProps.is_import)
        console.log('componentWillReceiveProps ', newProps)
        let self = this;
        if (newProps.workflowobj) {
            self.onload();
        }
    }

    updateWorkflowPermission = (permission) => {
        this.setState({ permission: permission, newWorkflowSetup: false })
    }

    onSelectedVerstion = (item) => {
        const { modalVestionHistoryLog, rolloutConfirmation } = this.state;
        let jsonData = this.importData;
        jsonData["definition"] = item.definition;

        this.importData = jsonData;
        this.reRenderFromFile();
        jsonData && jsonData.definition && this.props.updateWorkflowSetting(this.importData.definition.settings);
        jsonData && jsonData.definition && this.props.updateWorkflowVariables(this.importData.definition.variables);
        Toast('rollout successfully.');
        this.setState({ modalVestionHistoryLog: !modalVestionHistoryLog, rolloutConfirmation: !rolloutConfirmation })
    }

    handleRollOutConfirm = (status) => {
        const { selected_item_version, rolloutConfirmation } = this.state;
        if (status) {
            this.onSelectedVerstion(selected_item_version)
        } else {
            this.setState({ rolloutConfirmation: !rolloutConfirmation })
        }
    }


    render() {
        let self = this;

        const { newWorkflowSetup, modalVestionHistoryLog, rolloutConfirmation } = this.state;

        const workflow_versions = this.state.workflow_versions.sort((a, b) => parseFloat(b.version) - parseFloat(a.version));

        return (
            <div className="panel worflow-design-panel">
                <div className="panel-heading collection-header">
                    <div className="panel-action">
                        {(workflow_versions && workflow_versions.length != 0) &&
                            <Button size="sm" className='btn workflow-history-log' onClick={() => this.setState({ modalVestionHistoryLog: !modalVestionHistoryLog })} >
                                <span>
                                    <span>{"Version " + workflow_versions[0].version}</span>
                                    <i class="material-icons">history</i>
                                </span>
                            </Button>
                        }

                        <Button size="sm" className='btn mr-2' onClick={() => this.saveFlowchart()}> Save</Button>
                        <Button size="sm" className='btn mr-2' onClick={() => this.publishFlowchart()}>Publish</Button>
                        <Button size="sm" className='btn mr-2' onClick={this.importFlowchart}>Import</Button>
                        <Button size="sm" className='btn mr-2' onClick={this.exportFlowchart}>Export</Button>
                        <Button size="sm" className='btn mr-2' onClick={this.props.onClickDesigner}>Cancel</Button>

                    </div>
                </div>

                <ModalConfirmation IsModalConfirmation={rolloutConfirmation} showOkButton={true} showCancelButton={true} title="Rollout Workflow Version" text="Are you sure rollout workflow this version?" onClick={(response) => this.handleRollOutConfirm(response)} />

                {modalVestionHistoryLog &&
                    <Modal size="lg" isOpen={true} toggle={() => this.setState({ modalVestionHistoryLog: !modalVestionHistoryLog })} centered>
                        <ModalHeader toggle={() => this.setState({ modalVestionHistoryLog: !modalVestionHistoryLog })} className="modal-header"><h5>Version log</h5></ModalHeader>
                        <ModalBody style={{ padding: "0px" }}>
                            <table className="table table-workflow-version ">
                                <thead>
                                    <tr>
                                        <th>Version</th>
                                        <th>Modified Date</th>
                                        <th>Status</th>
                                        <th>Roll Back</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workflow_versions.map(item => (
                                        <tr>
                                            <th>{item.version}</th>
                                            <td>{moment(item.modifiedTime).format("DD/MM/YYYY | h:mm a")}</td>
                                            <td>{item.is_publish == 1 ? 'Published' : 'Modified'}</td>
                                            {/* <td scope='row-1'>02/04/2021 | 05:01 PM</td> */}
                                            <td><i onClick={() => this.setState({ rolloutConfirmation: true, selected_item_version: item })} class="fa fa-history" aria-hidden="true"></i></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </ModalBody>
                    </Modal>
                }
                {
                    newWorkflowSetup &&
                    <Modal size="lg" isOpen={true} toggle={self.props.onCloseDesigner} centered>
                        <ModalBody style={{ padding: "0px" }}>
                            <WorkflowDesignSetup
                                updateWorkflowPermission={this.updateWorkflowPermission}
                                onHandeHide={self.props.onCloseDesigner} />
                        </ModalBody>
                    </Modal>
                }

                <div className="panel-body bg-white designer-container">
                    <div className="designer-tab-wrapper">
                        {
                            this.state.tabs.map(item => (
                                <div key={item.id}
                                    onClick={() => this.selectTab(item.id)}
                                    className={`designer-tab-item unselectable ${item.id === self.state.currentTab ? 'active' : ''}`}>
                                    {item.title}
                                </div>
                            ))
                        }
                        <div className={`designer-tab-empty`}></div>
                    </div>


                    <div className={`designer-wrapper designer-flowchart-setting-tab ${this.state.currentTab === 'workflowDesigner' ? 'hide' : ''}`}>
                        <div className="designer-flowchart-setting-inner">
                            <div className="designer-flowchart-detail">
                                <WorkflowSetting data={this.props.workflowSettingReducer.detail} handleChange={this.handleChangeWorkflowSetting} />
                            </div>
                            <div className="designer-flowchart-variables">
                                <div className="designer-flowchart-variables-title">
                                    <span>Variables</span>
                                    <span className="plus fa fa-plus-circle" onClick={() => this.props.toggleSettingVariableForm(true)} />
                                </div>
                                <WorkflowSettingVariable
                                    toggleSettingVariableForm={this.props.toggleSettingVariableForm}
                                    displayVariableForm={this.props.workflowSettingReducer.displayVariableForm}
                                    schema={config.workflowVariable}
                                    variables={this.props.workflowSettingReducer.variables}
                                    handleRemoveVariable={this.props.removeVariable}
                                    handleAddVariable={this.props.addVariable}
                                    handleUpdateVariable={this.props.updateVariable} />
                            </div>
                            <div className="designer-flowchart-permission">
                                <PermissionSetting handleChange={this.handleChangePermissionSetting} permission={this.state.permission} options={this.state.options} />
                            </div>
                        </div>
                    </div>

                    <div className={`designer-wrapper ${this.state.currentTab === 'workflowDesigner' ? '' : 'hide'}`} id="designer-wrapper-area">
                        <TaskPalette
                            isActive={!!this.currentFocusOverlay}
                            isDisplay={this.state.taskPalette.display}
                            left={this.state.taskPalette.x + 40}
                            top={this.state.taskPalette.y}
                            toggle={this.togglePalette} />
                        <DesignerForm
                            handleSubmitTaskForm={this.handleSubmitTaskForm}
                            defaultValue={this.settingVarDefaultValue}
                            data={this.state.currentNodeFocused}
                            update={this.updateFormValue}
                            updateVar={this.updateFormVar} />
                        <div id="designer-area" ref={e => this.container = e}>
                        </div>
                    </div>
                    <PopupForm schema={config.renameFormSchema} isDisplay={this.state.popupRenameFormDisplay} onSubmit={this.handleRenameTask} />
                    <JsonFileInput isDisplay={this.state.jsonFileInputDisplay} importedJsonFile={this.importedJsonFile} />
                </div>
            </div >
        )
    }
}

const mapStateToProps = (state) => {
    return {
        workflowSettingReducer: state.workflowSetting,
        workflow: state.workflow,
        webService: state.webService,
        user: state.user
    }
}

const mapDispatchToProps = {
    saveFlowchart,
    updateWorkflowSetting,
    updateWorkflowVariables,
    loadFileFromServer,
    updateVariable,
    addVariable,
    removeVariable,
    toggleSettingVariableForm,
    callAWebService,
    GetWorkflow
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Designer)
