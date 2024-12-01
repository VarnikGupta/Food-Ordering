import './CartItem.scss';
import React from 'react';
import { useDispatch } from 'react-redux';
import GenerateImage from '../GenerateImage/GenerateImage';
import wowMomo from "../../utils/images/orderType/delivery.png"

const CartItem = ({ item, itemHandler }) => {
    const dispatch = useDispatch();

    const addItemsHandler = (e) => {
        itemHandler(item,"add")
    }
    const removeItemsHandler = (e) => {
        itemHandler(item,"remove")
    }

    return (
        <div className='cart-item' id={item.id}>
            <div className='image-name'>
                {<div className='cart-item-image'> <img src={ wowMomo} /> </div>}
                <div className='cart-item-name'>{item.dishName}@ {item.restName}</div>
            </div>

            <div className='buttons-price'>
                <div className='cart-item-buttons'>
                    <button className='minus-button' id={item.key} onClick={removeItemsHandler}>-</button>
                    <span className='count'>{item.quantity}</span>
                    <button className='plus-button' id={item.key} onClick={addItemsHandler}>+</button>
                </div>
                <div className='cart-item-price'>₹{item.price * item.quantity}</div>
            </div>
        </div>
    )
}

export default CartItem;