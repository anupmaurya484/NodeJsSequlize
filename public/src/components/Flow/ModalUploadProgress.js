import React from 'react';
import {MDBModal, MDBModalHeader, MDBModalBody, MDBInput } from 'mdbreact';

const ModalUploadProgress = (props) => (

    <MDBModal isOpen={props.modal_choose_add_field} toggle={props.toggle_choose_add_field}>
      <MDBModalBody>
      {props.isupload=="1" && <h4>Upload progress</h4>}
      {props.isupload=="0" && <h4>Download progress</h4>}
      
      
      <p>Uploading: {props.countUploadProgress()}%</p>
      {
      	props.clientUploadProgress === 100 &&
      	<p>Please wait a moment until upload process to database completed in server side and this modal will close automatically</p>
      }    
      </MDBModalBody>
     </MDBModal>
)

export default ModalUploadProgress