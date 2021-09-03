import React, { Fragment, useState, useEffect } from 'react';
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import PreviewFormio from '../../../PreviewFormio';

const CollectionPreview = props => {
  
    useEffect(() => {
        localStorage.setItem('previewSchema', JSON.stringify(props.previewSchema))
        localStorage.setItem('formLanguage', JSON.stringify(props.formLanguage))
    }, [])

    
    const toggle = () => {
        props.toggle();
    }

    return (
        <Modal size="lg" className='preview-devices previewModal modal-lg' isOpen={props.previewModal} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                <h4>Collection Preview</h4>
            </ModalHeader>
            {/* <ModalHeader className='Header-previewModal' toggle={props.toggle}>
                <div className='view-buttons float-right pt-2'>
                    <label onClick={() => setSelectedDevice(1)} title="Desktop" className={`mr-2 pl-2 pr-2`}><i className="fa fa-desktop " aria-hidden="true"></i></label>
                    <label onClick={() => setSelectedDevice(2)} title="tablet" className={`mr-2 pl-2 pr-2`}><i className="fa fa-tablet" aria-hidden="true"></i></label>
                    <label onClick={() => setSelectedDevice(3)} title="mobile" className={`mr-2 pl-2 pr-1`}><i className="fa fa-mobile" aria-hidden="true"></i></label>
                </div>
            </ModalHeader> */}
            <ModalBody>
                <div style={{margin: "7px"}}>
                    <PreviewFormio />
                    {/* <iframe frameborder="0" scrolling="no" frameborder="0" height="100%" width="100%" src={`${API.BASE_URL}/public/preview-formio`} /> */}

                    {/* {selectedDevice == 1 &&
                        <iframe src={`${API.BASE_URL}/public/preview-formio`} style={{ "width": "100%", "border": "none","height": "500px" }} />
                    }
                    {selectedDevice == 2 &&
                        <div class="tablet">
                            <div class="content" style={{ "background": "#fff", "padding": "10px" }}>
                                <iframe src="http://localhost:3000/public/preview-formio" style={{ "width": "100%", "border": "none", "height": "100%" }} />
                            </div>
                        </div>
                    }
                    {selectedDevice == 3 &&
                        <div class="smartphone">
                            <div class="content" style={{ "background": "#fff", "padding": "10px" }}>
                                <iframe src="http://localhost:3000/public/preview-formio" style={{ "width": "100%", "border": "none", "height": "100%" }} />
                            </div>
                        </div>
                    } */}

                </div>
            </ModalBody>
        </Modal>
    );
};

export default CollectionPreview;