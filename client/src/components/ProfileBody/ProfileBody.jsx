import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import Modal from "@material-ui/core/Modal";
// import { Wrapper } from "../Style/ProfileBodyStyle";
import Axios from "axios";
import styled from "styled-components";

const Wrapper = styled.div`
  .order-div {
    margin-bottom: 1rem;
  }

  .order-text {
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.15rem;
    margin: 0px;
    font-weight: 500;
    color: rgb(105, 105, 105);
  }
  .order-id {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: 500;
    margin: 0px;
    font-size: 0.8rem;
  }
`;

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    height: 600,
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    width: 250,
    minWidth: 250,
  },
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
  },
}));

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

export default function ProfileBody({userDetails}) {
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const [userBackendDetails, setUserBackendDetails] = useState([]);
  const activeUserDetails = JSON.parse(localStorage.getItem("auth"));
  const [orderDetails, setOrderDetails] = useState([]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(false);

  const handleOpen = (orderId) => {
    let orderDetailsWithId = userBackendDetails.orders.filter(
      (item) => item.orderId === orderId
    );
    setOrderDetails(orderDetailsWithId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getTotalAmount = (item) => {
    if (item !== false) {
      let totalValue = item.totalOrder.reduce((a, c) => {
        let itemCost1 = c.cost === undefined ? 0 : Number(c.cost);
        return a + itemCost1;
      }, 0);
      return totalValue;
    }
  };

  const getTransactionDate = (timeStamp) => {
    if (timeStamp !== false) {
      let transactionTimestamp = timeStamp.split("T");
      let date = new Date(`${transactionTimestamp[0]}`).toLocaleDateString();
      let time = new Date(`${timeStamp}`).toLocaleTimeString();
      return `${date} at ${time}`;
    }
  };

  return (
    <>
      <Wrapper>
        <div className="container mt-5">
          {/* <p className="ml-5">ACTIVITY</p> */}
          <div className={classes.root}>
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={value}
              onChange={handleChange}
              className={classes.tabs}
            >
              <Tab label="Reviews" {...a11yProps(0)} />
              <Tab label="Order History" {...a11yProps(1)} />
              <Tab label="Favourite Orders" {...a11yProps(2)} />
              <Tab label="Addresses" {...a11yProps(3)} />
            </Tabs>
            <TabPanel value={value} index={0}>
              <h3>Reviews</h3>
              <img
                src="https://i.pinimg.com/originals/ac/03/a3/ac03a320e12ca1517d0543ff11300f6c.png"
                alt="dine"
                style={{
                  height: "150px",
                  display: "block",
                  marginLeft: "200px",
                  marginRight: "200px",
                  marginTop: "90px",
                }}
              />
              <p
                style={{
                  marginLeft: "200px",
                  marginRight: "180px",
                  fontSize: "22px",
                }}
              >
                Nothing here yet
              </p>
            </TabPanel>
            <TabPanel value={value} index={1}>
              <h3>Photos</h3>
              <img
                src="https://b.zmtcdn.com/webFrontend/1a33af2333871e0c1222a3ee21ea697f1581070577.png"
                alt="dine"
                style={{
                  height: "150px",
                  display: "block",
                  marginLeft: "300px",
                  marginRight: "300px",
                  marginTop: "90px",
                }}
              />
              <p
                style={{
                  marginLeft: "300px",
                  marginRight: "300px",
                  fontSize: "22px",
                }}
              >
                Nothing here yet
              </p>
            </TabPanel>
            <TabPanel value={value} index={2}>
              <h3>Followers</h3>
              <div className="d-flex">
                <button type="button" className="btn btn-outline-danger">
                  Following(0)
                </button>
                <button type="button" className="btn btn-danger ml-3">
                  Followers(0)
                </button>
              </div>
              <img
                src="https://b.zmtcdn.com/webFrontend/c33e5cd0b755a03f9b2f374b1b8271a91581004801.png"
                alt="dine"
                style={{
                  height: "150px",
                  display: "block",
                  marginLeft: "300px",
                  marginRight: "300px",
                  marginTop: "90px",
                }}
              />
              <div
                style={{
                  marginLeft: "300px",
                  marginRight: "300px",
                }}
              >
                You are not followed by any users yet.
              </div>
            </TabPanel>
            <TabPanel value={value} index={3}>
              <h3>Bookmarks</h3>

              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQbLNIqX--pZPiXZVl3WXp7W9AlM2ETiYrclA&usqp=CAU"
                alt="dine"
                style={{
                  height: "150px",
                  display: "block",
                  marginLeft: "200px",
                  marginRight: "200px",
                  marginTop: "90px",
                }}
              />
              <p
                style={{
                  marginLeft: "300px",
                  marginRight: "300px",
                }}
              >
                No Bookmarks yet
              </p>
            </TabPanel>
          </div>
        </div>
      </Wrapper>
    </>
  );
}
