import User from "../models/user.modal.js";
import Profile from "../models/profile.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";
import bcrypt from "bcrypt";
export const activeCheck = async(req, res) => {
    return res.status(200).json({message: "RUNNING"});
}   


export const createPost = async(req, res) => {
    const {token} = req.body;

    try {
        const user = await User.findOne({token: token});
        if(!user) {
            return res.status(404).json({message: "User doesn't exist"});
        }

        const post = new Post({
            userId: user._id,
            body: req.body.body,
            media: req.file !== undefined ? req.file.filename: "",
            filetypes: req.file !== undefined ? req.file.mimetype.split("/"): ""
        })

        await post.save();
        return res.status(200).json({message: "Post created successfully"});

    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export const getAllPosts = async(req, res) => {
    try {
        const posts = await Post.find().populate("userId", "name username email profilePicture");
        return res.json({posts});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export const deletePost = async(req, res) => {
    const {token, post_id} = req.body;

    try {
        const user = await User.findOne({token: token}).select("_id");

        if(!user) {
            return res.status(404).json({message: "User doesn't exist"});
        }

        const post = await Post.findOne({_id: post_id});

        if(!post) {
            return res.status(404).json({message: "Post doesn't exist"});
        }

        if(post.userId.toString() !== user._id.toString()) {
            return res.status(401).json({message: "Unauthorized"});
        }

        await Post.deleteOne({_id: post_id});

        return res.status(200).json({message: "Post deleted successfully"});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export const getCommentsByPost = async(req, res) => {
    const {post_id} = req.query;

    try {
        const post = await Post.findOne({_id: post_id});

        if(!post) {
            return res.status(404).json({message: "Post doesn't exist"});
        }
        const comments = await Comment.find({postId: post_id}).populate("userId", "username name");
        return res.json(comments.reverse());
    }catch(error) {
        return res.status(500).json({message: error.message});
    }
}

export const deleteCommentOfUser = async(req, res) => {
    const {token, comment_id} = req.body;

    try {
        const user = await User.findOne({token: token}).select("_id");

        if(!user) {
            return res.status(404).json({message: "User doesn't exist"});
        }
        const comment = await Comment.findOne({ "_id": comment_id})

        if(!comment) {
            return res.status(404).json({message: "Comment doesn't exist"});
        }

        if(comment.userId.toString() !== user._id.toString()) {
            return res.status(401).json({message: "Unauthorized"});
        }

        await Comment.deleteComment({_id: comment_id});

        return res.status(200).json({message: "Comment deleted successfully"});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export const countLikes = async(req, res) => {
    const {post_id} = req.body;

    try {
        const post = await Post.findOne({_id: post_id});


        if(!post) {
            return res.status(404).json({message: "Post doesn't exist"});
        }

        post.likes += 1;
        await post.save();
        return res.json({message: "Like added successfully"});
        
    } catch (error) {
        return res.status(500).json({message: error.message});
    }

}