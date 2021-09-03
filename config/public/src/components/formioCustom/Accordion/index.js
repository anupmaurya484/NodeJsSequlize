import React, { Component } from "react";
import ReactDOM from "react-dom";
import { ReactComponent } from "react-formio";
import settingsForm from "./FormioAccordion.settingsForm";

const AccordionCustomCompComp = class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            component: props.component
        };
    }

    render() {
        return (
            <h1>Hello</h1>
            // <Collapse>
            //     <Card >
            //         <Card.Header>
            //             <Accordion.Toggle className="accordion-header" eventKey="0">
            //                 What is DeFi?
            //       </Accordion.Toggle>
            //         </Card.Header>
            //         <Accordion.Collapse eventKey="0">
            //             <Card.Body className="according-body">DeFi is short for “decentralized finance”, an umbrella term for a variety of financial applications in cryptocurrency or blockchain geared toward disrupting financial intermediaries.</Card.Body>
            //         </Accordion.Collapse>
            //     </Card>
            //     <Card >
            //         <Card.Header>
            //             <Accordion.Toggle className="accordion-header" eventKey="1">
            //                 What is Reef?
            //       </Accordion.Toggle>
            //         </Card.Header>
            //         <Accordion.Collapse eventKey="1">
            //             <Card.Body className="according-body">Reef is a smart liquidity aggregator and yield engine that enables trading with access to liquidity from both CEXs and DEXs while offering smart lending, borrowing, staking, mining through AI driven personalized Reef Yield Engine.</Card.Body>
            //         </Accordion.Collapse>
            //     </Card>
            // </Collapse>
        );
    }
};

export default class AccordionCustom extends ReactComponent {
    /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
    static get builderInfo() {
        return {
            title: "Accordion",
            icon: "align-justify",
            group: "Layout",
            documentation: "",
            weight: -10,
            schema: AccordionCustom.schema()
        };
    }

    /**
     * This function is the default settings for the component. At a minimum you want to set the type to the registered
     * type of your component (i.e. when you call Components.setComponent('type', MyComponent) these types should match.
     *
     * @param sources
     * @returns {*}
     */
    static schema() {
        return ReactComponent.schema({
            type: "accordionCustomComp"
        });
    }

    /*
     * Defines the settingsForm when editing a component in the builder.
     */
    static editForm = settingsForm;

    static element = "";
    setValue(value) {
        this.dataValue = value
        console.log(this.component);
        console.log(value);
        if (this.element != "")
            this.attachReact(this.element)
    }

    updateValue = () => {
        // set value
        console.log("updateValue called", this.dataForSetting, this.dataValue)
    };

    /**
     * This function is called when the DIV has been rendered and added to the DOM. You can now instantiate the react component.
     *
     * @param DOMElement
     * #returns ReactInstance
     */
    attachReact(element) {
        this.element = element
        ReactDOM.render(
            <AccordionCustomCompComp
                component={this.component} // These are the component settings if you want to use them to render the component.
                value={this.dataValue} // The starting value of the component.
                onChange={this.updateValue} // The onChange event to call when the value changes.
            />,
            element
        );
    }

    /**
     * Automatically detach any react components.
     *
     * @param element
     */
    detachReact(element) {
        if (element) {
            this.element = element
            ReactDOM.unmountComponentAtNode(element);
        }
    }
}