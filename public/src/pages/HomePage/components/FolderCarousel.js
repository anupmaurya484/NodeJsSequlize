import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import AliceCarousel from 'react-alice-carousel';
import CardLists from '../../../components/CardLists';
import axiosService from '../../../utils/axiosService';
import constants from '../../../config';
import { GetAppName } from '../../../utils/helperFunctions';
import folderImage from '../../../assets/images/Folder_girl.svg';
import 'react-alice-carousel/lib/alice-carousel.css';
import '../HomePage.css';

const responsive = {
  0: { items: 1 },
  568: { items: 2 },
  1024: { items: 3 },
}

class FolderCarousel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      containers: [],
    }
  }

  componentDidMount() {
    this.getContainerList();
  }

  getContainerList() {
    const { app_id, User_data } = this.props.user;
    const { filterType, search } = this.state;
    const payload = { "userId": User_data.id, appId: app_id, filterType, search };
    axiosService.apis('POST', '/api/GetAllContainers', payload)
      .then(response => {
        this.setState({ containers: response })
      })
  }

  getType = type => {
    if (type)
      return constants.storageTypes[type];
    else
      return constants.storageTypes;
  }

  render() {
    const { containers } = this.state;
    var rootPath = GetAppName(this.props.user);
    return (
      //`tab: ${this.props.tabTitle}`;
      <Fragment>
        { containers && !containers.length &&
          <div className='row justify-content-center'>
            <div className='col-4 align-self-center text-right'>
              <img src={folderImage} className="figure-img img-fluid" style={{ height: "100px" }} />
            </div>
            <div className='col-4 align-self-end text-left'>
              <p>List of Folders to keep files</p>
            </div>
          </div>
        }
        <AliceCarousel
          autoPlay
          autoPlayStrategy="none"
          autoPlayInterval={1000}
          mouseTracking
          items={containers && containers.map((item, i) => (
            <CardLists
              key={i}
              title={item.title}
              style={{"width" : "280px" }}
              subTitle={this.getType(item.type)}
              description={item.content}
              button1Text='Open'
              button1Url={rootPath + '/file-explorer/' + item._id}
              button2Text='Edit'
              button2Url={rootPath + '/add-container?id=' + item._id} />
          ))}
          disableDotsControls={false}
          disableButtonsControls={true}
          responsive={responsive} />
      </Fragment>
    )
  }
}


const mapStateToProps = ({ user }) => {
  return { user }
}

export default connect(mapStateToProps, null)(FolderCarousel);