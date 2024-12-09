import { useState, useEffect } from "react";

import css from "./MyAddresses.module.css";

import AddressCard from "../../../../AddressCard/AddressCard";
import AddAddressCard from "../../../../AddressCard/AddAddressCard";
import UserProfileNoData from "../../UserProfileNoData/UserProfileNoData";

import AddAddressPortal from "../../../../AddAddressPortal/AddAddressPortal";
import { useParams } from "react-router-dom";
import axios from "axios";

const MyAddresses = ({ hashId }) => {
  let [isData, setIsData] = useState();
  let [addressModal, setAddressModal] = useState(false);
  const loginUser = JSON.parse(localStorage.getItem("auth"));
  const { id } = useParams();

  useEffect(() => {
    if (!id) {
      alert("User not authenticated");
      return;
    }

    // Fetch user data from API
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/users/${id}`,
          {
            headers: {
              authorization: `Bearer ${loginUser.token}`,
            },
          }
        );
        console.log(response);

        if (response.status === 200 && response.data.user.address.length > 0) {
          setIsData(response.data.user.address);
        }
        console.log(response.data.user.address);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          alert("Unauthorized access. Please log in.");
        } else if (err.response?.status === 404) {
          alert("User not found.");
        } else {
          alert("An unexpected error occurred.");
        }
      }
    };

    fetchUserData();
  }, [id]);

  return (
    <div className={css.outerDiv}>
      {isData ? (
        <>
          {isData?.map((val) => {
            return (
              <AddressCard
                title={val?.street}
                address={val}
                key={val?.street}
                />
            );
          })}
        </>
      ) : (<></>
        // <UserProfileNoData hashId={hashId} />
      )}
      <AddAddressCard setAddressModal={setAddressModal} />
      {addressModal ? (
        <AddAddressPortal setAddressModal={setAddressModal} />
      ) : (
        ""
      )}
    </div>
  );
};

export default MyAddresses;
