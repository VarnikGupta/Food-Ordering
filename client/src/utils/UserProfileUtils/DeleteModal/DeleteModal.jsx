import { useState } from "react";
import { createPortal } from "react-dom";

import axios from "axios";
import { BsExclamationLg } from "react-icons/bs";
import { useParams, useNavigate } from "react-router-dom";

import css from "./DeleteModal.scss";
import closeBtn from "../../images/closeBtn.jpg";

const DeleteModal = ({ setloginFirst }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const loginUser = JSON.parse(localStorage.getItem("auth"));

  const [error, setError] = useState("");

  const handleClick = () => {
    axios
      .delete(`http://localhost:5000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${loginUser.token}`,
        },
      })
      .then((response) => {
        localStorage.removeItem("auth");
        navigate("/");
        setloginFirst(false);
        window.location.reload(); // Close the modal after success
      })
      .catch((error) => {
        if (error.response?.status === 400 && error.response?.data?.message === "Active orders prevent user deletion") {
          setError("You have active orders. Account cannot be deleted.");
        } else {
          console.error("Delete Failed:", error.response?.data || error.message);
        }
      });
  };

  const cancelUpdate = () => {
    setloginFirst(false); // Close modal on cancel
  };

  const domObj = (
    <div className="model" onClick={() => setloginFirst(false)}>
      <div className="message" onClick={(e) => e.stopPropagation()}>
        <div className="exclamation">
          <BsExclamationLg />
        </div>
        <h2 className="heading">
          {error ? error : "Account will be deleted!"}
        </h2>
        <div className="btns">
          {!error && (
            <button className="cancel" onClick={() => handleClick()}>
              Ok
            </button>
          )}
          <button className="cancel" onClick={() => cancelUpdate()}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(domObj, document.getElementById("portal"));
};

export default DeleteModal;
