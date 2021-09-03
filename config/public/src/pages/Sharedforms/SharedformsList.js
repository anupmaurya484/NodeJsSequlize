
//Import Package 
import React, { Component, Fragment } from 'react'
import queryString from 'query-string';
import { Row, Col, Card } from 'reactstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import sharelog from '../../assets/images/sharelog.png';
import moment from 'moment';

//Import functions
import { GetAppName } from '../../utils/helperFunctions';
import { GetSharedforms, GetSharedformTableView, GetSharedformRecords } from "../../actions/sharedForm.actions";

//Import CSS
import "./index.css"

class SharedformsList extends Component {
    constructor(props) {
        super()
        this.state = {
            sharedforms: [],
            is_call_api: false
        }
    }

    componentDidMount() {
        //Call Onload function for Get intial datas
        this.loadSharedforms();
    }

    //Get TenantForm Lists 
    loadSharedforms = async () => {
        try {
            const { search } = this.state;
            const reqData = { search };
            const response = await this.props.GetSharedforms(reqData);
            if (response && response.data && response.data.length) {
                const { data } = response
                this.setState({ sharedforms: data, is_call_api: true });
            } else {
                this.setState({ is_call_api: true })
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    //Render Defaut Function
    render() {
        const { sharedforms, is_call_api } = this.state;
        var rootPath = GetAppName(this.props.user);
        if (is_call_api === false) return true;
        return (
            <Fragment>
                <div style={{ marginBottom: '20px' }}>
                    <Row>
                        {sharedforms.map((item, i) => (
                            <Col key={i} style={{ marginTop: '10px' }} md='3'>
                                <div style={{}} className="blog-slider">
                                    <div className="blog-slider__wrp swiper-wrapper">
                                        <div className="blog-slider__item swiper-slide-active">
                                            <div className="blog-slider__img">
                                                <img src={sharelog} alt="" />
                                            </div>
                                            <div className="blog-slider__content">
                                                <span className="blog-slider__code">{moment(item.createdAt).format("DD MMM YYYY h:mm:ss a")}</span>
                                                <div className="blog-slider__title">{item.name}</div>
                                                <div className="blog-slider__text">{item.company ? item.company.company_name : ""}</div>
                                                <Link to={`/shared-forms-list/shardformrecords?id=${item.id}&name=${item.name}`} className="blog-slider__button">Open</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        ))}

                    </Row>
                    <Row>
                        <Col>
                            {sharedforms.length == 0 && <center><h1 style={{color: "#0000005e",fontWeight: "700"}}>There are no shared forms available now.</h1></center>}
                        </Col>
                    </Row>
                </div>
            </Fragment>
        )
    }
}


//Get States key
const mapStateToProps = ({ user }) => ({
    user
});

//Get Despatch Functions
const mapDispatchToProps = (dispatch) => ({
    GetSharedformRecords: (data) => dispatch(GetSharedformRecords(data)),
    GetSharedformTableView: (data) => dispatch(GetSharedformTableView(data)),
    GetSharedforms: (data) => dispatch(GetSharedforms(data)),
});

//Export class
export default connect(mapStateToProps, mapDispatchToProps)(SharedformsList);
