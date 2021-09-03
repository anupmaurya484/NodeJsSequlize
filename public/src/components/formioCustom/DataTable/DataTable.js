import React, { Component, Fragment } from "react";
const $ = require('jquery');
$.DataTable = require('datatables.net');

class DataTableComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            component: null,
            value: null
        };
    }

    componentDidMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(props) {
        this.setState({ component: props.component, value: props.dataValue })
    }

    render() {
        const { component } = this.state;

        if (component && component.table_source != "") {
            return (
                <div>
                    {(component.table_source == "JSON") && this.renderJsonSource()}
                    {(component.table_source == "Variable") && this.renderVariableSource()}
                </div>
            )
        } else {
            return false
        }
    }

    renderJsonSource() {
        const { component } = this.state;
        console.log(component);
        const { columns } = component.json_config
        return (
            <table ref="main" id="datatable-formio" class="table table-striped table-bordered" cellspacing="0" width="100%">
                <thead>
                    <tr>
                        {columns && columns.map(item => (
                            <th>{item.data}</th>
                        ))}

                    </tr>
                </thead>
            </table>
        );
    }

    renderVariableSource() {
        const { component } = this.state;
        const { table_th } = component
        return (
            <table ref="main" id={component.key} class="table table-striped table-bordered" cellspacing="0" width="100%">
                <thead>
                    <tr>
                        {table_th && table_th.map(item => (
                            <th>{item.label}</th>
                        ))}
                        {component && component.enableActionCol &&
                            <th>Action</th>
                        }
                    </tr>
                </thead>
            </table>
        );
    }
}

export default DataTableComponent