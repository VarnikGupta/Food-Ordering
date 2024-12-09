import { useState, useEffect } from "react";
import axios from "axios";
import css from "./UserHero.module.css";

import HeroBanner from "../../images/profilebanner.jpg";
import user from "../../images/food1.jpg";
import edit from "../../images/food1.jpg";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import EditProfileModal from "../EditProfileModal/EditProfileModal";
import DeleteModal from "../DeleteModal/DeleteModal";

const UserHero = () => {
  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [userData, setUserData] = useState(null); 
  const [error, setError] = useState(null); 

  const loginUser = JSON.parse(localStorage.getItem("auth"));
  const { id } = useParams(); 

  useEffect(() => {
    if (!id) {
      setError("User not authenticated");
      return;
    }

    // Fetch user data from API
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/users/${id}`,
          {
            headers: {
              Authorization: `Bearer ${loginUser.token}`,
            },
          }
        );

        if (response.status === 200) {
          setUserData(response.data);
        }
        console.log(response.data);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          setError("Unauthorized access. Please log in.");
        } else if (err.response?.status === 404) {
          setError("User not found.");
        } else {
          setError("An unexpected error occurred.");
        }
      }
    };

    fetchUserData();
  }, [id]);

  if (error) {
    return <div className={css.error}>{error}</div>;
  }

  return (
    <>
      <div className={css.outerDiv}>
        <div className={css.innerDiv}>
          <div className={css.imgSec}>
            <img
              className={css.bannerImg}
              src={HeroBanner}
              alt="User Hero Section Image"
            />
          </div>
          <div className={css.txtBox}>
            <div className={css.leftBox}>
              <div className={css.profileImgBox}>
                <img className={css.profileImg} src={user} alt="user image" />
              </div>
              <div className={css.profileDetails}>
                <div className={css.name}>
                  {userData ? userData.user.name : "Loading..."}
                </div>
                {/* <div className={css.phone}>{userData ? userData.user.phone : 'Loading...'}</div> */}
              </div>
            </div>
            <div className={css.rightBox}>
              <div
                className={css.editBtn}
                onClick={() => setModal((val) => !val)}
              >
                <span className={css.editProfileIconBox}>
                  {/* <img src={edit} alt="edit icon" className={css.editProfileIcon} /> */}
                </span>
                Edit Profile
              </div>
              <div className={css.rightBoxInner}>
                <div
                  className={css.editBtn}
                  onClick={() => setDeleteModal((val) => !val)}
                >
                  <span className={css.editProfileIconBox}>
                    {/* <img src={edit} alt="edit icon" className={css.editProfileIcon} /> */}
                  </span>
                  Delete Profile
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {modal &&
        createPortal(
          <EditProfileModal setModal={setModal} />,
          document.getElementById("portal")
        )}
      {deleteModal &&
        createPortal(
          <DeleteModal setloginFirst={setDeleteModal} />,
          document.getElementById("portal")
        )}
    </>
  );
};

export default UserHero;
