import React, { Component } from "react";
import ReactDOM from "react-dom";
import { ReactComponent } from "react-formio";
import settingsForm from "./ProgressBar.settingsForm";

/**
 * An example React component
 *
 * Replace this with your custom react component. It needs to have two things.
 * 1. The value should be stored is state as "value"
 * 2. When the value changes, call props.onChange(null, newValue);
 *
 * This component is very simple. When clicked, it will set its value to "Changed".
 */
const ProgressBarCustomComp = class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      component: props.component
    };
  }

  render() {

    var nodes = [];
    var currentNodeIdx = 0;
    
    if (this.props.component.data) {
      nodes = this.props.component.data.values;
    }

    if (this.props.value) {
      currentNodeIdx = nodes.findIndex(e => e.value === this.props.value)
    }
    
    return (
      <div className="container">
        <div className="row" onClick={this.setValue}>
          <br />
          <div className="col-md-12">
            <div className={`progress`} style={{ height: "10px" }}>
              {nodes.map((node, i) => (
                <div
                  className={`progressNode ${(i <= currentNodeIdx) ? this.state.component.colorCode : "no-color"}`}
                  style={{ left: `${100 / (nodes.length + 1) * (i + 1)}%` }}>
                  <div className="nodeLabel">{node.label}</div>
                </div>
              ))}
              <div className={`progress-bar ${this.state.component.colorCode}`} style={{ width: `${((currentNodeIdx + 1) == nodes.length )? 100 : ((100 / (nodes.length + 1) * (currentNodeIdx + 1)) + 1)}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default class ProgressBar extends ReactComponent {
  /**
 * This function tells the form builder about your component. It's name, icon and what group it should be in.
 *
 * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
 */
  static get builderInfo() {
    return {
      title: "Progress Bar",
      icon: "arrow-circle-right",
      group: "Data",
      documentation: "",
      weight: -10,
      schema: ProgressBar.schema()
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
      type: "progressBarCustomComp",
      label: "Custom Progress Bar"
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
      <ProgressBarCustomComp
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