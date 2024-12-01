import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth")) : null
}

export const LoginUserSlice = createSlice({
    name: "login_user",
    initialState,
    reducers: {
        login: (state, action) => {
            state.user = action.payload
            localStorage.setItem("auth", JSON.stringify(state.user));
        },

        logout: (state) => {
            state.user = null;
            localStorage.removeItem("auth");
        }
    }
})

export const { login, logout } = LoginUserSlice.actions;
export default LoginUserSlice.reducer;