import React, { Fragment, useState, useEffect } from 'react';
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import PreviewFormio from '../../PreviewFormio';

const PageLayoutPreview = props => {

    useEffect(() => {
        localStorage.setItem('previewSchema', JSON.stringify(props.previewSchema))
    }, [])


    const toggle = () => {
        props.toggle();
    }

    return (
        <Modal size="lg" className='preview-devices previewModal modal-lg' isOpen={props.previewModal} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                <h4>Page Layout Preview</h4>
            </ModalHeader>
            <ModalBody>
                <div>
                    <PreviewFormio />
                </div>
            </ModalBody>
        </Modal>
    );
};

export default PageLayoutPreview;