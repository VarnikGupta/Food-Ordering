import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import Axios from "axios";
import ProfileView from "../../components/ProfileView/ProfileView";
import ProfileBody from "../../components/ProfileBody/ProfileBody";

function ProfilePage() {
  const [userBackendDetails, setUserBackendDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to track errors
  const { id } = useParams(); // Get the `id` from the URL
  const activeUserDetails = JSON.parse(localStorage.getItem("auth"));

  useEffect(() => {
    if (activeUserDetails) {
      const getActiveUserDetails = async () => {
        try {
          const response = await Axios({
            method: "get",
            url: `http://localhost:5000/api/users/${id}`, // Use the `id` from the URL
            headers: {
              Authorization: `Bearer ${activeUserDetails.token}`,
              "Content-Type": "application/json",
            },
          });
          console.log(response.data)
          setUserBackendDetails(response.data.user);
        } catch (err) {
          if (err.response) {
            // Server responded with a status other than 2xx
            setError(
              err.response.data.message || "An error occurred while fetching user details."
            );
          } else if (err.request) {
            // Request was made but no response received
            setError("Failed to fetch user details. Please check your connection.");
          } else {
            // Something else went wrong
            setError("An unexpected error occurred. Please try again.");
          }
        } finally {
          setLoading(false);
        }
      };
      getActiveUserDetails();
    } else {
      setLoading(false);
      setError("User not logged in or inactive.");
    }
  }, [id, activeUserDetails]);

  if (!activeUserDetails || activeUserDetails.active === false) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>; // Display the error
  }

  if (!userBackendDetails) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <ProfileView userDetails={userBackendDetails} />
      <ProfileBody userDetails={userBackendDetails} />
    </div>
  );
}

export default ProfilePage;
