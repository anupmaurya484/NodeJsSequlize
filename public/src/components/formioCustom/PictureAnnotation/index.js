import React, { Component } from "react";
import ReactDOM from "react-dom";
import { ReactComponent } from "react-formio";
import settingsForm from "./PictureAnnotation.settingsForm";
import { ReactPictureAnnotation, defaultShapeStyle, DefaultInputSection } from "react-picture-annotation";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { ModalTitle } from "react-bootstrap";

const PictureAnnotationCustomComp = class extends Component {
    constructor(props) {
        super(props);
        this.selectedId = null;
        this.state = {
            component: props.component,
            annotationData: props.value ? JSON.parse(props.value) : []
        };
    }

    UNSAFE_componentWillReceiveProps(props) {
        this.setState({ annotationData: props.value ? JSON.parse(props.value) : [] })
    }

    handlePictureAnnotation = (annotationData) => {
        this.setState({ annotationData });
        if(!this.selectedId){
            this.props.onChange(annotationData)
        }
    }

    render() {
        const that = this;
        const img = (this.props.component.upload_image ? this.props.component.upload_image[0].url : '');
     
        return (
            <div style={{ width: (Number(this.props.component.width) + 5) + "px", height: (Number(this.props.component.height) + 5) + "px", border: "2px solid", backgroundColor: "black" }} >
                <ReactPictureAnnotation
                    image={img}
                    annotationData={this.state.annotationData}
                    onSelect={(selectedId) => this.selectedId = selectedId}
                    onChange={(data) => this.handlePictureAnnotation(data)}
                    width={Number(this.props.component.width)}
                    height={Number(this.props.component.height)}
                    annotationStyle={{
                        ...defaultShapeStyle,
                        shapeStrokeStyle: "#2193ff",
                        transformerBackground: "black"
                    }}
                />
            </div>
        );
    }
};

export default class PictureAnnotationCustom extends ReactComponent {
    /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
    static get builderInfo() {
        return {
            title: "PictureAnnotation",
            icon: "align-justify",
            label: "Picture Annotation",
            group: "Layout",
            documentation: "",
            weight: -10,
            schema: PictureAnnotationCustom.schema()
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
            type: "pictureAnnotationCustomComp",
            label: "Picture Annotation",
        });
    }

    /*
     * Defines the settingsForm when editing a component in the builder.
     */
    static editForm = settingsForm;

    static element = "";


    setValue(value) {
        this.dataValue = value
        if (this.element != "")
            this.attachReact(this.element)
    }

    onChangeEvent = (value) => {
        this.setValue(value);
        this.updateValue(JSON.stringify(value), value);

    };

    /**
     * This function is called when the DIV has been rendered and added to the DOM. You can now instantiate the react component.
     *
     * @param DOMElement
     * #returns ReactInstance
     */
    attachReact(element) {
        this.element = element;
        const tempValue = typeof this.dataValue == "string" ? this.dataValue : JSON.stringify(this.dataValue)
        ReactDOM.render(
            <PictureAnnotationCustomComp
                builder={this.builderMode}
                defaultValue={this.component.defaultValue}
                component={this.component} // These are the component settings if you want to use them to render the component.
                value={tempValue} // The starting value of the component.
                onChange={this.onChangeEvent} // The onChange event to call when the value changes.
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