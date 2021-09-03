import React from 'react'
import { Table, TableBody, TableHead, Button, Container, Icon, Row, Col, Badge } from 'reactstrap'

export const arrayFieldTemplate = (props) => {
	const innerObjectProperties = props.items[0] ? props.items[0].children.props.schema.properties : {};
	const data_min_width = {
		columns: [],
		rows: []
	};
	const { uiSchema } = props;
	const layout = uiSchema['ui:layout'];
	const innerObjectFieldTemplate = (props) => {
		return (
			<Row className="hidden-title m-0">
				{props.properties.map((property, idx2) => (
					<Col md={(layout && layout.length == 1) ? layout[0][property.name]['md'] : 3} key={idx2} className='zero-margin'>
						{property.content}
					</Col>
				))}
			</Row>
		)
	}

	return (
		<div className="array-field-container">
			<Container>
				<Row style={{ border: "1px solid grey" }} >
					<Col md="10" >
						<Row className="m-0">
							{
								Object.keys(innerObjectProperties).map((property, index) => (
									<Col md={(layout && layout.length == 1) ? layout[0][property]['md'] : 3} key={index} className='zero-margin'>
										{innerObjectProperties[property].title}
									</Col>
								))
							}
						</Row>
					</Col>
					<Col md="2" className='m-auto'>Action</Col>
				</Row>
				{
					props.items.map((element, idx1) => {
						element.children.props.registry.ObjectFieldTemplate = innerObjectFieldTemplate;
						console.log(element.children);
						return (
							<Row key={idx1} style={{ border: "1px solid grey" }} className='zero-margin'>
								<Col md="10" className="m-0">
									{element.children}
								</Col>
								<Col md="2" className='m-auto'>
									<div className="btn-group">
										{element.hasMoveDown && (
											<Badge
												color="primary"
												className="m1-2 float-right"
												onClick={element.onReorderClick(
													element.index,
													element.index + 1
												)} >
												<i className="fa fa-arrow-down" />
											</Badge>
										)}
										{element.hasMoveUp && (
											<Badge
												color="primary"
												className="m1-2 float-right"
												onClick={element.onReorderClick(
													element.index,
													element.index - 1
												)} >
												<i className="fa fa-arrow-up" />
											</Badge>
										)}
										{element.hasRemove && (
											<Badge
												color="primary"
												className="m1-2 float-right"
												onClick={element.onDropIndexClick(element.index)} >
												<i className="fa fa-trash-alt" />
											</Badge>
										)}
									</div>
								</Col>
							</Row>
						)
					})
				}

				<Row className="zero-margin">
					<Col xl="3" md="12" className="mx-auto text-center">
						<Button color="info" rounded onClick={e => handleClickAdd(e, props)}>
							<i className="fa fa-plus" />
						</Button>
					</Col>
				</Row>
			</Container>
		</div>
	)
}

const handleClickAdd = (e, props) => {
	props.onAddClick(e)
	const propertiesLength = e.index //Object.keys(props.schema.items.properties).length
	setTimeout(() => {
		// fix hidden dropdown select due to materializecss override script
		// by adding 'browser-default' class
		//addBrowserDefaultClassOnSelectElements()
		//setCellWidthEqually(propertiesLength)
	}, 50)
}
