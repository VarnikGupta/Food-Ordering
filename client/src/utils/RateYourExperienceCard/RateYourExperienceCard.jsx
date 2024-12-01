import { useState } from "react";
import { Formik, Form } from "formik";
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import LoginFirstModel from '../../components/Model/LoginFirstModel'
import axios from 'axios'


import css from "./RateYourExperienceCard.module.css";

// import RadioBtn from "../../../FormUtils/RadioUtil/RadioUtil";
import RatingNumberBox from '../../utils/RestaurantUtils/RatingNumberBox/RatingNumberBox'

const RateYourExperienceCard = () => {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [loginFirst, setloginFirst] = useState(false);

  const [quots] = useState([
    "",
    "Horrible",
    "Bad",
    "Average",
    "Good",
    "Excellent",
  ]);
  const loginUser = JSON.parse(localStorage.getItem("auth"));
  const { id } = useParams();


  const submitReview = async () => {
    if (!loginUser) {
      setloginFirst(true)
      return;
    } 
    const payload = {
      restId: id, 
      userId: loginUser._id, 
      rating: stars,
      userName: loginUser.name, 
      restName: "Dominos", 
      feedback: comment,
    };
    try {
      console.log(payload);
      const response = await axios.post("http://localhost:5000/api/reviews", payload, {
        headers: {
          Authorization: `Bearer ${loginUser.token}`, 
          "Content-Type": "application/json",
        },
      });
      console.log("api response is", response);

      if (response.status === 201) {
        alert(response.data.message || "Review submitted successfully!");
        setStars(0);
        setComment("")
      }
    } catch (error) {
      if (error.response) {
        console.log(error)
        // Handle HTTP errors
        if (error.response.status === 422) {
          alert("Missing fields in the review. Please fill all details.");
        } else if (error.response.status === 401) {
          alert("Unauthorized access. Please log in.");
          setloginFirst(true);
        } else if (error.response.status === 404) {
          alert("Restaurant or user not found.");
        } else {
          alert("An unexpected error occurred. Please try again.");
        }
      } else {
        // Handle other errors (e.g., network issues)
        console.error("Error submitting review:", error);
        alert("Failed to submit review. Please try again later.");
      }
    }
  };


  return (
    <div className={css.outerDiv}>
      <div className={css.innerDiv}>
        <div className={css.ttl}>Rate your experience for</div>
        <div className={css.radioOptns}>
          <Formik>
            <Form className={css.form}>
            </Form>
          </Formik>
        </div>
        <div className={css.ratingBox}>
            <RatingNumberBox stars={stars} txt="1" iconR={stars > 1} isActive={stars >= 1} onClick={() => setStars(1)} />
            <RatingNumberBox stars={stars} txt="2" iconR={stars > 2} isActive={stars >= 2} onClick={() => setStars(2)} />
            <RatingNumberBox stars={stars} txt="3" iconR={stars > 3} isActive={stars >= 3} onClick={() => setStars(3)} />
            <RatingNumberBox stars={stars} txt="4" iconR={stars > 4} isActive={stars >= 4} onClick={() => setStars(4)} />
            <RatingNumberBox stars={stars} txt="5" iconR={stars > 5} isActive={stars >= 5} onClick={() => setStars(5)} />
            <div className={css.ratingTxt}>{quots[stars]}</div>
        </div>
        <div className={css.commentBox}>
          <div className={css.inputBox}>
            <input
              type="text"
              className={css.inptTxtBox}
              placeholder="Write your comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
        <div className={css.modalTxt} onClick={submitReview}>
          Submit review
        </div>
      </div>
      {loginFirst && createPortal(<LoginFirstModel setloginFirst={setloginFirst} />, document.getElementById("portal"))}
    </div>
  );
};

export default RateYourExperienceCard;
