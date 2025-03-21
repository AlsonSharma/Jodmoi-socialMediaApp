import mongoose from "mongoose";

const followerRequest = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    status_accepted: {
        type: Boolean,
        default: null,
    }
});

const FollowerRequest = mongoose.model("FollowerRequest", followerRequest);

export default FollowerRequest;