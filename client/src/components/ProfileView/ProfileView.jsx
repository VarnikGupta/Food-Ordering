import React from "react";
import styled from "styled-components";
import { FaUserAlt } from 'react-icons/fa';

const Wrapper = styled.div`
  * {
    font-family: Poppins;
  }
  .profile {
    position: relative;
    height: 250px;
    overflow: hidden;
    top: 100;
  }
  .profile-background {
    position: relative;
    width: 100%;
  }
  .profile-image {
    position: absolute;
    top: 70px;
    left: 60px;
    border-radius: 50%;
    border: 5px solid white;
    height: 150px;
  }
  .profile-text-div {
    position: absolute;
    height: 100px;
    top: 140px;
    left: 750px;
    color: white;
    padding: 8px;
    font-weight: 400;
    font-size: 20px;
  }
  .reviews {
    border-right: 1px solid white;
    margin-right: 5px;
    margin-left: 5px;
    padding: 8px;
  }
  .photos {
    border-right: 1px solid white;
    margin-right: 5px;
    padding: 8px;
  }
  .followers {
    margin-left: 5px;
    padding: 8px;
  }
  .profile-name {
    color: white;
    position: absolute;
    top: 105px;
    left: 230px;
    font-size: 2rem
  }
  .profile-location {
    color: white;
    position: absolute;
    top: 160px;
    left: 230px;
    font-size: 13px;
  }
`;

function ProfileView({ userDetails }) {
  const activeUserDetails = JSON.parse(localStorage.getItem("auth"));
  // const reviews = activeUserDetails.reviews || 0;
  // const photos = activeUserDetails.photos || 0;
  // const followers = activeUserDetails.followers || 0;

  const { name, phone} = userDetails;

  return (
    <>
      <Wrapper>
        <div className="container">
          <div className="profile">
            <img
              src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80"
              className="profile-background"
              alt="profile-background"
            />
            <img
              src="https://www.google.com/imgres?q=dummy%20profile%20icon&imgurl=https%3A%2F%2Fstatic.thenounproject.com%2Fpng%2F630729-200.png&imgrefurl=https%3A%2F%2Fthenounproject.com%2Fbrowse%2Ficons%2Fterm%2Fios-profile-icon%2F&docid=ypQf09sj6l7lOM&tbnid=HvOxp4UOZb9O5M&vet=12ahUKEwiDh86KgvyJAxVkT2wGHS9FFdIQM3oECC8QAA..i&w=200&h=200&hcb=2&ved=2ahUKEwiDh86KgvyJAxVkT2wGHS9FFdIQM3oECC8QAA"
              className="profile-image"
              alt="profile-pic"
            />
            <p className="profile-name">{activeUserDetails.name}</p>
            {/* <p className="profile-location">{activeUserDetails.location}</p> */}
            (phone & <div className="profile-text-div d-flex">
              <div className="reviews" style={{ textAlign: "center" }}>
                contact<p>{phone}</p>
              </div>
            </div>)
          </div>
        </div>
      </Wrapper>
    </>
  );
}

export default ProfileView;
