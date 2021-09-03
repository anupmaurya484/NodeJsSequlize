import React, { useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Row, Col } from "reactstrap";
import constants from '../../config';

const CloudDropdown = (props) => {
    const [Cloud, setCloud] = useState(false);
    return (
        <React.Fragment>
            <Dropdown isOpen={Cloud} toggle={() => setCloud(!Cloud)} className="" >
                <DropdownToggle className="btn waves-effect" tag="cloud" >
                    <button className='border-0' style={{ 'background-color': '#f8f8fb' }}><i className="fa fa-filter fa-2x" style={{ 'color': '#a0a5b1' }} aria-hidden="true"></i></button>
                </DropdownToggle>
                <DropdownMenu className="" right>
                    {props.cloudDropdownItem.map((x, index) => {
                        return (
                            <DropdownItem key={index} onClick={(e) => props.handleTypeChange(x.value)}>
                                <span id="" className="">{x.title}</span>
                                {(props.filterType == x.value) && <i className="fa fa-check-circle float-right" aria-hidden="true" style={{ 'color': '#34c38f' }}></i>}
                            </DropdownItem>
                        )
                    })}
                </DropdownMenu >
            </Dropdown >
        </React.Fragment>
    );
}


export default CloudDropdown;
