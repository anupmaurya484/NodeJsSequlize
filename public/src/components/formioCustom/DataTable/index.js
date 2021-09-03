import React, { Component, Fragment } from "react";
import ReactDOM from "react-dom";
import { ReactComponent } from "react-formio";
import settingsForm from "./DataTable.settingsForm";
import { Row, Col, Dropdown, DropdownMenu, DropdownItem, UncontrolledDropdown, DropdownToggle } from 'reactstrap';
import CustomToggle from '../../CustomToggle';
import DataTableComponent from './DataTable'

export default class DataTable extends ReactComponent {
  /**
 * This function tells the form builder about your component. It's name, icon and what group it should be in.
 *
 * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
 */
  static get builderInfo() {
    return {
      title: "Data Table",
      icon: "qrcode",
      group: "Data",
      documentation: "",
      weight: -10,
      schema: DataTable.schema()
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
      type: "dataTableCustomComp"
    });
  }

  /*
   * Defines the settingsForm when editing a component in the builder.
   */
  static editForm = settingsForm;

  static element = "";
  static selected_row = "";
  static currentDataValue = false;

  setValue(value) {
    value = value ? value : ((this.currentDataValue) ? this.currentDataValue : ((this.component.value) ? this.component.value : []));
    console.log(value);
    if (typeof value == "object" && value && value.rows) {
      value['selected_row'] = this.selected_row;
      this.dataValue = value
      if (this.element != "")
        this.attachReact(this.element)
    }
  }

  updateData = (selected_row) => {
    // set value
    this.selected_row = selected_row; 
    this.setValue(this.dataValue);
    this.updateValue()
  };

  onChangeEvent = (actionName, event) => {
    // this.events.emit(this.interpolate("this.component.event"), "this.data");
    var submissionData = this.data;
    submissionData[this.component.key]['selected_row'] = event
    submissionData = JSON.parse(JSON.stringify(submissionData))
    this.emit('customEvent', {
      type: actionName,
      data: event,
      submissionData: submissionData
    });
  }

  /**
   * This function is called when the DIV has been rendered and added to the DOM. You can now instantiate the react component.
   *
   * @param DOMElement
   * #returns ReactInstance
   */
  attachReact(element) {
    this.element = element
    this.currentDataValue = this.dataValue;
    ReactDOM.render(
      <DataTableComponent
        dataValue={this.currentDataValue}
        component={this.component}
        onChange={this.updateValue}
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