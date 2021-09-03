import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Container } from 'reactstrap';
// Other Layout related Component
import Navbar from "./Navbar";
import Header from "./Header/Header";
import Footer from "./Footer";
import SideMenus from "./Header/SideMenus";
import { showLeftSidebarAction } from "../../actions";
import { GetAppData, AppDesign } from "../../utils/helperFunctions";

class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMenuOpened: false
    };
  }
  /**
   * Opens the menu - mobile
   */
  openMenu = e => {
    this.setState({ isMenuOpened: !this.state.isMenuOpened });
  };
  render() {
    const { isLoggedIn } = this.props.user;
    const header_setting = GetAppData(this.props.user, this.props.layout)
    return (
      <React.Fragment>
        <div id="layout-wrapper">

          {/* With Header  */}
          {(header_setting.isTopNav || AppDesign()) && <Header theme={this.props.topbarTheme} isMenuOpened={this.state.isMenuOpened} openLeftMenuCallBack={this.openMenu} />}
          {(header_setting.isTopNav || AppDesign()) &&
            <div className="main-content">
              <div className="page-content">
                <Container fluid>
                  {this.props.children}
                </Container>
              </div>
            </div>
          }
          <Footer />
        </div>

        {/* With SideNav  */}
        {((header_setting.isSideNav || AppDesign()) && this.props.layout.showLeftSidebar && isLoggedIn) ? <SideMenus isShowSideMenu={(header_setting.isSideNav && !header_setting.isTopNav)} /> : null}

        {/* Without Header  */}
        {(!header_setting.isTopNav && !AppDesign()) &&
          <div className="main-content">
            <Container fluid>
              {this.props.children}
            </Container>
          </div>
        }
        {(header_setting.isSideNav && !header_setting.isTopNav) &&
          <button onClick={() => { this.props.showLeftSidebarAction(!this.props.layout.showLeftSidebar); }} style={{ 'position': 'absolute', 'top': '0px', 'left': '-5px', 'color': '#000', "border": "inherit", "background": "content-box" }}>
            <i className="fa fa-fw fa-bars"></i>
          </button>
        }

      </React.Fragment>
    );
  }
}
const mapStatetoProps = state => {
  return {
    user: state.user,
    layout: state.Layout,
  };
};
export default connect(mapStatetoProps, { showLeftSidebarAction })(withRouter(Layout));