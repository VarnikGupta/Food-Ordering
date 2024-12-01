import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import css from "./ReviewsComponent.module.css";

import RateYourExperienceCard from "../../../../utils/RateYourExperienceCard/RateYourExperienceCard";
import RestUserReviewedCard from "../../../../utils/RestaurantUtils/RestUserReviewedCard/RestUserReviewedCard";

import profilepic from "../../../../utils/images/profilepic.jpg";

const ReviewsComponent = () => {
  const [reviewsData, setReviewsData] = useState([]);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/reviews?restId=${id}`);
        if (response.status === 200 && response.data.reviews) {
          setReviewsData(response.data.reviews);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError("User or Restaurant not found");
        } else {
          setError("Failed to fetch reviews");
        }
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  return (
    <div className={css.outerDiv}>
      <div className={css.innerDiv}>
        <div className={css.left}>
          {error && <div className={css.error}>{error}</div>}

          {reviewsData.length === 0 ? (
            <div className="empty-cart">
              <h1 className="heading">No Reviews yet</h1>
            </div>
          ) : (
            <div className={css.re}>
              {reviewsData.map((item, id) => (
                <RestUserReviewedCard key={id} data={item} />
              ))}
            </div>
          )}
        </div>
        <div className={css.right}>
          <RateYourExperienceCard />
        </div>
      </div>
    </div>
  );
};

export default ReviewsComponent;
