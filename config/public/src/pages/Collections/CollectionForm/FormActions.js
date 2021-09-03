import React, { Component, Fragment } from 'react';
import * as user from '../../../actions/users';
import './CreateForm.css';
import ActionCanvas from '../../../components/Flow/ActionCanvas';
import { FormattedMessage } from 'react-intl';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import { isValidJson } from '../../../utils/helperFunctions';
import { Container, Row, Col, Nav, NavItem, TabContent, TabPane } from 'reactstrap';

import './FormActions.css';
import jsonLogic from 'json-logic-js';

class FormActions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 0,
            eventId: 0,
            eventsConfig: [
                {
                    "id": 0,
                    "eventName": "Document added to collection",
                    //"actions": [{"name":"first action name"}]
                    "actions": [],
                    "conditions": {}
                },
                {
                    "id": 1,
                    "eventName": "Document updated to collection",
                    //"actions": [{"name":"first action name"}]
                    "actions": [],
                    "conditions": {}
                }
            ],
            actions: undefined,
            user_data: undefined,
            collection: {
                _id: "",
                collectionName: "",
                collectionDescription: "",
                formschema: { "display": "form" },
                viewTables: [],
                eventsConfig: []
            },
            activeTab: 1,
            shouldRefreshed: true
        };
        this.handleChangeEventType = this.handleChangeEventType.bind(this);
        this.handleConditionsConfigChange = this.handleConditionsConfigChange.bind(this);
        this.handleActionsUpdated = this.handleActionsUpdated.bind(this);
        this.handleSelect = this.handleSelect.bind(this)

    }

    componentDidMount() {
        this.componentUpdate(this.props);
        console.log(this.props.submission)
    }

    componentWillReceiveProps(props) {
        this.componentUpdate(props);
    }

    componentUpdate(props) {
        const { collection, user } = props;
        this.setState({
            collection: collection,
            user_data: user.user_data,
            eventsConfig: collection.eventsConfig ? collection.eventsConfig : this.state.eventsConfig
        });
    }

    handleSelect(selectedTab) {
        // The active tab must be set into the state so that
        // the Tabs component knows about the change and re-renders.
        this.setState({
            activeTab: selectedTab
        });
    }

    handleChangeEventType(event) {
        //let { shouldRefreshed } = this.state;
        this.setState({
            value: parseInt(event.target.value),
            shouldRefreshed: false
        });
        setTimeout(() => this.setState({ shouldRefreshed: true }), 100);
    }

    handleConditionsConfigChange(value, e) {
        let { eventsConfig } = this.state;
        console.log(isValidJson(value), e);
        value = (value == "") ? "{}" : value;
        if (isValidJson(value)) {
            eventsConfig[this.state.value].conditions = JSON.parse(value);
            this.setState({ eventsConfig: eventsConfig });
            this.props.SaveEventActions(eventsConfig)
        }
    }

    handleActionsUpdated(actions, i) {
        let { eventsConfig } = this.state;
        eventsConfig[this.state.value].actions = actions;
        this.setState({ eventsConfig: eventsConfig });
        console.log(eventsConfig);
        this.props.SaveEventActions(eventsConfig)
    }



    render() {
        const { value, shouldRefreshed, eventsConfig } = this.state;

        return (
            <Container fluid>
                <Row>
                    <label>
                        <FormattedMessage id="collection.event" />:
                <select className="browser-default form-select-modified"
                            value={value}
                            onChange={this.handleChangeEventType}>
                            {eventsConfig.map(item => (
                                <option key={item.id} value={item.id} >{item.eventName}</option>
                            ))}
                        </select>
                    </label>

                </Row>
                <Row around>
                    <Col md='8'>
                        <ActionCanvas
                            eventID={value}
                            eventsConfig={eventsConfig}
                            actions={eventsConfig[value] ? eventsConfig[value].actions : undefined}
                            actionsUpdated={this.handleActionsUpdated}
                            options={{ actions: [{ startWorkflow: true }, { callNintexWorkflow: true }, { callWebService: true }, { sendEmail: true }, { sendSMS: true }] }}
                        />
                    </Col>

                    <Col md='4'>
                        <Container>
                            <div>Action(s) will be executed only if below condition(s) are met.
                        Condition(s) are defined based on custom logic using <a target="_blank" href="http://jsonlogic.com/">JSONLogic</a>.{<br />}
                        You may get Sample Data from "Form designer - preview - submit".
                        <h4>Example:</h4>
                                <pre>{'{"!==" : [ { "var" : "status" }, "draft" ] }'}</pre></div>
                            <TabContent className="myClass" activeTab={this.state.activeTab} onSelect={this.handleSelect}>
                                <TabPane tabId={1} title="Rule">
                                    <Row>
                                        {shouldRefreshed &&
                                            <AceEditor
                                                name="eConfigCond"
                                                mode="json"
                                                width="100%"
                                                height="250px"
                                                readOnly={false}
                                                placeholder=""
                                                value={eventsConfig[value] && eventsConfig[value].conditions && JSON.stringify(eventsConfig[value].conditions, null, 2)}  //{eventsConfig[value]?JSON.stringify(eventsConfig[value].conditions, null, 2):undefined}
                                                onChange={(e) => this.handleConditionsConfigChange(e)}
                                                setOptions={{
                                                    enableBasicAutocompletion: true,
                                                    enableLiveAutocompletion: true,
                                                    enableSnippets: true
                                                }}
                                            />
                                        }
                                    </Row>
                                </TabPane>
                                <TabPane tabId={2} title="Sample Data">
                                    <Row>
                                        <AceEditor
                                            name="data"
                                            mode="json"
                                            width="100%"
                                            height="250px"
                                            readOnly={true}
                                            value={JSON.stringify(this.props.submission, null, 2)}
                                            setOptions={{
                                                enableBasicAutocompletion: true,
                                                enableLiveAutocompletion: true,
                                                enableSnippets: true
                                            }}
                                        />
                                    </Row>
                                </TabPane>
                            </TabContent >
                            <p>Result: {eventsConfig[value] && eventsConfig[value].conditions && jsonLogic.apply(eventsConfig[value].conditions, this.props.submission) ? "True" : "False"}</p>
                        </Container>
                    </Col>
                </Row>
            </Container>
        )
    }

}

export default FormActions