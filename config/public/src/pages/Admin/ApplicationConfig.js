import React, { Component } from 'react';
import { Row, Col, Card, Button, CardBody, Table, Input, CardTitle, InputGroup, InputGroupAddon, DropdownItem, DropdownToggle, DropdownMenu, UncontrolledDropdown } from 'reactstrap';
import DataTable from "../../components/DataTable";
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import CustomToggle from '../../components/CustomToggle';
import moment from 'moment';
import { Link } from 'react-router-dom';
import sharelog from '../../assets/images/sharelog.png';
import './ApplicationConfig.css';

//Import functions
import { GetAppName, AppDesign} from '../../utils/helperFunctions';
import { GetSharedforms, GetSharedformTableView, GetSharedformRecords } from "../../actions/sharedForm.actions";

class ApplicationConfig extends Component {
   state = { 
        applicationconfig: [],
        is_call_api: false,
        display_layout: 1
     }

    // async handleInputChange(e) {
    //     const { name, value } = e.target;
    //     await this.setState({ [name]: value });
    //     this.loadSharedforms()
    // }


    // loadApplicationConfig = async () => {
    //     try {
    //         const { search } = this.state;
    //         const reqData = { search };
    //         const response = await this.props.GetSharedforms(reqData);
    //         if (response && response.data && response.data.length) {
    //             const { data } = response
    //             this.setState({ applicationconfig: data, is_call_api: true });
    //         } else {
    //             this.setState({ is_call_api: true })
    //         }
    //     } catch (err) {
    //         console.log(err.message);
    //     }
    // }
    
    // componentDidMount() {
    //     //Call Onload function for Get intial datas
    //     this.loadApplicationConfig();
    // }

    // getTableRows = () => {
	// 	const that = this;
	// 	const { applicationconfig } = this.state;
	// 	var rootPath = GetAppName(this.props.user);
	// 	let rows = applicationconfig && applicationconfig.map((config, i) => ({
	// 		name: config.name,
	// 		description: config.description,
	// 		action: <div style={{ "width": "70px", "display": "flex" }}>
	// 			<UncontrolledDropdown className="CustomToggle" setActiveFromChild>
	// 				<DropdownToggle tag={CustomToggle} />
	// 				<DropdownMenu size="sm" title="" right flip>
	// 					<DropdownItem className="d-flex" onClick={() => that.props.history.push(rootPath + config.urlCollection + `&name=${config.name}`)}><span className="d-flex"><i className="pointer text-success material-icons" data-toggle="tooltip" title="Open">visibility</i>open</span></DropdownItem>
	// 					{AppDesign() && <DropdownItem className="d-flex" onClick={() => that.props.history.push((config.urlDesigner) ? rootPath + config.urlDesigner : null)}><span className="d-flex"><i className="pointer text-warning material-icons" data-toggle="tooltip" title="Edit">&#xE254;</i>Edit</span></DropdownItem>}
	// 				</DropdownMenu>
	// 			</UncontrolledDropdown>
	// 		</div>
	// 	}));
	// 	return rows
	// }

    render() { 
        // const { applicationconfig, is_call_api, } = this.state;
        // const { display_layout } = this.state;
        // var rootPath = GetAppName(this.props.user);
        // if (is_call_api === false) return true;

        // const data = {
		// 	columns: [
		// 		{
		// 			label: <FormattedMessage id="page.names" />,
		// 			field: 'name',
		// 		},
		// 		{
		// 			label: <FormattedMessage id="page.description" />,
		// 			field: 'description',
		// 		},
		// 		{
		// 			label: 'Action',
		// 			field: 'action',
		// 			sort: 'disabled'
		// 		}
		// 	],
		// 	rows: this.getTableRows(),
		// }

        return (
            <React.Fragment>
              <div className='app-config'>
              <Row>
                        <Col col='6'>
                            <div className='page-heading-title'>
                                <h3><b>Application Configuration</b></h3>
                            </div>
                        </Col>
                        <Col col='6'>
                            <div className="page-title-box d-flex align-items-center justify-content-end">
                                <div className="search-box">
                                    <div className="position-relative">
                                        <input onChange={(e) => this.handleInputChange(e)} name="search" type="text" placeholder="search" autoComplete="off" className="form-control" />
                                        <i className="fa fa-search" aria-hidden="true"></i>
                                    </div>
                                </div>
                                {/* <Dropdown/> */}
                                {/* <select name="type" name="filterType" className="form-control col-lg-4 ml-3" onChange={(e) => this.handleInputChange(e)}>
									<option value=''>All</option>
									<option value={constants.TYPE_GRIDFS}>GRID FS</option>
									<option value={constants.TYPE_GDRIVE}>Google Drive</option>
									<option value={constants.TYPE_ONEDRIVE}>One Drive</option>
									<option value={constants.TYPE_NINTEX}>Nintex</option>
								</select> */}
                                <div className="page-title-right d-flex ">
                                    <div className="pt-1">
                                        <i onClick={() => this.setState({ display_layout: 2 })} className="fa fa-align-justify table-type pointer" aria-hidden="true" style={{ "margin": "0px 10px 0px 10px" }}></i>
                                        <i onClick={() => this.setState({ display_layout: 1 })} className="fa fa-th-large table-type pointer" aria-hidden="true"></i>
                                    </div>
                                    {/* {AppDesign() &&
										<Link to={"/design" + GetAppName(this.props.user) + '/add-container?id=new'}>
											<Button className="btn-default mr-1" size="sm">Add File Container</Button>
										</Link>
									} */}
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                    <Col lx="8">    
                                <Card>
                                    <CardBody>
                                        <div className="table-app-config">
                                            <Table className="mb-0 table-nowrap" Style={{'width':'680px'}}>
                                                <thead className="thead-light">
                                                    <tr style={{'width':'170px'}}>
                                                        <th>App Name</th>
                                                        <th>installed Version</th>
                                                        <th>date Installed</th>
                                                        <th>latest Version</th>
                                                        <th colSpan="2" >update</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    
                                                       
                                                            <tr>
                                                                <td>
                                                                   
                                                                </td>
                                                                <td>
                                                                
                                                                </td>
                                                                <td>
                                                                
                                                                </td>
                                                                <td>
                                                                
                                                                </td>
                                                                <td>
                                                                
                                                                </td>
                                                                <td>
                                    
                                                                </td>
                                                            </tr>
                                                


                                                </tbody>
                                            </Table>
                                        </div>
                                    </CardBody>     
                                </Card>
                                </Col>    
                    </Row>
                    {/* {(display_layout == 1 && applicationconfig.length != 0) &&
                        <div style={{ marginBottom: '20px' }}>
                            <Row>
                                {applicationconfig.map((item, i) => (
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
                        </div>
                    } */}
                     {/* {(display_layout == 2 && applicationconfig.length != 0) &&
                        <div style={{ marginBottom: '20px' }}>
                            <Row>
                                <Col className="mt-1">
                                    <Card>
                                        <DataTable
                                            isPagination={false}
                                            isSearch={false}
                                            totalPage={25}
                                            correntPage={1}
                                            data={data}
                                            onClicks={(e) => console.log(e)} />
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    } */}
              </div>   
            </React.Fragment>
          );
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

export default connect(mapStateToProps, mapDispatchToProps) (ApplicationConfig);