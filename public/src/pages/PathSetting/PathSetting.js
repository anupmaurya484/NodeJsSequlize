
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Button, ModalHeader, ModalBody, ModalFooter, Modal, DropdownItem, DropdownToggle, DropdownMenu, Card, Container, UncontrolledDropdown } from 'reactstrap';
import DataTable from "../../components/DataTable";
import CustomToggle from '../../components/CustomToggle';
import ModalConfirmation from '../../components/ModalConfirmation';
import { GetPathLists, onAddPath, DeletePath } from "../../actions/collection";
import { Toast } from '../../utils/helperFunctions'
import folderGirl from '../../assets/images/Folder_girl.svg';
import { Formik, ErrorMessage, Form } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    path_name: Yup.string().required("Path Name is a required field."),
    path_description: Yup.string().required("Path Description is a required field."),
    authentication_profile_id: Yup.string().required("Authentication Profile is a required field.")
});


class PathSetting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PathLists: [],
            setpagepathModal: false,
            isModalConfirmation: false,
            path_id: "",
            external_access_profiles: [],
            initState: {
                path_name: '',
                path_description: '',
                authentication_profile_id: ''
            }
            
        }
    }

    componentWillMount() {
        this.loadPageList()
    }

    loadPageList = async () => {
        try {
            const { User_data } = this.props.user
            const { search } = this.state;
            const reqData = { userId: User_data._id, search }
            //debugger;
            var res = await this.props.GetPathLists(reqData);
            this.setState({ PathLists: res.data });
        } catch (err) {
            console.log(err.message);
        }
    }

    onAddPath = async (reqData) => {
        try {
            reqData["path_id"] = this.state.path_id ? this.state.path_id : "";
            var res = await this.props.onAddPath(reqData);
            console.log(res);
            if (res.status) {
                Toast(res.message, 'success', 1000);
                this.loadPageList();
                this.setState({ setpagepathModal: false })
            } else {
                Toast(res.message, 'error', 1000);
            }
        } catch (err) {
            Toast(err.message, 'error', 1000);
        }
    }

    callFunction = (data, type) => {
        console.log(data);
        console.log(type);
        if (type == 2) {
            this.setState({ initState: data, path_id: data._id, setpagepathModal: true })
        } else {
            this.setState({ path_id: data._id, isModalConfirmation: true })
        }
    }

    handelConfirm = async (response) => {
        const that = this;
        const { path_id } = this.state;
        if (response) {
            const res = await this.props.DeletePath(path_id);
            Toast(res.message, 'success', 1000);
            this.loadPageList();
            this.setState({ isModalConfirmation: false })
        } else {
            this.setState({ IsModalConfirmation: false })
        }
    }

    getTableRows = () => {
        const that = this;
        const { PathLists } = this.state;
        const external_access_profiles = this.props.user ? this.props.user.User_data.company.external_access_profiles : [];
        let rows = PathLists && PathLists.map((r, i) => {
            console.log(external_access_profiles.find(item => item.uuid == r.authentication_profile_id));
            const external_aceess = external_access_profiles.find(item => item.uuid == r.authentication_profile_id);
            return ({
                name: r.path_name,
                description: r.path_description,
                external_aceess: external_aceess ? external_aceess.access_profile_name : "",
                date: r.createdAt,
                action: <div style={{ "width": "70px", "display": "flex" }}>
                    <UncontrolledDropdown className="CustomToggle" setActiveFromChild>
                        <DropdownToggle tag={CustomToggle} />
                        <DropdownMenu size="sm" title="" right flip>
                            <DropdownItem className="d-flex" onClick={() => that.callFunction(r, 2)}><span className="d-flex"><i className="pointer text-warning material-icons" data-toggle="tooltip" title="Edit">&#xE254;</i>Edit</span></DropdownItem>
                            <DropdownItem className="d-flex" onClick={() => that.callFunction(r, 1)}><span className="d-flex"><i className="pointer text-danger material-icons" data-toggle="tooltip" title="Delete">&#xE872;</i>Delete</span></DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </div>
            })
        });
        return rows
    }

    render() {
        const { PageGroupList, setpagepathModal, PathLists, initState, isModalConfirmation } = this.state;
        const external_access_profiles = this.props.user ? this.props.user.User_data.company.external_access_profiles : [];

        console.log(isModalConfirmation);

        const data = {
            columns: [
                {
                    label: "Path Name",
                    field: 'name',
                },
                {
                    label: "Path Description",
                    field: 'description',
                },
                {
                    label: "External Access",
                    field: 'external_aceess',
                },
                {
                    label: "Created At",
                    field: 'date',
                },
                {
                    label: 'Action',
                    field: 'action',
                    sort: 'disabled'
                }
            ],
            rows: this.getTableRows(),
        }


        return (
            <Fragment>

                {isModalConfirmation && <ModalConfirmation IsModalConfirmation={isModalConfirmation} showOkButton={true} showCancelButton={true} title="Delete" text="Are you sure you want to delete?" onClick={(response) => this.handelConfirm(response)} />}

                <Row className='page-header'>
                    <Col col='6'>
                        <div className='page-heading-title'>
                            <h3><b>Page Group</b></h3>
                        </div>
                    </Col>

                    <Col col="6">
                        <div className="d-flex align-items-center justify-content-end">
                            <div className="search-box">
                                <div className="position-relative">
                                    <input onChange={(e) => this.handleInputChange(e)} name="search" type="text" placeholder="search" autoComplete="off" className="form-control" />
                                    <i className="fa fa-search" aria-hidden="true"></i>
                                </div>
                            </div>
                            <div className="page-title-right d-flex ml-2">
                                <Button className="btn-default mr-1" size="sm" onClick={() => this.setState({ setpagepathModal: !setpagepathModal })}>Add Page Path</Button>
                            </div>
                        </div>
                    </Col>
                </Row>
                {(PathLists.length != 0) &&
                    <Col className="mt-3">
                        <Card>
                            <DataTable
                                isPagination={false}
                                isSearch={false}
                                totalPage={25}
                                correntPage={1}
                                data={data}
                                onClicks={(e) => console.log(e)} />
                        </Card>
                    </Col>
                }

                {(PathLists.length == 0) &&
                    <div className='h-100 container-fluid'>
                        <div className='row h-100 justify-content-center full-height'>
                            <div className='col-12 h-100 align-self-center text-center'>
                                <img src={folderGirl} className="figure-img img-fluid" style={{ height: "200px" }} />
                                <p>List of Page Group for path</p>
                            </div>
                        </div>
                    </div>
                }
                <Modal isOpen={setpagepathModal} toggle={() => this.setState({ setpagepathModal: !setpagepathModal })}>
                    <ModalHeader toggle={() => this.setState({ setpagepathModal: !setpagepathModal })}>
                        <strong>Add Page Path</strong>
                    </ModalHeader>
                    <ModalBody>
                        <Formik
                            initialValues={initState}
                            validationSchema={validationSchema}
                            validateOnChange
                            validateOnBlur
                            onSubmit={(values) => {
                                const data = {
                                    path_name: values.path_name,
                                    path_description: values.path_description,
                                    authentication_profile_id: values.authentication_profile_id
                                }
                                this.onAddPath(data)
                            }}>
                            {({ values, handleChange, handleBlur, isSubmitting, submitCount, setFieldValue }) => (
                                <Form>
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="form-group" style={{ paddingLeft: '2px' }}>
                                                <label className='font-weight-bold'>Path name<span className='required-star'>*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="path_name"
                                                    name="path_name"
                                                    rows="4"
                                                    value={values.path_name}
                                                    onChange={(e) => setFieldValue('path_name', ("/" + e.target.value.replaceAll("/", "")))}
                                                    onBlur={handleBlur}
                                                />
                                                <ErrorMessage className="validation-error" name='path_name' component='div' />
                                            </div>
                                        </div>
                                        <div className="col-lg-12">
                                            <div className="form-group" style={{ paddingLeft: '2px' }}>
                                                <label className='font-weight-bold' >Path Description<span className='required-star'>*</span></label>
                                                <textarea
                                                    style={{ width: '100%' }}
                                                    className="form-control"
                                                    id="path_description"
                                                    name="path_description"
                                                    type="text"
                                                    maxLength="256"
                                                    value={values.path_description}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                ></textarea>
                                                <ErrorMessage className="validation-error" name='path_description' component='div' />
                                            </div>
                                        </div>
                                        <div className="col-lg-12">
                                            <div className="form-group" style={{ paddingLeft: '2px' }}>
                                                <label className='font-weight-bold' >Authentication Profile<span className='required-star'>*</span></label>
                                                <select className='form-control form-select-modified' name="authentication_profile_id" value={values.authentication_profile_id} id="authentication_profile_id" onChange={handleChange} onBlur={handleBlur} >
                                                    <option value=''>Select Authentication Profile</option>
                                                    {external_access_profiles.map((item) => (
                                                        <option value={item.uuid}>{item.access_profile_name}</option>
                                                    ))}


                                                </select>
                                                <ErrorMessage className="validation-error" name='authentication_profile_id' component='div' />
                                            </div>
                                        </div>
                                        <div className='col-lg-12 mt-3'>
                                            <Button className='btn btn-secondary float-left' onClick={() => this.setState({ setpagepathModal: !setpagepathModal })}>cancel</Button>
                                            <Button type='submit' className='btn btn-secondary float-right'>Save</Button>
                                        </div>
                                    </div>
                                </Form>
                            )}

                        </Formik>
                    </ModalBody>
                </Modal>
            </Fragment>

        )
    }
}

const mapStateToProps = ({ user }) => ({
    user
})

const mapDispatchToProps = (dispatch) => ({
    GetPathLists: (data) => dispatch(GetPathLists(data)),
    DeletePath: (data) => dispatch(DeletePath(data)),
    onAddPath: (data) => dispatch(onAddPath(data)),
})

export default connect(mapStateToProps, mapDispatchToProps)(PathSetting)