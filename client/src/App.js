import "./App.css";
import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "protected-route-react";
import Home from './pages/Home/Home';
import Restaurant from './pages/Restaurant/Restaurant';
// import NotFound from './pages/NotFound/NotFound';
import Cart from './pages/Cart/Cart';
import axios from "axios";
import ProfilePage from "./pages/User/User";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("auth") !== null
  );
  const [filterType, setFilterType] = useState("");

  return (
    <div className="App">
      <Routes>
        {/* <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}> */}
        <Route path={"/"} element={<Home />} />
        <Route path={"/user/:id"} element={<ProfilePage />} />
        <Route path={'/checkout'} element={<Cart />} />
        <Route path={'/kolkata/:restaurant/order/:id'} element={<Restaurant />} />
        {/* </Route> */}

        {/* <Route path={'/'} element={<Home filterType={filterType} setFilterType={setFilterType} />} />
        <Route path={'/kolkata'} element={<Home filterType={filterType} setFilterType={setFilterType} />} />
        <Route path={'*'} element={<NotFound />} /> */}
      </Routes>
    </div>
  );
}

export default App;
