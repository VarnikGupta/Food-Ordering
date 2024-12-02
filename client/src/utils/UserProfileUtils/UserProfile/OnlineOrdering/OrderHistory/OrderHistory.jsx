import { useState, useEffect } from "react";
import css from "./OrderHistory.module.css";
import { createPortal } from "react-dom";
import orderonlineImg from "../../../../images/orderonline.jpg";
import OrderHistoryCard from "../../../../OrderHistoryCard/OrderHistoryCard";
import UserProfileNoData from "../../../../UserProfileNoData/UserProfileNoData";
import OrderDetails from "../../../../OrderDetailsModal/OrderDetails";
import Pagination from "../../../../Pagination/Pagination";
import axios from "axios";
import { useParams } from "react-router-dom";

const OrderHistory = ({ hashId }) => {
  let [viewDet, setViewDet] = useState(false);
  let [orderId, setOrderId] = useState();
  const [data, setData] = useState([]);
  const [isData, setIsData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loginUser = JSON.parse(localStorage.getItem("auth"));
  const { id } = useParams();
  const userId = id;
  const pageSize = 6;

  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const fetchOrderHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/orders/order-history?userId=${userId}`,
        {
          headers: {
            authorization: `Bearer ${loginUser.token}`,
          },
        }
      );
      if (response.status === 200 && response.data.orderHistory.length > 0) {
        setData(
          response.data.orderHistory.map((order) => ({
            id: order.orderId,
            imgSrc: orderonlineImg, // Placeholder image for now
            name: order.restName,
            // address: order.address, // Adjust if provided in the response
            orderNum: order.orderId,
            items: order.items.map((item) => ({
              itemName: item.dishName,
              qty: item.quantity,
            })),
            isFavourite: order.isFavourite,
            status: order.status,
            orderedOn: new Date(order.createdAt * 1000).toLocaleString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }
            ),
            itemTotal: order.totalAmount,
            coupon: null, // Adjust if coupon details are provided
            taxesandcharges: "Not available", // Adjust if tax details are provided
            totalSavings: "Not available", // Adjust if savings are calculated
            grandTotal: order.totalAmount,
            paymentType: "Not available", // Adjust if payment type is provided
            orderStatus: "Delivered", // Adjust if status is provided
            phoneNum: "Not available", // Adjust if phone details are provided
            deliveredTo: "Not available", // Adjust if address is provided
            fssaiNo: "Not available", // Adjust if applicable
            fav: false,
            summaryLinkId: "#",
          }))
        );
      } else {
        setIsData(false);
      }
    } catch (err) {
      console.log(err);
      console.error(err);
      if (err.response?.status === 401) {
        setError("Unauthorized access. Please log in.");
      } else if (err.response?.status === 404) {
        setError("User or orders not found.");
      } else {
        setError("An unexpected error occurred.");
      }
      setIsData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  return (
    <div className={css.outerDiv}>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className={css.error}>{error}</p>
      ) : paginatedData.length > 0 ? (
        <>
          <div className={css.innerDiv}>
            {paginatedData.map((item) => {
              return (
                <OrderHistoryCard
                  udata={item}
                  key={item?.id}
                  setViewDet={setViewDet}
                  setOrderId={setOrderId}
                  viewDet={viewDet}
                />
              );
            })}
          </div>
          <Pagination
            totalItems={data.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <UserProfileNoData hashId={hashId} />
      )}
    </div>
  );
};

export default OrderHistory;
