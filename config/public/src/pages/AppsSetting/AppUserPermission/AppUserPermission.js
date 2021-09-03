import React, { useState, useEffect } from 'react';
import {
    Modal, ModalBody, ModalFooter, Button, ModalHeader, TabContent, TabPane, NavLink, NavItem, CardText, Nav, Row, Col, Badge, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Pagination, PaginationItem, PaginationLink,
    Card, CardBody, Table, Label, Input
} from "reactstrap";
import { isEqual } from 'lodash';
import axios from '../../../utils/axiosService';
import { Toast } from '../../../utils/helperFunctions';
import classnames from "classnames";

const AppUserPermission = (props) => {

    const [selectedUsers, setSelectedUsers] = useState([]);
    const [activeTabJustify, setactiveTabJustify] = useState("1");
    const [users, setUsers] = useState([]);
    const [showAdduser, setshowAdduser] = useState(false);

    useEffect(() => {
        onLoad();
    }, []);

    const onLoad = async () => {
        var usersData = []
        if (props.user.User_data.isTenantUser) {
            const users = await axios.apis('GET', `/api/users`)
            usersData = users.filter(x => x.level != 6).map((member) => ({ value: member._id, label: member.email }));

        } else {
            const team = (props.user.User_data && props.user.User_data.team && props.user.User_data.team.members) && props.user.User_data.team.members;
            if (team && team.length != 0) {
                usersData = props.user.User_data.team.members.map((member) => ({ value: member.id, label: member.email }));
                usersData.unshift({ value: props.user.User_data._id, label: props.user.User_data.email })
            }
        }
        setSelectedUsers(props.selectedUsers)
        setUsers(usersData);
    }

    const handleChangeSelectedUsers = (user) => {
        let newSelectedUsers = [...selectedUsers]
        if (selectedUsers.includes(user)) {
            const idx = selectedUsers.findIndex(user2 => isEqual(user, user2))
            newSelectedUsers.splice(idx, 1)
        } else {
            newSelectedUsers = [...selectedUsers, user]
        }
        setSelectedUsers(newSelectedUsers)
    }

    const handleSaveUserPermission = async () => {
        const { User_data } = props.user;
        const userId = User_data._id;
        const newDate = new Date().toISOString();

        const body = {
            _id: props.selectedId,
            userList: selectedUsers,
            modifiedTime: newDate,
            modifiedBy: userId
        }

        const result = await props.CreateUpdateAppList(body);
        result.res == 200 ? await props.loadApps({ _id: userId }) : result.res;
        props.toggle();
        Toast(result.message);
    }

    const toggleCustomJustified = (tab) => {
        if (activeTabJustify !== tab) {
            setactiveTabJustify(tab);
        }
    }

    // const buttonClickedHandler = () => {
    //     debugger;
    //     setshowAdduser((showAdduser) => showAdduser = !showAdduser )
    //  }

    return (
        <>
            <Modal className="create-app-page-model new-app-access" isOpen={true} size="xl">
                <ModalHeader>
                    <strong>Application Access</strong>
                    <div className='app-header-button float-right'>
                        <Button className="btn custom-btn  btn-sm mr-2" onClick={handleSaveUserPermission}> Save </Button>
                        <Button className="btn custom-btn btn-sm" onClick={() => props.toggle()}> Cancel </Button>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div tabs className='nav-tabs d-flex justify-content-between'>
                        <Nav className="">
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: activeTabJustify === "1" })}
                                    onClick={() => { toggleCustomJustified("1"); }}>
                                    <span className="d-none d-sm-block">Portal User Access</span>
                                </NavLink>
                            </NavItem>
                            {!props.user.User_data.isTenantUser &&
                                <NavItem>
                                    <NavLink
                                        style={{ cursor: "pointer" }}
                                        className={classnames({ active: activeTabJustify === "2" })}
                                        onClick={() => { toggleCustomJustified("2"); }}>
                                        <span className="d-none d-sm-block">Tenant User Access</span>
                                    </NavLink>
                                </NavItem>
                            }
                        </Nav>
                        <div className='py-1'>
                            <Button className='waves-effect mr-3 btn-secondary btn-sm' onClick={() => setshowAdduser(true)}>Add User</Button>
                        </div>
                    </div>
                    <TabContent className='app-access-tab' activeTab={activeTabJustify}>

                        <TabPane tabId="1" className="p-3">
                            <table class="table table-bordered mx-auto" >
                                <thead>
                                    <tr>
                                        <th className='col1'><input type="checkbox" id="select_all_checkboxes" /></th>
                                        <th className='col2'>Users</th>
                                        <th className='col3 text-center'>External User</th>
                                        <th className='col4 text-center'>Sales</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td>Mark</td>
                                        <td className='text-center'><input
                                            id="ferranMessage"
                                            type="checkbox"
                                            class="delete_checkbox"
                                        /></td>
                                        <td className='text-center'><input
                                            id="ferranMessage"
                                            type="checkbox"
                                            class="delete_checkbox"
                                        /></td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td>Mark</td>
                                        <td className='text-center'><input
                                            id="ferranMessage"
                                            type="checkbox"
                                            class="delete_checkbox"
                                        /></td>
                                        <td className='text-center'><input
                                            id="ferranMessage"
                                            type="checkbox"
                                            class="delete_checkbox"
                                        /></td>
                                    </tr>
                                    <tr>
                                        <th scope="row">3</th>
                                        <td>Mark</td>
                                        <td className='text-center'><input
                                            id="ferranMessage"
                                            type="checkbox"
                                            class="delete_checkbox"
                                        /></td>
                                        <td className='text-center'><input
                                            id="ferranMessage"
                                            type="checkbox"
                                            class="delete_checkbox"
                                        /></td>
                                    </tr>
                                </tbody>
                            </table>

                        </TabPane>

                        <TabPane tabId="2" className="p-3">
                            <table class="table table-bordered mx-auto">
                                <thead>
                                    <tr>
                                        <th className='col1'><input type="checkbox" id="select_all_checkboxes" /></th>
                                        <th className='col2'>Users</th>
                                        <th className='col3 text-center'>Tenant User</th>
                                        <th className='col4 text-center'>Buyer</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td>Mark</td>
                                        <td className='text-center'><input
                                            id="ferranMessage"
                                            type="checkbox"
                                            class="delete_checkbox"
                                        /></td>
                                        <td className='text-center'><input
                                            id="ferranMessage"
                                            type="checkbox"
                                            class="delete_checkbox"
                                        /></td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td>Mark</td>
                                        <td className='text-center'><input
                                            id="ferranMessage"
                                            type="checkbox"
                                            class="delete_checkbox"
                                        /></td>
                                        <td className='text-center'><input
                                            id="ferranMessage"
                                            type="checkbox"
                                            class="delete_checkbox"
                                        /></td>
                                    </tr>   
                                    <tr>
                                        <th scope="row">3</th>
                                        <td>Mark</td>
                                        <td className='text-center'><input
                                            id="ferranMessage"
                                            type="checkbox"
                                            class="delete_checkbox"
                                        /></td>
                                        <td className='text-center'><input
                                            id="ferranMessage"
                                            type="checkbox"
                                            class="delete_checkbox"
                                        /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </TabPane>

                    </TabContent>


                    {/* <div className="table-view" style={{ "border": "1px solid #dee2e6" }}>
                    <div className="table-responsive" style={{ "height": "50vh" }}>
                        <table className="table" id="table1" >
                            <thead className="custome-table-thead">
                                <tr>
                                    <th className="custome-table-th"><b>Index</b></th>
                                    <th className="custome-table-th"><b>User Email</b></th>
                                    <th className="custome-table-th"><b>App Permission</b></th>
                                </tr>
                            </thead>
                            {(users && users.length) &&
                                <tbody className="custome-table-tbody">
                                    {users.map((user, i) => {
                                        return (
                                            <tr key={i}>
                                                <td className="auto custome-table-td-v2">{i}</td>
                                                <td className="auto custome-table-td-v2">{user.label}</td>
                                                <td className="auto custome-table-td-v2"><input type="checkbox" className="filled-in" onChange={e => handleChangeSelectedUsers(user.value)} checked={selectedUsers.includes(user.value)} /></td>
                                            </tr>
                                        )
                                    })
                                    }
                                </tbody>
                            }
                        </table>
                    </div>
                </div>
             */}
                </ModalBody>
            </Modal>

            <Modal isOpen={showAdduser} toggle={() => setshowAdduser(false)} size="xl">
                <ModalHeader toggle={() => setshowAdduser(false)}>
                    <strong>User List</strong>
                </ModalHeader>
                <ModalBody>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" value="option1" />
                        <label class="form-check-label" for="inlineRadio1">All Users</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" value="option2" />
                        <label class="form-check-label" for="inlineRadio2">Clients</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio3" value="option3" />
                        <label class="form-check-label" for="inlineRadio3">Agent</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio4" value="option4" />
                        <label class="form-check-label" for="inlineRadio4">Agencies</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio5" value="option5" />
                        <label class="form-check-label" for="inlineRadio5">Vendors</label>
                    </div>
                    <table class="table table-striped  mt-4">
                        <thead class="thead-light">
                            <tr>
                                <th scope="col"><input type="checkbox" id="select_all_checkboxes" /></th>
                                <th scope="col">Name</th>
                                <th scope="col">Contact Type</th>
                                <th scope="col">Email</th>
                                <th scope="col">Mobile</th>
                                <th scope="col">Added On</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row"><input
                                    id="ferranMessage"
                                    type="checkbox"
                                    class="delete_checkbox"
                                /></th>
                                <td>Mark</td>
                                <td>Agent</td>
                                <td>mark111@gmail.com</td>
                                <td>9455722541</td>
                                <td>10/08/2021</td>
                            </tr>
                            <tr>
                                <th scope="row"><input
                                    id="ferranMessage"
                                    type="checkbox"
                                    class="delete_checkbox"
                                /></th>
                                <td>Jacob</td>
                                <td>Vendor</td>
                                <td>jacob456@yopmail.com</td>
                                <td>9742524132</td>
                                <td>10/08/2021</td>
                            </tr>
                            <tr>
                                <th scope="row"><input
                                    id="ferranMessage"
                                    type="checkbox"
                                    class="delete_checkbox"
                                /></th>
                                <td>Larry</td>
                                <td>Client</td>
                                <td>larry.patel007@gmail.com</td>
                                <td>7465418974</td>
                                <td>10/08/2021</td>
                            </tr>
                        </tbody>
                    </table>
                </ModalBody>
                <ModalFooter>
                    <Button className='btn btn-sm waves-effect btn-secondary'>Add Selected Users</Button>
                    <Button className='btn btn-sm waves-effect btn-secondary' onClick={() => setshowAdduser(false)}>Cancel</Button>
                </ModalFooter>
            </Modal>

        </>
    );
}

export default AppUserPermission