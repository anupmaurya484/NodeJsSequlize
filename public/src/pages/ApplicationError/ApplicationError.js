import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Row, Col, Modal, ModalBody } from "reactstrap";
import docImage from '../../assets/images/Documents_illustrator.svg';

const ApplicationError = (props) => {
  if (!props.applicationError) {
    props.history.push("/")
  }

  return (
    <React.Fragment>
      <div className='h-100 container-fluid'>
        <div className='row h-100 justify-content-center full-height'>
          <div className='col-12 h-100 align-self-center text-center'>
            <img src={docImage} className="figure-img img-fluid" style={{ height: "200px" }} />
            <p>Your Database is not setup so please contact to support team.</p>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

const mapStateToProps = (state) => {
  return { applicationError: state.user.applicationError }
}

export default connect(mapStateToProps, null)(ApplicationError)

