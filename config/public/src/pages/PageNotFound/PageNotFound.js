import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import docImage from '../../assets/images/glozic-logo.png';
import { Col, Row, Container } from 'reactstrap';

const ApplicationError = (props) => {
    return (
        <React.Fragment>
            <div className='h-100 container-fluid'>
                <div className='row h-100 justify-content-center full-height'>
                    <div className='col-12 h-100 align-self-center text-center'>
                        {/* <img src={docImage} className="figure-img img-fluid" style={{ height: "200px" }} /> */}
                        <h1>The Page You Are Looking For Doesn't Exist</h1>
                        <a href="#" onClick={() => window.location.href = "/"}>
                            <div> Click Here to Return Home</div>
                        </a>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}


export default connect(null, null)(ApplicationError)

