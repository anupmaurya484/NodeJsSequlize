import React from 'react'
import { Button, Card, CardHeader, CardBody, CardText } from "reactstrap";
import { Link } from 'react-router-dom';
import { AppDesign } from '../../utils/helperFunctions';

const CardLists = (props) => {
  const { style, title, subTitle, description, button1Text, button1Url, button2Text, button2Url, button1 } = props
  return (
    <Card style={style}>
      <CardHeader className="hideOverflow" style={{ textTransform: "capitalize", padding: '.75rem 1.25rem' }}>
        {title}
      </CardHeader>
      <CardBody>
        {subTitle && <p className='font-weight-bold blue-text'>{subTitle}</p>}
        <CardText>
          <span className="multi-line">{description}</span>
        </CardText>
      </CardBody>
      {button1 === false ? "" :
        <div className="mb-2 ml-2">
          <Link to={(AppDesign() ? "/design" + button1Url : button1Url)}><Button className="btn-default mr-1" size="sm">{button1Text}</Button></Link>
          {(button2Url && button2Text && AppDesign()) &&
            <Link to={"/design" + button2Url}><Button className="btn-default" size="sm">{button2Text}</Button ></Link>
          }
        </div>
      }

    </Card >
  )

}
export default CardLists;