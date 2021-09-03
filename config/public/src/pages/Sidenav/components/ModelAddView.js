import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import { Button, Col, Row, Modal, ModalHeader, ModalBody, Input } from 'reactstrap';
import { Formik, ErrorMessage, Form } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    linkname: Yup.string().required("link name is a required field."),
    linkroute: Yup.string().required("link route is a required field."),
    linkicon: Yup.string().required("link icon is a required field."),
    linktext: Yup.string().required("link text is a required field."),
});


class ModelAddField extends Component {
    constructor(props) {
        super(props);
        this.state = {
            is_edit: 0,
            linkType: "",
            header: "",
            link: {
                "name": "",
                "route": "",
                "icon": "",
                "text": ""
            },
            initialValues: {
                header: "",
                linkname: "",
                linkroute: "",
                linkicon: "",
                linktext: ""
            }
        }
    }

    componentDidMount() {
        const props = this.props.currentStates;
        let { linkType, header, link, is_edit } = this.state;
        this.setState({
            initialValues: {
                header: props.header,
                linkname: props.link.name,
                linkroute: props.link.route,
                linkicon: props.link.icon,
                linktext: props.link.text,
            },
            linkType: props.linkType,
            header: props.header,
            link: props.link,
            is_edit: props.is_edit
        });

    }

    handleInputChange = (inputType, { target }) => {
        let { link, header } = this.state;
        if (inputType == 'header') {
            header = target.value;
            this.setState({ header })
        } else {
            link[inputType] = target.value;
            this.setState({ link })
        }
    }

    render() {
        const { linkType } = this.state;
        return (
            <Modal isOpen={true} toggle={true} size='lg'>
                <ModalHeader toggle={this.props.toggle_choose_add_field}>
                    <h3>Menu Items config</h3>
                </ModalHeader>
                <ModalBody>
                    <Formik
                        initialValues={this.state.initialValues}
                        validationSchema={validationSchema}
                        validateOnChange
                        validateOnBlur
                        onSubmit={(values) => {
                            this.state.header = values.header;
                            this.state.link = {
                                "name": values.linkname,
                                "route": values.linkroute,
                                "icon": values.linkicon,
                                "text": values.linktext
                            }
                            this.props.handleAddField(this.state)
                        }}>
                        {({ values, handleChange, handleBlur, isSubmitting, submitCount, setFieldValue }) => (
                            <Form>
                                <div className="row">
                                    {
                                        linkType == 'sidenav-item-header' &&
                                        <div className='col-lg-12 field_namem-auto'>
                                            <div className="form-group">
                                                <label htmlFor="defaultFormRegisterNameEx" className="font-weight-bold">Header Title<span className='required-star'>*</span></label>
                                                <Input
                                                    required
                                                    className="form-control"
                                                    type="text"
                                                    success="right"
                                                    value={values.header}
                                                    name="header"
                                                    id="header"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                            </div>
                                        </div>
                                    }

                                    {linkType == 'sidenav-item-link' &&
                                        <div className=" col-lg-12 mb-3">
                                            <div className='row custom-input-margin'>
                                                <div className='col-lg-12'>
                                                    <div className="form-group">
                                                        <label htmlFor="defaultFormRegisterNameEx" className="font-weight-bold">link name<span className='required-star'>*</span></label>
                                                        <Input
                                                            required
                                                            className="form-control"
                                                            type="text"
                                                            success="right"
                                                            value={values.linkname}
                                                            name='linkname'
                                                            id='linkname'
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                        />
                                                        <ErrorMessage className="validation-error" name='linkname' component='div' />
                                                    </div>
                                                </div>
                                                <div className='col-lg-12'>
                                                    <div className="form-group">
                                                        <label htmlFor="defaultFormRegisterNameEx" className="font-weight-bold">link route<span className='required-star'>*</span></label>
                                                        <Input
                                                            required
                                                            className="form-control"
                                                            type="text"
                                                            success="right"
                                                            value={values.linkroute}
                                                            name='linkroute'
                                                            id='linkroute'
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                        />
                                                        <ErrorMessage className="validation-error" name='linkroute' component='div' />
                                                    </div>
                                                </div>
                                                <div className='col-lg-12'>
                                                    <div className="form-group">
                                                        <label htmlFor="defaultFormRegisterNameEx" className="font-weight-bold">link icon<span className='required-star'>*</span></label>
                                                        <Input
                                                            required
                                                            className="form-control"
                                                            type="text"
                                                            success="right"
                                                            value={values.linkicon}
                                                            name='linkicon'
                                                            id='linkicon'
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                        />
                                                        <ErrorMessage className="validation-error" name='linkicon' component='div' />
                                                    </div>
                                                </div>
                                                <div className='col-lg-12'>
                                                    <div className="form-group">
                                                        <label htmlFor="defaultFormRegisterNameEx" className="font-weight-bold">link text<span className='required-star'>*</span></label>
                                                        <Input
                                                            required
                                                            className="form-control"
                                                            type="text"
                                                            success="right"
                                                            value={values.linktext}
                                                            name='linktext'
                                                            id='linktext'
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                        />
                                                        <ErrorMessage className="validation-error" name='linktext' component='div' />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }

                                    <div className='col-lg-12 mt-3'>
                                        <Button type='submit' className='btn btn-secondary float-right'>submit</Button>
                                        <Button className='btn btn-secondary float-left' onClick={(e) => this.props.toggle_choose_add_field()}>cancel</Button>
                                    </div>
                                </div>
                            </Form>
                        )}

                    </Formik>
                </ModalBody>
            </Modal >
        )
    }

}

export default ModelAddField