import css from './User.module.css'

import UserProfileRightsideBar from '../../components/UserProfileComponents/UserProfileRightsideBar/UserProfileRightsideBar'

import UserHero from '../../utils/UserProfileUtils/UserHero/UserHero'
import LeftSideCardPanel from '../../utils/LeftSideCardPanel/LeftSideCardPanel'

import userImg from '../../utils/images/food1.jpg';

const User = () => {

    let data1 = [ 
        {title: "Reviews", hash: "reviews"}
    ];
    let data2 = [ 
        {title: "Order History", hash: "order-history"},
        // {title: "My Address", hash: "address"},
        {title: "Favorite Orders", hash: "favorite-orders"},
    ];

  return (<div className={css.outerDiv}>
    <div className={css.box}>
      <UserHero />
      <div className={css.mainbody}>
        <div className={css.leftBox}>
          <LeftSideCardPanel name='ACTIVITY' data={data1} />
          <LeftSideCardPanel name='ONLINE ORDERING' data={data2} />
        </div>
        <div className={css.rightBox}>
          <UserProfileRightsideBar />
        </div>
      </div>
    </div>
  </div>)
}

export default User