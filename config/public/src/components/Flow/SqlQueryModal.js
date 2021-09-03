import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosService';
import { Container,  Modal, ModalBody, ModalFooter, ModalHeader,  Row, Col, Button } from 'reactstrap';
import auth from '../../actions/auth';

function SqlQueryModal({action, show, toggle, handleActionUpdate, onClose, i}) {
    const [j, setJ] = useState(action? action.j : -1)
    const [type, setType] = useState(action? action.type : 'Web request')
    const [connId, setConnId] = useState(action? action.connId : undefined)
    const [verified, setVerified] = useState(action? action.verified : false)
    const [connList, setConnList] = useState([])
    const [query, setQuery] = useState(action? action.query : undefined)
    const [saveTo, setSaveTo] = useState(action? action.saveTo : undefined)
    
    useEffect(() => {
        if (action) {
            setJ(('j' in action)? action.j : -1)
            setQuery(('url' in action)? action.query : undefined)
            setVerified(('verified' in action)? action.verified : false)
            setSaveTo(('saveTo' in action)? action.saveTo : undefined)
            setType(('type' in action)? action.type : 'SQL')
            setConnId(('connId' in action)? action.connId : undefined)
            setConnList([])
        }
        loadConnectionList()
        
        // componentWillUnmount
        return () => {
            console.log('unmounting...')
        }
    }, [action])

    function handleSave(e) {
        action.j=j
        action.query=query
        action.verified=verified
        action.saveTo=saveTo
        action.type=type
        action.connId=connId
        handleActionUpdate(action, i, 'update')
        onClose(e, action.name)
    }

    function handleDelete(e) {
        handleActionUpdate(action, i, 'delete')
        onClose(e, action.name)
    }

    function handleChange(e) {
        console.log(e.target.id, e.target.value)
        switch (e.target.id) {
            case 'j':
                setJ(e.target.value)
                break;
            case 'query':
                setQuery(e.target.value)
                break;
            case 'verified':
                setVerified(e.target.value)
                break;
            case 'saveTo':
                setSaveTo(e.target.value)
                break;
            case 'type':
                setType(e.target.value)
                if (e.target.value == "Sql") {
                    loadConnectionList()
                }
                break;
            case 'connId':
                setConnId(e.target.value)
        }
    }

    const loadConnectionList = async () => {
        try {
          let connList = await axios.apis('GET', `/api/GetShareConnectionList`, auth.headers)
          setConnList(connList)
        } catch (err) {
          console.log(err.message)
        }
    
      }
    
    if (!show) {return null;}
    return (
        <Modal centered size="lg" isOpen={show} toggle={toggle('SQL Query')} >
            <ModalHeader toggle={toggle('SQL Query')} className="modal-header"><><h5>{action? action.name: null}</h5></></ModalHeader>
            <ModalBody>
                    <Row>
                        <Col md='3'>
                            Type
                            <span className="required-star">*</span>
                        </Col>
                        <Col md='9'>
                        <div className="form-group">
                            <select
                            className="form-control form-select-modified"
                            value={type}
                            id="type"
                            onChange={handleChange}
                            >
                            <option key='1' value='Sql'>SQL</option>
                            </select>
                        </div>
                        </Col>
                    </Row>
                    {(type == "Sql" && (connList.length != 0 || connId)) &&
                    <Row>
                        <Col md='3'>Connection
                        <span className="required-star">*</span>
                        </Col>
                        <Col md='8'>
                            <div className="form-group">
                            <select className="form-control form-select-modified" id="connId" name="default_path" onChange={handleChange} value={connId}>
                                <option >Select..</option>
                                {spList.map((x, i) => <option key={i} value={x.value}>{x.name}</option>)}
                            </select>
                            </div>
                        </Col>
                        <Col md='1'>
                            {verified && <i className="fas fa-check"></i>}
                        </Col>
                    </Row>
                    }
                    <Row>
                        <Col md='3'>
                            Query
                            <span className="required-star">*</span>
                        </Col>
                        <Col md='9'>
                            <div className="form-group">
                                <textarea
                                className="form-control"
                                value={query}
                                id="query"
                                rows="4"
                                onChange={handleChange}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col ms='3'>
                            Save to
                            <span className="required-star">*</span>
                        </Col>
                        <Col md='9'>
                        <div className="form-group">
                            <input
                            type="text"
                            className="form-control"
                            value={saveTo}
                            id="saveTo"
                            onChange={handleChange}
                            />
                        </div>
                        </Col>
                    </Row>
            </ModalBody>
            <ModalFooter>
                <Container>
                <Row>
                    <Col md='4' className='text-left'>
                    {(i !== -1) && <Button color="danger" className='custom-btn' name="Delete" onClick={e=>handleDelete(e)}>Delete</Button>}
                    </Col>
                    <Col md='8' className='text-right'>
                    <Button color="secondary" className='custom-btn' onClick={e=>{onClose(e, action.name)}}>Close</Button>
                    <Button color="primary" className='custom-btn ml-2' type="submit" name="Verify" >Verify</Button>
                    <Button color="primary" className='custom-btn ml-2' type="submit" name="Submit" onClick={e=>handleSave(e)}>Submit</Button>
                    </Col>
                </Row>
                </Container>
            </ModalFooter>
        </Modal>
    )
}

export default SqlQueryModal