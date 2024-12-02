import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import css from "./Orders.module.css";
import axios from "axios";

const AdminOrdersPage = () => {
  const location = useLocation();
  const { restId } = location.state || {};
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loginUser = JSON.parse(localStorage.getItem("auth"));

  const handleStatusChange = async (order, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/orders/userId/${order.userId}/orderId/${order.orderId}`,
        { status: newStatus },
        {
          headers: {
            authorization: `Bearer ${loginUser.token}`,
          },
        }
      );
      setOrderHistory((prevOrders) =>
        prevOrders.map((orders) =>
          orders.orderId === order.orderId ? { ...orders, status: newStatus } : orders
        )
      );
    } catch (err) {
      console.error("Failed to update order status", err);
      setError("Failed to update order status");
    }
  };

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/orders/order-history?restId=${restId}`,
          {
            headers: {
              authorization: `Bearer ${loginUser.token}`,
            },
          }
        );
        if (response.data && response.data.orderHistory) {
          setOrderHistory(response.data.orderHistory);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch order history");
        console.error(err);
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [restId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={css.outermost}>
      {orderHistory.map((order) => (
        <div key={order.orderId} className={css.outerDiv}>
          <div className={css.innerDiv}>
            <div className={css.sec1}>
              <div className={css.leftBox}>
                <div className={css.imgBox}></div>
                <div className={css.txtBox1}>
                  <div className={css.title}>Order ID: {order.orderId}</div>
                  <div className={css.title}>User ID: {order.userId}</div>
                  <div className={css.contact}>
                    {/* Contact: {restaurant.contact} */}
                  </div>
                </div>
              </div>
              <div className={css.rightBox}>
                <span className={css.delTxt}>
                  Total Amount: ${order.totalAmount}
                </span>
                <div>
                  <label>Status: </label>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order, e.target.value)
                    }
                  >
                    <option value="Cancelled">Cancelled</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <span className={css.ratingCount}></span>
              </div>
            </div>
            <div className={css.sec}>
              <h4>Items:</h4>
              <ul>
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.dishName} - Quantity: {item.quantity}, Price: $
                    {item.price}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminOrdersPage;
