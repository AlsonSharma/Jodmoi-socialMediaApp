import { getAboutUser, getAllUsers, getConnectionsRequest, getMyConnectionRequests, loginUser, registerUser } from "../../action/authAction";

const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
    user: undefined,
    isError: false,
    isSuccess: false,
    isLoading: false,
    LoggedIn: false,
    message: "",
    isTokenAvailable: false,
    profileFetched: false,
    connections: [],
    connectionRequest: [],
    all_users:[],
    all_profiles_fetched: false
}

const authSlice = createSlice({
     name: "auth",
     initialState,
     reducers: {
        reset:() => initialState,
        handleLoginUser: (state) => {
            state.message = "hello"
        },
        emptyMessage: (state) => {
            state.message = ""
        },
        setIsTokenAvailable: (state) => {
            state.isTokenAvailable = true
        },
        setIsTokenUnavailable: (state)=> {
            state.isTokenAvailable = false
        }
     },
     extraReducers: (builder) => (
        builder
        .addCase(loginUser.pending, (state) => {
            state.isLoading = true
            state.message = "Logging you in..."
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false
            state.isError = false
            state.isSuccess = true
          //  state.user = action.payload
            state.LoggedIn = true
            state.message = "Logged in successfully"
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false
            state.isError = true
            state.isSuccess = false
            state.message = action.payload
        })
        .addCase(registerUser.pending, (state) => {
            state.isLoading = true
            state.message = "Registering you..."
        })
        .addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false
            state.isError = false
            state.isSuccess = true
            state.message = {
                message: "Registered successfully, Please login to continue"
            }
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false
            state.isError = true
            state.isSuccess = false
            state.message = action.payload
        })
        .addCase(getAboutUser.fulfilled, (state, action) => {
            state.isLoading = false
            state.isError = false
            state.profileFetched = true
            state.user = action.payload;
        })
        .addCase(getAllUsers.fulfilled, (state,action) => {
            state.isLoading = false
            state.isError = false
            state.all_profiles_fetched = true
            state.all_users = action.payload.profiles
        })
        .addCase(getConnectionsRequest.fulfilled, (state, action) => {
            state.connections = action.payload
        })
        .addCase(getConnectionsRequest.rejected, (state, action) => {
            state.message = action.payload
        })
        .addCase(getMyConnectionRequests.fulfilled, (state, action) => {
            state.connectionRequest = action.payload
        })
        .addCase(getMyConnectionRequests.rejected, (state, action) => {
            state.message = action.payload
        })
     )
})

export const { reset, emptyMessage, setIsTokenAvailable, setIsTokenUnavailable } = authSlice.actions
export default authSlice.reducer;