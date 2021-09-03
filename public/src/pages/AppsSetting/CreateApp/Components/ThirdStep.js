import React, { Fragment, useState, useEffect } from 'react';
import { Row, Col, FormGroup, Label, Input } from 'reactstrap';
import Stats from './StatsStep';



const loadInitialSidenavConfig = (props) => {
	let initialSidenavConfig = [{
		"name": "Dashboard",
		"route": "/",
		"icon": "dashboard",
		"text": "Dashboard",
		"checked": true
	},
	{
		"name": "Collections",
		"route": "/collection-list",
		"icon": "view_module",
		"text": "Collections",
		"checked": true
	},
	{
		"name": "Page Layouts",
		"route": "/page-list",
		"icon": "settings",
		"text": "Page Layout",
		"checked": true
	}, {
		"name": "Connection",
		"route": "/connections",
		"icon": "settings_input_component",
		"text": "Connections",
		"checked": true
	}, {
		"name": "File Folders",
		"route": "/containers",
		"icon": "folder",
		"text": "File Folders",
		"checked": true
	}, {
		"name": "Schedules",
		"route": "/schedules",
		"icon": "today",
		"text": "Schedules",
		"checked": true
	}, {
		"name": "Calendar",
		"route": "/calendar-list",
		"icon": "today",
		"text": "Calendar",
		"checked": true
	}, {
		"name": "workflow",
		"route": "/workflow",
		"icon": "play_arrow",
		"text": "workflow",
		"checked": true
	}];

	;
	console.log(props.data.sidenav_config);
	if (props.data.sidenav_config && props.data.sidenav_config.length >= 1) {
		var links = props.data.sidenav_config[0].links;
		if (props.data.sidenav_config[0].links) {
			initialSidenavConfig.forEach(ele => {
				ele["checked"] = links.findIndex((x) => x.name == ele.name) >= 0 ? true : false;
			});
		}
	}
	return initialSidenavConfig;
}

const ThirdStep = props => {

	const [SidenavConfig, setSidenavConfig] = useState(loadInitialSidenavConfig(props));
	const [isSideNav, setsideNav] = useState((props.data.isSideNav || props.data.isSideNav==false ) ? props.data.isSideNav : true);
	const [isTopNav, settopNav] = useState((props.data.isTopNav || props.data.isTopNav==false) ? props.data.isTopNav : true);

	const handleSubmitTaskForm = (nodeId, e) => {
		props.nextStep();
		props.handleNext({ isSideNav, isTopNav, SidenavConfig }, 'SidenavConfig');
	}


	const onChangeEvent = (e, index) => {
		let SidenavConfigs = SidenavConfig;
		SidenavConfigs[index]['checked'] = e.target.checked;
		setSidenavConfig(JSON.parse(JSON.stringify(SidenavConfigs)));
	}

	return (
		<div className="form  mb-5 pt-2 pb-3 body-content app-step-third">
			<Row>
				<Col sm="3" md="3">
					<div className="custom-control custom-switch mb-2 ml-4" dir="ltr">
						<input type="checkbox" className="custom-control-input" id="isSideNav" checked={isSideNav} />
						<label className="custom-control-label" htmlFor="isSideNav" onClick={(e) => { setsideNav(!isSideNav); }}>Show SideNav</label>
					</div>
				</Col>
				<Col sm="3" md="3">
					<div className="custom-control custom-switch mb-2 ml-4" dir="ltr">
						<input type="checkbox" className="custom-control-input" id="isTopNav" checked={isTopNav} />
						<label className="custom-control-label" htmlFor="isTopNav" onClick={(e) => { settopNav(!isTopNav); }}>Show TopNav</label>
					</div>
				</Col>
			</Row>
			{/* <>
				<div className="heading ml-4">
					<h5>Select features to be enabled for the application</h5>
				</div>
				<Row style={{ "borderStyle": "dotted", "margin": "10px 30px 30px 30px" }}>
					{SidenavConfig.map((x, index) => {
						return (
							<Col key={index} sm="3" md="3">
								<FormGroup controlId={x.name}>
									<Label>{x.name}</Label>
									<Input className="form-check-input ml-1" checked={x.checked} onChange={event => onChangeEvent(event, index)} type="checkbox" />
								</FormGroup>
							</Col>
						)
					})}
				</Row>
			</> */}

			<Stats
				onClose={props.onClose}
				handleNextStep={handleSubmitTaskForm}
				step={3}
				{...props}
				isEnable={true}
				history={props.history} />
		</div>
	);
};


export default ThirdStep;