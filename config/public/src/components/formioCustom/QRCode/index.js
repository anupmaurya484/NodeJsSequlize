import React, { Component } from "react";
import ReactDOM from "react-dom";
import { ReactComponent } from "react-formio";
import settingsForm from "./QRCode.settingsForm";
import ReactQRCode from 'qrcode.react';

const QRCodeCustomComp = class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      component: props.component
    };
  }

  render() {
    var { size, fgColor, bgColor, imageSettings } = this.props.component;
    var value = this.props.value;
    var defaultImage = {
      src: "data:image/png;base64,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",
      height: 20,
      width: 20,
      excavate: true
    }

    return (
      <ReactQRCode
        value={value? value: `https://www.glozic.com`}
        size={size ? size : 64}
        fgColor={fgColor ? fgColor : "#000000"}
        bgColor={bgColor ? bgColor : "#FFFFFF"}
        imageSettings={imageSettings ? imageSettings : defaultImage} />
    );
  }
};

export default class QRCode extends ReactComponent {
  /**
 * This function tells the form builder about your component. It's name, icon and what group it should be in.
 *
 * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
 */
  static get builderInfo() {
    return {
      title: "QR Code",
      icon: "qrcode",
      group: "Layout",
      documentation: "",
      weight: -10,
      schema: QRCode.schema()
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
      type: "qrCodeCustomComp"
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
      <QRCodeCustomComp
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