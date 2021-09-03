import React, { Component } from "react";
import ReactDOM from "react-dom";
import { ReactComponent } from "react-formio";
import settingsForm from "./HorizontalDivider.settingsForm";

const HorizontalDividerCustomComp = class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      component: props.component
    };
  }

  render() {
    return (
      <hr />
    );
  }
};

export default class HorizontalDivider extends ReactComponent {
  /**
 * This function tells the form builder about your component. It's name, icon and what group it should be in.
 *
 * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
 */
  static get builderInfo() {
    return {
      title: "Horizontal Divider",
      icon: "minus",
      group: "Layout",
      documentation: "",
      weight: -10,
      schema: HorizontalDivider.schema()
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
      type: "horizontalDividerCustomComp"
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
      <HorizontalDividerCustomComp
        component={this.component} // These are the component settings if you want to use them to render the component.
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