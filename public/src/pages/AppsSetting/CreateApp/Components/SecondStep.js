import React, { useState } from 'react';
import Stats from './StatsStep';
import { Row, Col } from 'reactstrap';
import constant from "../../../../utils/constant";
import '../../AppSetting.css';

// let config2 = config
const SecondStep = props => {

    const [search_icon_name, updateSearchIconName] = useState("");
    const [selected_icon, setSelectedIcon] = useState(props.data.appLogo);

    const nextStep = (e) => {
        props.handleNext(selected_icon, 'selected_icon');
        props.nextStep()
    }

    return (
        <>
            <div className="form  mb-5 pt-2 pb-3 body-content">
             
                <div className="search-box">
                    <div className="position-relative">
                        <input  name="search"  value={search_icon_name}  onChange={(e) => updateSearchIconName(e.target.value)} type="text" placeholder="search" autoComplete="off" className="form-control" />
                        <i className="fa fa-search" aria-hidden="true"></i>
                    </div>
                </div>

                <Row>
                    <Col sm="10" md="10" className="logo-list">
                        <div className="row">
                            {constant.icons.map((x, i) => {
                                if (search_icon_name != "" && x.name.search(search_icon_name) == "-1") {
                                    return false
                                }

                                return (
                                    <div className="col cursor-pointer">
                                        <div onClick={e => setSelectedIcon(x.icon)}>
                                            <i className={x == selected_icon ? 'material-icons border p-1' : 'material-icons p-1'}>{x.icon}</i>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Col>
                    <Col sm="2" md="2">
                        <div className="appLogo" >
                            {selected_icon && <i className="material-icons">{selected_icon}</i>}
                        </div>
                    </Col>
                </Row>

            </div>

            <Stats
                step={2}
                {...props}
                handleNextStep={() => nextStep()}
                isEnable={selected_icon != ""}
                history={props.history} />
        </>
    );



};


export default SecondStep;