import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import './PermissionSetting.scss';

class PermissionSetting extends Component {
    constructor (props) {
        super(props);
        this.state = {
            display: false
        }
    }

    render () {
        return (
            <div className="workflow-setting-container" >
                <div className="workflow-setting-inner">
                <table className="table">
                          <thead>
                            <tr>
                              <th scope="col" style={{ width: "20%" }}>Access</th>
                              <th scope="col" style={{ width: "80%" }}>Users</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Read</td>
                              <td><Select
                                value={this.props.permission && this.props.permission.read}
                                isMulti
                                name="permissionRead"
                                options={this.props.options}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                onChange={(e) => this.props.handleChange('permissionRead',e)}
                              />
                              </td>
                            </tr>
                            <tr>
                              <td>Design</td>
                              <td><Select
                                value={this.props.permission && this.props.permission.design}
                                isMulti
                                name="permissionDesign"
                                options={this.props.options}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                onChange={(e) => this.props.handleChange('permissionDesign',e)}
                              />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                </div>
            </div>
        )
    }
}
PermissionSetting.propTypes = {
    handleChange: PropTypes.func,
    permission: PropTypes.object,
    options: PropTypes.object
}

PermissionSetting.defaultProps = {

}


export default PermissionSetting;
