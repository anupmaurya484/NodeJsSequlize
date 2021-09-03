import React, { useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Row, Col } from "reactstrap";
import constants from '../../config';

const DefaultCardDropdown = (props) => {
    const [Card, setCard] = useState(false);
    return (
        <React.Fragment>
            <Dropdown isOpen={Card} toggle={() => setCard(!Card)} className="" >
                <DropdownToggle className="btn waves-effect" tag="Card" >
                    <span class="material-icons">more_horiz</span>
                </DropdownToggle>
                <DropdownMenu className="" right>
                    <DropdownItem ><span id="" className="">Default</span></DropdownItem>
                    <DropdownItem ><span id="" className="">Edit</span></DropdownItem>
                    <DropdownItem ><span id="" className="">Delete</span></DropdownItem>
                </DropdownMenu >
            </Dropdown >
        </React.Fragment>
    );
}


export default DefaultCardDropdown;