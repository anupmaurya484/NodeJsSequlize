import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import AliceCarousel from 'react-alice-carousel';
import { GetCollections } from "../../../actions/collection";
import CardLists from '../../../components/CardLists';
import { GetAppName } from '../../../utils/helperFunctions';
import docImage from '../../../assets/images/Documents_illustrator.svg';
import 'react-alice-carousel/lib/alice-carousel.css';
import '../HomePage.css';


const handleDragStart = (e) => e.preventDefault();

const responsive = {
  0: { items: 1 },
  568: { items: 2 },
  1024: { items: 3 },
}

class CollectionCarousel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collectionList: []
    }
  }

  componentDidMount() {
    this.loadCollectionList()
  }

  loadCollectionList = async () => {
    try {
      const { app_id, User_data } = this.props.user
      const reqData = { userId: User_data._id, appId: app_id }
      var res = await this.props.GetCollections(reqData);
      this.setState({ collectionList: res.data });
    } catch (err) {
      console.log(err.message);
    }
  }

  render() {
    const { collectionList } = this.state;
    var rootPath = GetAppName(this.props.user);
    return (
      <Fragment>
        { collectionList && !collectionList.length &&
          <div className='row justify-content-center'>
            <div className='col-4 align-self-center text-right'>
              <img src={docImage} className="figure-img img-fluid" style={{ height: "100px" }} />
            </div>
            <div className='col-4 align-self-end text-left'>
              <p>List of Collections to store documents</p>
            </div>
          </div>
        }
        <AliceCarousel
          autoPlay
          autoPlayStrategy="none"
          autoPlayInterval={1000}
          mouseTracking
          items={collectionList.map((collection, i) => (
            <CardLists
              key={i}
              style={{"width" : "280px" }}
              title={collection.name}
              description={collection.description}
              button1Text='Open'
              button1Url={rootPath + collection.urlCollection + `?name=${collection.name}`}
              button2Text='Design'
              button2Url={(collection.urlDesigner) ? rootPath + collection.urlDesigner : null} />
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

const mapDispatchToProps = (dispatch) => ({
  GetCollections: (data) => dispatch(GetCollections(data))
})

export default connect(mapStateToProps, mapDispatchToProps)(CollectionCarousel);