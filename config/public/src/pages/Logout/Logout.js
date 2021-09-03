import React, { useState } from 'react';
import { connect } from 'react-redux';
import {Modal, ModalBody, ModalHeader} from 'reactstrap';
import docImage from '../../assets/images/glozic-logo.png';
import { Link } from 'react-router-dom';

const ApplicationError = (props) => {
     const [showverifymodal, setshowverifymodal] = useState(false);
  return (
    <React.Fragment>
      <Modal className="modal-md" isOpen={showverifymodal} toggle={() => {setshowverifymodal(!showverifymodal)}}>
        <ModalHeader toggle={() =>  {setshowverifymodal(!showverifymodal)}}></ModalHeader>
        <ModalBody>
          <div className='text-header ml-2'> 
              <h4>Verify Phone Number</h4>
              <p> A verification code has been sent to:</p>
          </div>
          <div className='text-body text-center'>
              <div className='mt-4 d-flex justify-content-center'>
              <h5 className='mr-1'>+91 - 7405714329 </h5> 
              <Link>Edit</Link>
              </div>
              <div className="mt-4">
                <h2>Please enter the verification <br/> code</h2>
              </div>
          </div>
          <div className='text-footer text-center mt-2 mb-0'>
              <button className='mb-2 btn-lg btn btn-secondary '>Submit Code</button>
              <p>If you did not receive the code, please click <Link>Back</Link>, check <br/>that you have entered the right number, and try again.</p>
          </div>
        </ModalBody>
      </Modal>
      <div className='h-100 container-fluid'>
        <div className='row h-100 justify-content-center full-height'>
          <div className='col-12 h-100 align-self-center text-center'>
            <img src={docImage} className="figure-img img-fluid" style={{ height: "200px" }} />
            <p>Thank you for using application.</p>
            <Link onClick={() => {setshowverifymodal(!showverifymodal);}}>Login</Link>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}


export default connect(null, null)(ApplicationError)

