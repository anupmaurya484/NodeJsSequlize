import React from 'react';
import queryString from 'query-string';

class AuthPage extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
        debugger
        let queryParam = queryString.parse(this.props.location.search);
        if (typeof queryParam.state !== 'undefined') {
            let stateObj = JSON.parse(atob(queryParam.state));
            if (window.location.origin !== stateObj.origin) {
                window.location.href = stateObj.origin+"/public/auth" + this.props.location.search
            }else{
                window.close()
            }
        } else {
            window.location.href = queryParam.url;
        }
    }

    render() {
        return (
            <div />
        )
    }
}
export default AuthPage;
