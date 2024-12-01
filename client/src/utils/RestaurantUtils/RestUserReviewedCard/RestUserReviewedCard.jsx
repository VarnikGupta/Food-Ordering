import {useState} from 'react'

import css from './RestUserReviewedCard.module.css'

// import downArrowImg from '/icons/down-arrow.png'
// import starImg from '/icons/star.png'
// import shareImg from '/icons/share.png'
// import likeImg from '/icons/like.png'
// import likedImg from '/icons/liked.png'
// import comment from '/icons/message.png'
// import close from '/icons/close.png'
import profilepic from "../../images/profilepic.jpg";
import RatingNumberBox from '../RatingNumberBox/RatingNumberBox'
// import WhiteBtnHov from '../../Buttons/WhiteBtnHov/WhiteBtnHov'
// import RedBtnHov from '../../Buttons/RedBtnHov/RedBtnHov'

const RestUserReviewedCard = (props) => {
    let {imgSrc, title, address, reviews, followers, stars, days, votes, comments, id, userImg} = props?.data;
    let [alertBoxCss, setAlertBoxCss] = useState([css.alertBox, css.dnone].join(' '));
    let [liked, setLiked] = useState(false);
    let [toggleDropDown, setToggleDropDown] = useState(false);
    let [toggleCommentBox, setToggleCommentBox] = useState(false);
    let [following, setFollowing] = useState(false);

    let { 
        restName, 
        userName, 
        rating, 
        feedback, 
        restId, 
        userId, 
        createdAt
        // userImg 
      } = props?.data;

    console.log("props",props)
    let toggleDropdown = () => {
        setToggleDropDown(val=>!val);
    }

    let shareURL = () => {
        navigator.clipboard.writeText(document.URL);
        setAlertBoxCss(css.alertBox);
        setTimeout(() => {
            setAlertBoxCss([css.alertBox, css.dnone].join(' '));
        }, 5000)
    }

    let closeAlert = () => {
        setAlertBoxCss([css.alertBox, css.dnone].join(' '));
    }

    const formattedDate = new Date(createdAt * 1000).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
  return (
    <>
    <div className={css.outerDiv}>
        <div className={css.innerDiv}>
            <div className={css.sec1}>
                <div className={css.leftBox}>
                    <div className={css.imgBox}><img className={css.hotelImg} src={profilepic} alt='hotel image' /></div>
                    <div className={css.txtBox1}>
                        <div className={css.title}>{userName}</div>
                    </div>
                </div>
                        <span className={css.delTxt}> {formattedDate} </span>
            </div>
            <div  className={css.sec}>
                <span className={css.delivery}> <RatingNumberBox stars={rating} txt={rating} iconR={false} isActive={true} /> </span>
                <span className={css.delivery}>  {feedback}</span>
                {/* <span className={css.days}>{createdAt} days</span> */}
            </div>
        </div>
    </div>
    {/* {toggleCommentBox ? <div className={css.commentBox}>
        <div className={css.userImgBox}><img src={userImg} className={css.userImg} alt="user profile pic" /></div>
        <div className={css.inputBox}><input type='text' className={css.inptTxtBox} placeholder="Write your comment" /></div>
    </div>: null} */}
    </>
  )
}

export default RestUserReviewedCard