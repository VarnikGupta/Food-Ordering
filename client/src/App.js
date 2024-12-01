import "./App.css";
import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "protected-route-react";
import Home from './pages/Home/Home';
import Restaurant from './pages/Restaurant/Restaurant';
import NotFound from './pages/NotFound/NotFound';
import Cart from './pages/Cart/Cart';
import axios from "axios";
import ProfilePage from "./pages/User/User";
import RestaurantPage from "./pages/RestaurantPage/RestaurantPage";
import Search from "./pages/Search/Search";
import Admin from "./pages/Admin/Admin";
import AdminDashBoard from "./pages/AdminDashBoard/AdminDashBoard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("auth") !== null
  );
  return (
    <div className="App">
      <Routes>
        <Route path={"/"} element={<Home />} />
        <Route path={"/user/:id/:hashId"} element={<ProfilePage />} />
        <Route path={'/checkout'} element={<Cart />} />
        <Route path={'/restaurant/:id/:page'} element={<RestaurantPage />} />
        <Route path={'/search'} element={<Search />} />
        <Route path={'/admin'} element={<Admin />} />
        <Route path={'/admin/dashboard'} element={<AdminDashBoard />} />
        <Route path={'*'} element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
