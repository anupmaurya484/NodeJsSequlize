import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Button, Breadcrumb, BreadcrumbItem, Input, Col, Row, Modal, ModalBody,
    Dropdown, DropdownToggle, DropdownMenu, DropdownItem, ModalHeader, ModalFooter, Card, CardHeader, CardBody,
} from 'reactstrap';
import SimpleBar from "simplebar-react";
const Title = (props) => {
    return (<div style={{ display: "flex", position: "relative" }}>
        <h5 className="card-title">{props.name}</h5>
        {/* <span onClick={() => props.selectedTab(props.index)} style={{ "right": 0, position: "absolute" }}><i className={props.selected == props.index ? "fa fa-chevron-up" : "fa fa-chevron-down"} aria-hidden="true"></i></span> */}
    </div>)
}

class CollectionTemplates extends Component {
    constructor(props) {
        super(props);
        this.state = {
            template_file: "",
            template_file_name: "",
            file_name: "",
            description: "",
            is_save: false,
            isSelected: 0,
            open: "",
            class: "",
            TemplateList: [],
            gallery: 1,
            isMenu: false,
            formType: 'form'
        }
    }

    uploadFile = async (event) => {
        var reader = new FileReader();
        reader.onload = this.onReaderLoad;
        reader.readAsText(event.target.files[0]);
        this.setState({ template_file_name: event.target.files[0].name });
    }

    onReaderLoad = async (event) => {
        var obj = JSON.parse(event.target.result);
        document.getElementById('export-file').value = null
        this.setState({ template_file: obj });
    }

    applyTemplate = async (event, type) => {
        //debugger
        event["type"] = type;
        if (event.type == "2") {
            event["is_save"] = this.state.is_save;
            event["file_name"] = this.state.file_name;
            event["description"] = this.state.description;

        } else {
            const template = this.state.TemplateList.find(x => x.isSelected == true);
            if (template) {
                event["formschema"] = template.formschema;
                event["viewTables"] = template.viewTables;
                event["dataEventsConfig"] = template.dataEventsConfig;
                event["dataActionsConfig"] = template.dataActionsConfig;
                event["extSources"] = template.extSources;
                event["formLanguage"] = template.formLanguage;
            }
        }
        this.props.applyTemplate(event);
    }

    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    onChangeSelected = (index) => {
        let TemplateList = this.state.TemplateList;
        TemplateList.map((ele, i) => ele["isSelected"] = (index == i) ? (ele["isSelected"] ? false : true) : false);
        this.setState({ TemplateList: TemplateList });
    }

    componentDidMount() {
        this.componentWillReceiveProps(this.props)
    }

    componentWillReceiveProps(props) {
        this.setState({ TemplateList: props.isAdmin ? props.Mastertemplate : props.TemplateList })
    }

    handleInputChange = (type) => {
        if (type == 1) {
            this.setState({ gallery: type, TemplateList: this.props.TemplateList });
        } else {
            this.setState({ gallery: type, TemplateList: this.props.Mastertemplate });
        }
    }

    remove = () => {
        this.setState({
            template_file: "",
            template_file_name: "",
            file_name: "",
        });
    }

    render() {
        const that = this;
        const {
            formType,
            file_name,
            description,
            TemplateList,
            template_file_name,
            gallery,
            isMenu
        } = this.state;

        return (
            <>
                <div className="side-menu right-bar collection-setting overflow">
                    <SimpleBar style={{ 'maxheight': "100%", 'maxWidth': '100%', 'overflowX': 'hidden', 'overflowY': 'hidden' }}>
                        <div data-simplebar className="h-100">
                            <div className="mb-3 d-flex position-relative side-menu-header">
                                <i onClick={() => this.props.toggletemplateModal()} className="fa fa-times" aria-hidden="true"></i>
                                {/* <h3 style={{ marginTop: "10px" }}><b>Form Template</b></h3> */}
                                <h5 className="title">Form Template</h5>
                            </div>
                            <Card className="card border rounded-lg">
                                <CardHeader className="border-bottom rounded-top">
                                    <div className="float-left">
                                        <label className='card-title'>Form Type</label>
                                    </div>
                                    <div className="float-right">

                                    </div>

                                </CardHeader>
                                <CardBody>
                                    <div className='float-left'>
                                        <Dropdown isOpen={this.state.isMenu} toggle={() => this.setState({ isMenu: !isMenu })}>
                                            <DropdownToggle type="button" tag="button" className="btn btn-light">
                                                <i className="fa fa-chevron-down float-right pt-1 pl-2"></i>
                                                <span className="d-none d-sm-inline-block ml-1">{formType}<i className="mdi mdi-chevron-down"></i></span>
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem className="text-primary" onClick={() => this.setState({ formType: 'form' })}> form </DropdownItem>
                                                <DropdownItem className="text-primary" onClick={() => this.setState({ formType: 'wizard' })}> wizard </DropdownItem>
                                                <DropdownItem className="text-primary" onClick={() => this.setState({ formType: 'PDF' })}> PDF </DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>
                                    <div className="w-100"><Button color="primary" className="float-right" onClick={() => this.props.onChangeFormType(formType)}>Update</Button></div>
                                </CardBody>

                            </Card>
                            <Card className="card border rounded-lg">
                                <CardHeader className="border-bottom rounded-top">
                                    <Title name="Export Form Design"
                                        selected={this.state.isSelected}
                                        selectedTab={(e) => this.setState({ isSelected: e })}
                                        index="1"
                                    />
                                </CardHeader>
                                <CardBody>
                                    {/* {this.state.isSelected == "1" && */}
                                    <Fragment>
                                        <div className='d-flex justify-content-between'>
                                            <p className="card-text">Export current form design to a file.</p>
                                            <label onClick={this.props.exportTemplate} className="btn btn-primary float-right">Export</label>
                                        </div>
                                    </Fragment>

                                    {/* } */}
                                </CardBody>
                            </Card>
                            <Card className="card border rounded-lg" style={{ marginTop: "10px" }}>
                                <CardHeader className="border-bottom rounded-top">
                                    <Title name="Import Form Design"
                                        selected={this.state.isSelected}
                                        selectedTab={(e) => this.setState({ isSelected: e })}
                                        index="2"
                                    />
                                </CardHeader>
                                <CardBody>
                                    {/* {this.state.isSelected == "2" && */}
                                    <Fragment>
                                        <div className='d-flex justify-content-center align-items-baseline py-2 uploadfile-box'>
                                            <i class="fa fa-arrow-circle-o-up fa-2x mr-2" aria-hidden="true"></i>
                                            <span className="form-check-label mr-2 h5" id="export-file" for="inputGroupFile01">Upload File - </span>
                                            <input name="inputGroupFile01" type="file" id="inputGroupFile01" accept="application/JSON" onChange={this.uploadFile} style={{ display: "none" }} />
                                            <label className='h5 text-underline text-success cursor-pointer' for="inputGroupFile01" >Choose File</label>
                                        </div>
                                        <div>
                                            {this.props.isAdmin &&
                                                <div className={(!this.state.template_file ? "disabled-div" : "") + " form-check"} style={{ marginTop: "10px", marginLeft: "5px" }} >
                                                    <input type="checkbox" className="form-check-input" id="exampleCheck1" checked={this.state.is_save} onChange={(e) => this.setState({ is_save: !this.state.is_save })} />
                                                    <label className="form-check-label" for="exampleCheck1">Save to template gallery</label>
                                                </div>
                                            }
                                        </div>

                                        {this.state.is_save &&
                                            <form className='mt-2'>
                                                <div className="form-group">
                                                    <label for="exampleInputEmail1" className="font-weight-bold">File Name</label>
                                                    <input type="text" className="form-control" value={file_name} onChange={this.onChange} name="file_name" id="file_name" aria-describedby="file_name" />
                                                </div>
                                                <div className="form-group">
                                                    <label for="exampleInputEmail1" className="font-weight-bold">Description</label>
                                                    <input type="text" className="form-control" value={description} onChange={this.onChange} id="description" name="description" aria-describedby="description" />
                                                </div>
                                            </form>
                                        }

                                    </Fragment>
                                    {/* } */}
                                    <div className='d-flex justify-content-between display-file border-top pt-2 mt-4'>
                                        <div className='display-file-layout'>
                                            {template_file_name != "" &&
                                                <div className="d-flex py-2">
                                                    <span className="material-icons text-success"> task</span>
                                                    <span className='font-weight-bold'>{template_file_name}</span>
                                                    <span className="material-icons ml-5 float-right" onClick={() => this.remove()}>highlight_off</span>
                                                </div>}
                                        </div>

                                        <div className="apply-btn float-right">
                                            <Button color="primary" disabled={!template_file_name} onClick={() => this.applyTemplate(this.state, 2)}>Apply</Button>
                                        </div>
                                    </div>
                                </CardBody>

                            </Card>
                            <Card className="card border rounded-lg" style={{ marginTop: "10px" }}>
                                <CardHeader className="border-bottom rounded-top">

                                    <Title name="Templates Gallery"
                                        selected={this.state.isSelected}
                                        selectedTab={(e) => this.setState({ isSelected: e })}
                                        index="3"
                                    />
                                </CardHeader>
                                <CardBody>
                                    {/* {this.state.isSelected == "3" && */}
                                    <Fragment>
                                        {!this.props.isAdmin &&
                                            <Fragment>
                                                <div className="form-check form-check-inline">
                                                    <input className="form-check-input" type="radio" name="Gallery" id="inlineRadio1" value="Internal" checked={gallery == 1} onChange={event => this.handleInputChange(1)} />
                                                    <label className="form-check-label" htmlFor="inlineRadio1">Internal Gallery</label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                    <input className="form-check-input" type="radio" name="Gallery" id="inlineRadio2" value="Online" checked={gallery == 2} onChange={event => this.handleInputChange(2)} />
                                                    <label className="form-check-label" htmlFor="inlineRadio2">On-line Gallery</label>
                                                </div>
                                            </Fragment>
                                        }

                                        {TemplateList.map((ele, i) => {
                                            let thumbnail = (ele.file_name) ? ele.file_name.substring(0, 2).toUpperCase() : ""
                                            return (
                                                <div className="list-item mt-4" style={{ display: "flex", cursor: "pointer" }} onClick={(e) => this.onChangeSelected(i)} >
                                                    <span className="w-48 avatar gd-primary"><img src={"https://via.placeholder.com/150?text=" + thumbnail} width="50px" height="50px" alt="." /></span>
                                                    <div className="flex ml-4" > <span>{ele.file_name}</span>
                                                        <div className="item-except text-muted text-sm h-1x">
                                                            {ele.description}
                                                        </div>
                                                    </div>
                                                    <div className="no-wrap">
                                                        <div className="form-check" style={{ marginTop: "20px", "right": 6, position: "absolute" }} >
                                                            <input type="checkbox" className="form-check-input" id={"Check" + i} checked={ele.isSelected} />
                                                            <label className="form-check-label" for={"Check" + i}></label>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {(TemplateList.length == 0) &&
                                            <span>No any template Gallery is Available</span>
                                        }
                                    </Fragment>
                                    {/* } */}

                                    <div className="float-right mt-5">
                                        {(TemplateList.length != 0) && <Button color="primary" onClick={() => this.applyTemplate(this.state, 3)}>Apply</Button>}
                                    </div>

                                </CardBody>
                            </Card>
                        </div>
                    </SimpleBar>
                </div>
                <div className="leftbar-overlay" onClick={() => this.props.toggletemplateModal()}></div>
            </>
        )
    }

}

const mapStateToProps = ({ user }) => ({
    user
})

const mapDispatchToProps = (dispatch) => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(CollectionTemplates)