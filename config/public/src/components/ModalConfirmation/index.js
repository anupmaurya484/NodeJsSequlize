import React from 'react'
import { Modal, Button, ModalBody,FormGroup,Input } from 'reactstrap';
import PropTypes from 'prop-types';
import { openCloseModal } from '../../utils/helperFunctions';

import './index.css'

const ModalConfirmation = (props) => (
  <Modal isOpen={props.IsModalConfirmation} toggle={(e) => props.onClick(false)}>
    <ModalBody>
      <h4 className={props.titleClass || 'title'}>
        {props.title}
      </h4>

      <p className={props.textClass || 'text'}>
        {props.text}
      </p>

      {
        props.clientUploadProgress === 100 &&
        <p>Please wait a moment until upload process to database completed in server side and this modal will close automatically</p>
      }

      {props.inputConfirmation &&
        <div>
          <p>Type 'delete' to confirm deletion of this key</p>
          <FormGroup > <Input type="text" value={props.value} onChange={props.onChange} /></FormGroup>
        </div>

      }

      {
        props.showOkButton &&
        <Button className="btn btn-secondary mr-2" disabled={props.inputConfirmation && props.value != "delete"} onClick={(e) => props.onClick(true)}>{props.btnOKtext || 'OK'}</Button>
      }

      {
        props.showCancelButton &&
        <Button variant="danger" onClick={(e) => props.onClick(false)}>  {props.btnCanceltext || 'Cancel'}</Button>
      }
    </ModalBody>
  </Modal>
)


const closeModal = (id) => {
  openCloseModal(id, 'close')
}

ModalConfirmation.propTypes = {
  IsModalConfirmation: PropTypes.bool,
  inputConfirmation: PropTypes.bool,
  showCancelButton: PropTypes.bool,
  showOkButton: PropTypes.bool,
  onClick: PropTypes.func,
  btnCanceltext: PropTypes.string,
  titleClass: PropTypes.string,
  title: PropTypes.string,

}
export default ModalConfirmation