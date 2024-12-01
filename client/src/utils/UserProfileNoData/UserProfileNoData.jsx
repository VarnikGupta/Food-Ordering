import { useState, useEffect } from 'react'

import css from './UserProfileNoData.module.css'


import photos from '../images/icons/nophotos.png'
import favorders from '../images/icons/nofavorders.png'
import reservations from '../images/icons/noreservations.png'


const UserProfileNoData = ({hashId}) => {

  let [page, setPage] = useState(photos)

  useEffect(() => {
    switch(hashId){
      case "reviews": 
        setPage(photos)
        break;
      case "order-history": 
        setPage(reservations)
        break;
      case "address": 
        setPage(reservations)
        break;
      case "favorite-orders": 
        setPage(favorders)
        break;
      // default: null
    }
  }, [hashId]);

  return (
    <div className={css.outerDiv}>
        <div className={css.innerDiv}>
          <div className={css.imgBox}>
            <img src={page} className={css.img} />
            <div className={css.txt}>Nothing here yet!</div>
          </div>
        </div>
    </div>
  )
}

export default UserProfileNoData