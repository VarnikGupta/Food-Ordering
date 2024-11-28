import {useState, useEffect} from 'react'
import {NavLink, useParams} from "react-router-dom"

import css from './OrderBodyComponent.module.css'

import OrderOnlineFieldComponent from './Components/OrderOnlineFieldComponent/OrderOnlineFieldComponent'
// import PhotosComponent from './Components/PhotosComponent/PhotosComponent'
import ReviewsComponent from './Components/ReviewsComponent/ReviewsComponent'
// import MenuComponent from './Components/MenuComponent/MenuComponent'

const OrderBodyComponent = () => {

    const [pageCompo, setPageComp] = useState("")

    const {page="",id=""} = useParams();

    const isActiveClass = (e) => {
        if(e?.isActive){
            return [css.menuTxt, css.menuTxtActive].join(" ");
        }else{
            return css.menuTxt;
        }
    }

    useEffect(()=> {
        switch(`/restaurant/${id}/${page}`){
            case `/restaurant/${id}/order`:
                setPageComp(<OrderOnlineFieldComponent />);
                break;
            case `/restaurant/${id}/reviews`:
                setPageComp(<ReviewsComponent />);
                break;
            default: 
                setPageComp(<OrderOnlineFieldComponent />);
        }
    }, [page])


  return <div className={css.outerDiv}>
    <div className={css.innerDiv}>
        <div className={css.menu}>
            <NavLink to={`/restaurant/${id}/order`} className={isActiveClass}>
                Order Online
            </NavLink>
            <NavLink to={`/restaurant/${id}/reviews`} className={isActiveClass}>
                Reviews
            </NavLink>
        </div>
        <div className={css.componentsBody}>
            {pageCompo}
        </div>
    </div>  
  </div>
}

export default OrderBodyComponent