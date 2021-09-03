import React, { Fragment, useState, useEffect } from 'react';
import Stats from './StatsStep';

const FourStep = props => {

    const [default_path, setDefaultPage] = useState(props.data.default_path);
    const [default_path_url, setDefaultPathUrl] = useState(props.data.default_path_url);
    const [options_value, setOptionsValue] = useState(props.data.sidenav_config);

    
    useEffect(() => {
        console.log(props.data.sidenav_config);
        setDefaultPage(props.data.default_path);
        setOptionsValue(props.data.sidenav_config);
    },[props.data]);

    const nextStep = (e) => {
        props.handleNext({ default_path, default_path_url }, 'default_home_page', props);
        
    }

    return (
        <>
            <div className="form  mb-5 pt-5 pb-3 body-content">
                <label>Set Default Home page<span className='required-star'>*</span></label>
                <div className="form-group">
                    <select className="form-control" name="default_path" onChange={e => setDefaultPage(e.target.value)} value={default_path}>
                        <option value="">select Default page</option>
                        {options_value.map((x, i) => <option key={i} value={x.route}>{x.name}</option>)}
                        <option value="custom_url">Custom URL</option>
                    </select>
                </div>

                {default_path == 'custom_url' &&
                    <div className="form-group">
                        <label for="appName">Enter Url<span className='required-star'>*</span></label>
                        <input type="text"
                            className="appName form-control"
                            value={default_path_url}
                            name="default_path_url"
                            onChange={(e) => setDefaultPathUrl(e.target.value.replace("<<AppName>>",props.appName))}
                            id="default_path_url" />
                    </div>
                }

            </div>

            <Stats
                step={4}
                {...props}
                onClose={props.onClose}
                handleNextStep={() => nextStep()}
                isEnable={default_path != ""}
                history={props.history}
            />

        </>
    );
};

export default FourStep;