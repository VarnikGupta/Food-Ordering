import './Cart.scss';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CartItem from '../../components/CartItem/CartItem';
import GenerateImage from '../../components/GenerateImage/GenerateImage';
import emptyCart from '../../utils/images/emptyCart.webp';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../components/Redux/CartItemSlice';
import { createPortal } from 'react-dom';
import OrderModel from '../../components/Model/OrderModel';
import LoginFirstModel from '../../components/Model/LoginFirstModel';
import axios from 'axios';

const Cart = () => {
    const [cartItems, setCartItems] = useState([ 
        {dishName: 'roll abc', quantity: 5, price: 1040, restId: '1004', restName: 'Vaishno Dhaba'},
        {dishName: 'roll', quantity: 5, price: 1040, restId: '1004', restName: 'Vaishno Dhaba'}
        ]);
    const [isLoading, setIsLoading] = useState(true);
    const [displayProtal, setDisplayProtal] = useState(false);
    const [loginFirst, setloginFirst] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const loginUser = JSON.parse(localStorage.getItem("auth"));


    const itemHandler = async (item,action) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/users/${loginUser._id}/cart`, {
                action: action,
                item: {
                    dishName: item.dishName,
                    quantity: 1,
                    price: item.price,
                    restId: item.restId,
                    restName: item.restName,
                },
            }, {
                headers: {
                    Authorization: `Bearer ${loginUser.token}`,
                },
            });

            if (response.status === 200) {
                // console.log(response.data.message);
                fetchCartItems(loginUser._id); 
            }
        } catch (err) {
            // console.log(err)
            console.error("Failed to add item:", err.response?.data?.message || err.message);
        }
    };

    const calculateTotalAmount = () => {
        return Object.keys(cartItems).reduce((total, item) => {
            total += cartItems[item].price * cartItems[item].quantity;
            return parseFloat(total.toFixed(2));
        }, 0);
    };

    const fetchCartItems = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/users/${userId}/cart`, {
                headers: {
                    Authorization: `Bearer ${loginUser.token}`
                }
            });
            // console.log(response)
            setCartItems(response.data.cartItems || []);
        } catch (err) {
            console.log(err)
            if (err.response?.status === 401) {
                setloginFirst(true);
            } else if (err.response?.status === 404) {
                setError('User not found');
            } else {
                setError('An unexpected error occurred. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const orderHandler = async () => {
        if (!loginUser) {
            setloginFirst(true);
            return;
        }

        const totalAmount = calculateTotalAmount();
        const restaurantId = cartItems[Object.keys(cartItems)[0]].restId; // Assuming all items are from one restaurant
        const restaurantName = cartItems[Object.keys(cartItems)[0]].restName;

        try {
            const response = await axios.post(
                'http://localhost:5000/api/orders',
                {
                    userId: loginUser._id,
                    amount: totalAmount,
                    restId: restaurantId,
                    restName: restaurantName,
                    items: Object.values(cartItems).map((item) => ({
                        dishName: item.dishName,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    // deliveryAddress: ,
                },
                {
                    headers: {
                        Authorization: `Bearer ${loginUser.token}`,
                    },
                }
            );

            if (response.status === 201) {
                // console.log(response.data.message);
                setDisplayProtal(true); // Show order success modal
            }
        } catch (err) {
            // console.log(err)
            console.error("Failed to place order:", err.response?.data?.message || err.message);
        }
    };

    useEffect(() => {
        // console.log(loginUser)
        if (loginUser) {
            fetchCartItems(loginUser._id);
        } else{
            setloginFirst(true);
            // console.log(loginFirst)
        }
        // window.scrollTo(0, 0);
        // document.title = "Checkout | Zomato Clone"
    }, [loginUser, loginFirst])

    return (
        <div className='cart-page'>
            <div className='cart-details'>
                {
                    Object.keys(cartItems).length ?
                        <>
                            <div className='buttons'>
                                {/* <button className='clear-cart' onClick={clearCart()}>CLEAR CART</button> */}
                            </div>

                            <div className='cart-items'>
                                {
                                    Object.keys(cartItems).map((key) => {
                                        return <CartItem key={cartItems[key].dishName} item={cartItems[key]} itemHandler={(item, action) => itemHandler(item, action)} />
                                    })
                                }
                            </div>

                            <div className='total-container'>
                                <div className='total'>
                                    <div className='text'>Total Amount</div>
                                    <div className='amount'>₹{calculateTotalAmount()}
                                    </div>
                                </div>
                                <hr className='divider' />
                            </div>

                            <div className='buttons'>
                                <button className='order' onClick={orderHandler}>ORDER</button>
                            </div>
                            {displayProtal && createPortal(<OrderModel setDisplayProtal={setDisplayProtal} />, document.getElementById("portal"))}
                            {loginFirst && createPortal(<LoginFirstModel setloginFirst={setloginFirst} />, document.getElementById("portal"))}
                        </>
                        :
                        <div className='empty-cart'>
                            <div className='empty-cart-image'><GenerateImage url={emptyCart} alt={"Empty cart"} /></div>
                            <h1 className='heading'>Your cart is empty</h1>
                            <p className='text'>You can go to home page to view more restaurants</p>
                            <button className='go-to-home' onClick={() => navigate('/search')}>Explore More</button>
                        </div>
                }
            </div>
        </div>
    )
}

export default Cart;