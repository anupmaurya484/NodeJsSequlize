import React, { useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Row, Col } from "reactstrap";
import { connect } from 'react-redux';
import constants from '../../config';

const FilterDropdown = (props) => {
    const [Cloud, setCloud] = useState(false);
    const company_name=['Constantsys','Glozic', 'Whispal Singapore Pte. Ltd.']
    //   handleInputChange = (e) => {
    // 		const { name, value } = e.target;
    // 		 this.setState({ [name]: value });
    // 		this.getContainerList()
    // 	}

    // getContainerList = () => {
    // 	let app_id = "5f190371db85375976b48101";
    // 	var PathName = "/" + this.props.location.pathname.split("/")[1];
    // 	if (PathName == "/Admin") {
    // 		app_id = "5f190371db85375976b48102";
    // 	} else if (this.props.user.UserApps.find(x => x.link == PathName)) {
    // 		app_id = this.props.user.UserApps.find(x => x.link == PathName)._id
    // 	}
    // 	const { User_data } = this.props.user;
    // 	const { filterType, search } = this.state;
    // 	// axiosService.apis('GET', '/api/containers?appi_id=' + app_id)
    // 	// 	.then(response => {
    // 	// 		this.setState({ containers: response })
    // 	// 	})
    // 	const payload = { "userId": User_data.id, appId: app_id, filterType, search };
    // 	axiosService.apis('POST', '/api/GetAllContainers', payload)
    // 		.then(response => {
    // 			this.setState({ containers: response })
    // 		})
    // }

    return (
        <React.Fragment>
            <Dropdown isOpen={Cloud} toggle={() => setCloud(!Cloud)} className="" >
                <DropdownToggle className="btn waves-effect" tag="cloud" >
                    <button className='border-0' style={{ 'backgroundColor': '#f8f8fb' }}><i className="fa fa-filter fa-2x" style={{ 'color': '#a0a5b1' }} aria-hidden="true"></i></button>
                </DropdownToggle>
                <DropdownMenu className="" right>
                {props.list.map((comp) => (<DropdownItem onClick={(e) => props.handleTypeChange("")}>
                        <span id="" className="">{comp}</span> 
                        {props.filterType=="" && <i className="fa fa-check-circle float-right" aria-hidden="true" style={{ 'color' : '#34c38f'}}></i>}
                    </DropdownItem> ))} 
                </DropdownMenu >
            </Dropdown >
        </React.Fragment>    
    );




}


export default FilterDropdown;