import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { connect } from 'react-redux'
import * as ACT from '../../../actions';

// falgs
import English from "../../../assets/images/language/english.jpg";
import French from "../../../assets/images/language/french.jpg";
import Chinese from "../../../assets/images/language/chinese.jpg";
import Japanese from "../../../assets/images/language/japanese.jpg";
import Taiwan from "../../../assets/images/language/taiwan.jpg";


var languages = [
  { title: 'English', key: 'en', flag: English },
  { title: 'française', key: 'fr', flag: French },
  { title: '简体中文', key: 'cn', flag: Chinese },
  { title: '繁體中文', key: 'tw', flag: Japanese },
  { title: '日本語', key: 'ja', flag: Taiwan }
];


class LanguageDropdown extends Component {

  constructor(props) {
    super(props);
    this.state = {
      menu: false,
      flag: English,
      lng: "English",
      key: 'en'
    }
  }

  UNSAFE_componentWillReceiveProps(props) {
    const isLanguage = props.user.languageType

    console.log(isLanguage);
    if (isLanguage) {
      const lng = isLanguage.key;
      if (lng == "en") {
        this.setState({ lng: "English", key: lng });
      } else if (lng == "fr") {
        this.setState({ lng: "French", key: lng });
      } else if (lng == "cn") {
        this.setState({ lng: '简体中文', key: lng });
      } else if (lng == "tw") {
        this.setState({ lng: '繁體中文', key: lng });
      } else if (lng == "ja") {
        this.setState({ lng: '日本語', key: lng });
      }
    }

  }


  changeLanguageAction = (item) => {
    this.props.setLanagugae(item)
  }

  render() {
    const { menu, flag, lng } = this.state;
    return (
      <React.Fragment>
        <Dropdown isOpen={menu} toggle={() => this.setState({ menu: !menu })} className="d-inline-block">
          <DropdownToggle className="btn header-item waves-effect  d-flex " tag="button" style={{ "paddingTop": "12px" }}>
            <i class="fa fa-globe mr-1" height="16" aria-hidden="true" style={{ "fontSize": "24px" }}></i>
            <span className="align-middle" style={{ "lineHeight": "25px" }}>{lng}</span>
          </DropdownToggle>
          <DropdownMenu className="language-switch" right>
            {languages.map((item, index) =>
              <DropdownItem key={index} tag="a" href="#" onClick={() => this.changeLanguageAction(item)} className="notify-item">
                {/* <img src={item.flag} alt="Skote" className="mr-1" height="12" /> */}
                <span className="align-middle">{item.title}</span>
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      </React.Fragment>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setLanagugae: (language) => dispatch(ACT.setLanagugae(language))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LanguageDropdown)
