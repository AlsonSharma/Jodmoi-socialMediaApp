

/*
* STEPS FOR STATE MANAGEMENT
* Submit Action
* Handle action in it's reducer
* Register Here -> Reducer
*/

import authReducer from "./reducer/authReducer";
import postReducer from "./reducer/postReducer";

const { configureStore } = require("@reduxjs/toolkit");

export const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postReducer,
    }
})

