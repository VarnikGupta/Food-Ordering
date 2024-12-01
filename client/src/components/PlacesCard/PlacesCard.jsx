import { Link } from 'react-router-dom';

import './PlacesCard.css';

// import rightArrow from '../../assets/right-arrow.png';

let PlacesCard = ({ place }) => {
    return <div className='card'>
        <div className='innerBox'>
            <div className='place'>{place}</div>
            {/* <div className='count'>{5} Places</div> */}
        </div>
        {/* <div className='arrowBox'>
            <img className='arrow' src={rightArrow} alt="right arrow" />
        </div> */}
    </div>
}

export default PlacesCard;