import React, { Component } from "react";
import { connect } from 'react-redux';
import ReactDOM from "react-dom";
import { ReactComponent } from "react-formio";
import CKEditor from "glozic-texteditor";
import settingsForm from "./FormioCkeditor.settingsForm";
import "./index.css";

const Ckeditor = class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null
        };
    }

    componentDidMount = async () => {
        this.componentUpdate(this.props)
    }

    componentWillReceiveProps(props) {
        this.componentUpdate(props)
    }

    componentUpdate(props) {
        this.setState({ value: props.value })
    }

    onCKEditorChange = (evt) => {
        console.log("onCKEditorChange");
        console.log(evt);
        var newContent = evt.editor.getData();
        console.log(newContent);
        this.setState({ value: newContent })
        this.props.onChange(newContent)
    }

    onCKEditorblur = (evt) =>{
        console.log("onCKEditorblur");
        console.log(evt);
    }

    onCKEditorafterPaste = (evt) =>{
        console.log("onCKEditorafterPaste");
        console.log(evt);
    }

    render() {
        const { value } = this.state;
        return (
            <CKEditor
                activeClass="editor"
                content={value}
                events={{
                    "blur": this.onCKEditorblur,
                    "afterPaste": this.onCKEditorafterPaste,
                    "change": this.onCKEditorChange }} />
        );
    }
};

export default class CkeditorCutome extends ReactComponent {
    /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
    static get builderInfo() {
        return {
            title: "Ckeditor",
            icon: "map-signs",
            group: "Basic",
            documentation: "",
            weight: -10,
            schema: CkeditorCutome.schema()
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
            type: "CkeditorCutome"
        });
    }

    /*
     * Defines the settingsForm wsettingsFormhen editing a component in the builder.
     */

    static editForm = settingsForm;

    static element = "";
    setValue(value) {
        this.dataValue = value
        if (this.element != "")
            this.attachReact(this.element)
    }

    updateValue = (value) => {
        // set value
        this.setValue(value);
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
            <Ckeditor
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