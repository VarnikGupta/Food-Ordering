import React, { useEffect, useState } from "react";
import Fooddata from "../../utils/SearchUtils/FoodData";
import "./Search.css";
import Form from "react-bootstrap/Form";
import Cards from "../../utils/SearchUtils/Cards";
import Set from "../../utils/SearchUtils/Set";
import reservations from "../../utils/images/icons/noreservations.png";
import axios from "axios";
import { createPortal } from 'react-dom';
import LoginFirstModel from "../../components/Model/LoginFirstModel"

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loginFirst, setloginFirst] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("Search to view results.");

  const [copydata, setCopyData] = useState([]);
  const loginUser = JSON.parse(localStorage.getItem("auth"));

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) {
      alert("enter something to search");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `http://localhost:5000/api/search?name=${searchQuery}`, {
          headers: {
            authorization: `Bearer ${loginUser.token}`
          }
        }
      );
      const result = response.data;

      if (result.searchItems && result.searchItems.length > 0) {
        console.log("items", result.searchItems);
        setCopyData(result.searchItems);
        setError(""); // Clear error message if results are found
      } else {
        setCopyData([]);
        setError("Oops! No data to show.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Oops! Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loginUser) {
      setloginFirst(true);
    }
    // document.title = "Checkout | Zomato Clone";
  }, [loginUser, loginFirst]);

  return (
    <>
      <Form
        className="d-flex justify-content-center align-items-center mt-3"
        onSubmit={handleSearch}
      >
        <Form.Group className=" mx-2 col-lg-4" controlId="formBasicEmail">
          <Form.Control
            type="text"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for restaurant or a dish"
          />
        </Form.Group>
        <button
          className="btn text-light col-lg-1"
          style={{ background: "#ed4c67" }}
          type="submit"
        >
          Submit
        </button>
      </Form>

      <section className="iteam_section mt-4 container">
        <div className="row mt-2 d-flex justify-content-around align-items-center">
          {copydata && copydata.length > 0 ? (
            <Cards data={copydata} />
          ) : (
            <div className="outerDiv">
              <div className="innerDiv">
                <div className="imgBox">
                  <img src={reservations} className="img" />
                  <div className="txt">{error}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      {loginFirst && createPortal(<LoginFirstModel setloginFirst={setloginFirst} />, document.getElementById("portal"))}

    </>
  );
};

export default Search;
