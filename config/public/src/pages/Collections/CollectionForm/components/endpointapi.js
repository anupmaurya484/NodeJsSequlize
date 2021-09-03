import React, { Component, Fragment, useState, useEffect } from 'react';
import { CopyBlock, dracula } from "react-code-blocks";
import { GetTenantName } from '../../../../utils/helperFunctions';
import API from '../../../../config';
import {
    Collapse,
    Card,
    Row,
    Col,
    CardBody,
    CardHeader,
} from "reactstrap";


const getResponse = `{
    "status": true,
    "data":[
      {
            "_id": "5f7ff267dce983001d080fa9",
            "formId": "5f7ff212dce983001d080fa8",
            "collectionSubmissionId": null,
            "createdTime": "2020-10-09T05:17:27.083Z",
            "createdBy": "5c4e707358093c2b7cccc7d2",
            "modifiedTime": "2020-10-24T15:57:17.086Z",
            "modisharingfiedBy": "5c4e707358093c2b7cccc7d2",
            "applicantName": "Richard Roe",
            "memberSponsor": "Richard MacCally",
            "firstName": "Richard",
            "lastName": "Roe",
            "radio1": "male",
            "dateTime": "2020-10-09T12:00:00+08:00",
            "phoneNumber": "",
            "occupation": "Director",
            "spousesName": "Mary Yen",
            "email": "",
            "address": "",
      },
      {
            "_id": "5f7ff267dce983001d080fa5",
            "formId": "5f7ff212dce983001d080fa8",
            "collectionSubmissionId": null,
            "createdTime": "2020-10-09T05:17:27.083Z",
            "createdBy": "5c4e707358093c2b7cccc7d2",
            "modifiedTime": "2020-10-24T15:57:17.086Z",
            "modisharingfiedBy": "5c4e707358093c2b7cccc7d2",
            "applicantName": "Richard Roe",
            "memberSponsor": "Richard MacCally",
            "firstName": "Richard",
            "lastName": "Roe",
            "radio1": "male",
            "dateTime": "2020-10-09T12:00:00+08:00",
            "phoneNumber": "",
            "occupation": "Director",
            "spousesName": "Mary Yen",
            "email": "",
            "address": "",
      }
    ]
}`;

const postResponse = `{
    "status": true,
    "message: "collection record submitted successfully."
}`;

const putResponse = `{
    "status": true,
    "message: "collection record updated successfully."
}`;

const deleteResponse = `{
    "status": true,
    "message: "collection record deleted successfully."
}`;

const EndPoint = (props) => {
    const [indexId, setIndexId] = useState(-1);
    const [defaultViewConfig, setDefaultViewConfig] = useState(props.properties);
    const [addRequest, setAddRequest] = useState([]);
    const [UpdateRequest, setUpdateRequest] = useState([]);

    useEffect(() => {
        let options = []
        if (defaultViewConfig) {
            defaultViewConfig.map(x => {
                if (x.visible) {
                    options.push({
                        parameter: <code class="language-plaintext highlighter-rouge">{x.key}</code>,
                        type: 'string',
                        description: 'Required'
                    });
                }
            });
        }
        const record_id = [{
            parameter: <code class="language-plaintext highlighter-rouge">record_id</code>,
            type: 'string',
            description: 'Required'
        }]
        setUpdateRequest(record_id.concat(options));
        setAddRequest(options);

    }, [defaultViewConfig]);

    const apiLists = [{
        title: "List all collection record",
        method: 'GET',
        url: `${API.API_URL}/v1/${GetTenantName()}/collection/${props.collectionId}`,
        response: getResponse,
        options: [{
            parameter: <code class="language-plaintext highlighter-rouge">record_id</code>,
            type: 'string',
            description: 'Only return invoices belonging to the client with the given record ID.'
        }, {
            parameter: <code class="language-plaintext highlighter-rouge">{'{{query_string}}'}</code>,
            type: 'string',
            description: 'Only return records given condition with the query string.'
        }]
    }, {
        title: "Create a collection record",
        method: 'POST',
        url: `${API.API_URL}/v1/${GetTenantName()}/collection/${props.collectionId}`,
        response: postResponse,
        options: addRequest,
        // requestEx: JSON.stringify({ "textArea": "sadsadsa", "textField": "this is testing4" }, null, 2)

    }, {
        title: "Update a collection record",
        method: 'PUT',
        url: `${API.API_URL}/v1/${GetTenantName()}/collections/${props.collectionId}/{{RECORD_ID}}`,
        response: putResponse,
        options: UpdateRequest,
        // requestEx: JSON.stringify({ "textArea": "sadsadsa", "textField": "this is testing4" }, null, 2)
    }, {
        title: "Delete a collection form",
        method: 'DELETE',
        url: `${API.API_URL}/v1/${GetTenantName()}/collections/${props.collectionId}/{{RECORD_ID}}`,
        response: deleteResponse
    }]

    return (
        <Card className="mt-3 Access-card">
            <CardHeader className='header-Access-card' style={{ textTransform: "capitalize", padding: '.75rem 1.25rem' }}>
                <Row>
                    <Col>
                        <h5>End Point API</h5>
                    </Col>
                </Row>

            </CardHeader>
            <CardBody>

                <Row>
                    <Col md="12" className="p-3">
                        <div className="custom-control custom-switch">
                            <input
                                type="checkbox"
                                checked={props.enableEndPoint}
                                className="custom-control-input"
                                id="enableEndPoint"
                                onChange={(e) => props.onChange()} />

                            <label
                                htmlFor="enableEndPoint"
                                className="custom-control-label">
                                Enable end point api access.
                            </label>
                        </div>
                    </Col>

                    {(props.enableEndPoint && apiLists) && apiLists.map((item, index) => (
                        <Col md="12">
                            <Card className="text-left  border Auth-card shadow-card rounded-lg" >
                                <span style={{ "paddingLeft": "10px", "paddingTop": "10px", "fontSize": "15px", "paddingBottom": "10px" }}><strong>{item.title}</strong></span>
                                <CardHeader className="border-bottom Auth-card-header rounded-top">
                                    <div className="align-items-center d-flex justify-content-between ">
                                        <div className=''>
                                            <label style={{ "lineHeight": "0" }} className="ml-2">{item.method}</label>
                                            <span className='ml-4'>{item.url}</span>
                                        </div>
                                        <span onClick={() => setIndexId((index == indexId ? -1 : index))} aria-expanded={index == indexId} className='mr-2 pointer'>
                                            {index == indexId && <i class="fa fa-angle-up fa-2x" aria-hidden="true"></i>}
                                            {index != indexId && <i class="fa fa-angle-down fa-2x" aria-hidden="true"></i>}
                                        </span>
                                    </div>
                                </CardHeader>
                                <Collapse isOpen={index == indexId} style={{ 'width': '100%' }}>
                                    <CardBody className=''>
                                        {(item.options && item.options.length != 0) &&
                                            <table className='Api-table'>
                                                <thead>
                                                    <tr>
                                                        <th>Parameter</th>
                                                        <th>Type</th>
                                                        <th>Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {item.options.map((optionItem, index2) => (
                                                        <tr>
                                                            <td>{optionItem.parameter}</td>
                                                            <td>{optionItem.type}</td>
                                                            <td>{optionItem.description}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        }

                                        {(item.requestEx && ['POST', 'PUT'].includes(item.method)) &&
                                            <div className="pt-5">
                                                <p><strong>Request Example</strong></p>
                                                <div className="demo-code">
                                                    <CopyBlock
                                                        language={'javascript'}
                                                        text={item.requestEx}
                                                        showLineNumbers={false}
                                                        theme={dracula}
                                                        wrapLines={true}
                                                        codeBlock
                                                    />
                                                </div>
                                            </div>
                                        }

                                        <div className="pt-5">
                                            <p><strong>Response Example</strong></p>
                                            <div className="demo-code">
                                                <CopyBlock
                                                    language={'javascript'}
                                                    text={item.response}
                                                    showLineNumbers={false}
                                                    theme={dracula}
                                                    wrapLines={true}
                                                    codeBlock
                                                />
                                            </div>
                                        </div>
                                    </CardBody>
                                </Collapse>
                            </Card>

                        </Col>
                    ))
                    }

                </Row>

            </CardBody>
        </Card>
    )
}

export default EndPoint