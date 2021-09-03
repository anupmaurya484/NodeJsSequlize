import React, { Component, Fragment } from 'react';
import ActionCanvas from '../../../../components/Flow/ActionCanvas';
import { Container, Row, Col } from 'reactstrap';
import 'brace/mode/json';

class CollectionAction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 0,
            eventId: 0,
            actionType: "event",
            eventsConfig: undefined,
            actionsConfig: undefined,
            actions: undefined,
            user_data: undefined,
            activeTab: 1,
            shouldRefreshed: true,
            pageLayoutFormSchema: [],
            defaultActionsConfig: [
                {
                    "id": 0,
                    "name": "",
                    "type": props.type,
                    "eventName": "Page being loaded",
                    "actions": []
                }
            ],
        };
        this.handleActionsUpdated = this.handleActionsUpdated.bind(this);
        this.handleEventsUpdate = this.handleEventsUpdate.bind(this);
    }

    componentDidMount() {
        this.componentUpdate(this.props);
    }

    componentWillReceiveProps(props) {
        this.componentUpdate(props);
    }

    componentUpdate(props) {
        const { user, eventsConfig, actionsConfig, pageLayoutFormSchema, actionsFlowIdx, actionType } = props;
        const { defaultActionsConfig } = this.state;
        this.setState({
            user_data: user.user_data,
            value: actionsFlowIdx,
            actionType: actionType,
            eventsConfig: (eventsConfig && eventsConfig.length != 0) ? eventsConfig : defaultActionsConfig,
            actionsConfig: (actionsConfig && actionsConfig.length != 0) ? actionsConfig : defaultActionsConfig,
            pageLayoutFormSchema: pageLayoutFormSchema,
        });
    }

    handleEventsUpdate(actions, i) {
        let { eventsConfig } = this.state;
        eventsConfig[this.state.value].actions = actions;
        this.setState({ eventsConfig: eventsConfig });
        console.log(eventsConfig);
        this.props.saveEventActions(eventsConfig)
    }

    handleActionsUpdated(actions) {
        let { eventsConfig, actionsConfig, actionType } = this.state;
        if (actionType == "event") {
            eventsConfig[this.state.value].actions = actions;
            this.setState({ eventsConfig: eventsConfig });
        } else if (actionType == "manual") {
            actionsConfig[this.state.value].actions = actions;
            this.setState({ actionsConfig: actionsConfig });
        }
        this.props.saveActionsConfig(actionType == "event" ? eventsConfig : actionsConfig, actionType);
    }

    render() {
        const { value, shouldRefreshed, pageLayoutFormSchema, defaultActionsConfig, actionType, eventsConfig, actionsConfig } = this.state;
        const User_data = this.props.user.User_data;
        const { onClickVariables } = this.props;
        //const eventsConfig = this.state.eventsConfig? this.state.eventsConfig : defaultActionsConfig;
        //const actionsConfig = this.state.actionsConfig? this.state.actionsConfig : defaultActionsConfig;
        const actions = actionType == "event" ? (eventsConfig && eventsConfig[value] ? eventsConfig[value].actions : undefined) :
            (actionsConfig && actionsConfig[value] ? actionsConfig[value].actions : undefined)

        return (
            <Container fluid>
                <Row around>
                    <Col md='12'>
                        <ActionCanvas
                            eventID={value}
                            extvariables={this.props.extvariables}
                            pageLayoutFormSchema={pageLayoutFormSchema}
                            type={actionType}
                            onClickVariables={onClickVariables}
                            actions={actions}
                            extSources
                            actionsUpdated={this.handleActionsUpdated}
                            options={{
                                actions: [
                                    { startWorkflow: false },
                                    { callNintexWorkflow: false },
                                    { callWebService: true },
                                    { sendEmail: false },
                                    { sendSMS: false },
                                    { getSharepointList: true },
                                    { setFormComponent: true },
                                    { queryJson: true },
                                    { sqlQuery: true },
                                    { toast: true }
                                ]
                            }}
                        />
                    </Col>
                </Row>
            </Container>
        )
    }

}

export default CollectionAction