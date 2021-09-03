import React from 'react';
import { connect } from 'react-redux';
import constant from '../../../utils/constant';
import API from '../../../config';
import { isValidProfileURL } from "../../../utils/helperFunctions";
class Me extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      User_data: this.props.user.User_data,
      userRoleDisplay: "",
    }
  }

  componentDidMount() {
    var { userRoleDisplay, User_data } = this.state;
    if (User_data) {
      userRoleDisplay = (User_data.level !== "2") ? constant.levels.find(x => x.id == User_data.level).name : (User_data.credits == 0 ? "Free tier" : "Explorer");
      this.setState({ userRoleDisplay: userRoleDisplay });
    }
  }

  GetTwoName = (name) => {
    try {
      return (name.split(" ")[0][0] + " " + name.split(" ")[1][0]).toUpperCase()
    } catch (e) {
      return name
    }
  }

  render() {
    const { User_data, userRoleDisplay } = this.state;
    return (
      <div>
        <div className='text-center mt-3'>
          {(User_data.profile_img && User_data.profile_img != "") ? <img src={isValidProfileURL(API.API_URL, User_data.profile_img)} className="rounded-circle z-depth-0" style={{ width: "100px", height: "100px", padding: 0, margin: "0 auto" }} alt="" />
            : <div className="profile-name profile-text-imge"><span>{this.GetTwoName(User_data.firstname + " " + User_data.lastname)}</span></div>
          }
        </div>
        <div className='text-center mt-3'>
          <span>{User_data.firstname + " " + User_data.lastname + " ( " + userRoleDisplay + " )"}</span>
        </div>
        <div className='text-center mt-1'>
          <span style={{ margin: "0px 10px 10px" }}>{User_data.email}</span>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ user }) => {
  return { user }
}

export default connect(mapStateToProps, null)(Me);