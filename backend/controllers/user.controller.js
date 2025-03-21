import User from "../models/user.modal.js";
import Profile from "../models/profile.model.js"
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import FollowerRequest from "../models/followers.model.js";
import Comment from "../models/comments.model.js";
import Post from "../models/posts.model.js";

const convertUserDataToPDF = async (userData) => {
    const doc = new PDFDocument();
    const outputPath = crypto.randomBytes(64).toString("hex") + ".pdf";
    const stream = fs.createWriteStream("uploads/" + outputPath);

    doc.pipe(stream);

    // Title
    doc.fontSize(18).text('User Profile', { align: 'center'});
    doc.moveDown();

    // Profile Section
    doc.rect(40, 60, 500, 180).stroke(); // Border
    doc.image(`uploads/${userData.userId.profilePicture}`, {
        align: 'left',
        width: 100,
        x: 50,
        y: 100
    });

    doc.font('Helvetica-Bold').fontSize(14).text('Name:', 200, 100);
    doc.font('Helvetica').text(userData.userId.name, 250, 100);

    doc.font('Helvetica-Bold').text('Email:', 200, 120);
    doc.font('Helvetica').text(userData.userId.email, 250, 120);

    doc.font('Helvetica-Bold').text('Username:', 200, 140);
    doc.font('Helvetica').text(userData.userId.username, 280, 140);

    doc.font('Helvetica-Bold').text('Bio:', 200, 160);
    doc.font('Helvetica').text(userData.bio, 250, 160);

    doc.font('Helvetica-Bold').text('Current Position:', 200, 180);
    doc.font('Helvetica').text(userData.currentPost, 320, 180);
    doc.moveDown();
    doc.moveDown();
    // Past Works Section

    const space = 30; // Space between sections
    let yPosition = 60 + 160 + space; // Starting Y position for the second rectangle
    
    // Draw the second rectangle
    doc.rect(40, yPosition, 500, 180).stroke(); // Border
    
    // Add a title for the "Past Works" section
    doc.fontSize(18).text('Past Works', 50, yPosition + 20, { align: 'center'});
    
    // Loop through past works and format them similarly to the Profile Section
    userData.pastWork.forEach((work, index) => {
        const startY = yPosition + 50 + index * 50; // Adjust Y position for each entry
    
        // Company Name
        doc.font('Helvetica-Bold').fontSize(14).text('Company Name:', 60, startY);
        doc.font('Helvetica').text(work.Company, 200, startY);
    
        // Position
        doc.font('Helvetica-Bold').fontSize(14).text('Position:', 60, startY + 20);
        doc.font('Helvetica').text(work.position, 200, startY + 20);
    
        // Years
        doc.font('Helvetica-Bold').fontSize(14).text('Years:', 60, startY + 40);
        doc.font('Helvetica').text(work.years, 200, startY + 40);
    });
    // Footer
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, 100, 30, {
        align: 'right'
    } );

    doc.end();
    return outputPath;
};

export const register = async(req, res) => {

    try {
        const {name, email, password, username} = req.body;

        if(!name || !email || !password || !username) {
            return res.status(400).json({message: "All fields are required"});
        }
        
        const user = await User.findOne({
            email
        });
        if(user){
            return res.status(400).json({message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword
        })

        await newUser.save();

        const profile = new Profile({ userId: newUser._id });
        await profile.save();

        return res.status(201).json({
            message: "User created successfully"
        })

    }catch(error) {
        return res.status(500).json({message: error.message});
    }
}
 
export const login = async(req, res) => { 
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }
        const user = await User.findOne({
            email
        });
        if(!user) {
            return res.status(404).json({message: "User doesn't exist"});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(400).json({message: "Invalid credentials"});
        }

        const token = crypto.randomBytes(64).toString("hex");

        user.token = token;
        await user.save();

        return res.status(200).json({token: token});
    }catch(error) {
        return res.status(500).json({message: error.message});
    }
}

export const uploadProfilePicture = async(req, res) => {
  const {token} = req.body;
    try{
        const user = await User.findOne({token: token});
        if(!user) {
            return res.status(404).json({message: "User doesn't exist"});
        }
       user.profilePicture = req.file.filename;
       await user.save();

       return res.status(200).json({message: "Profile picture uploaded successfully"});
    }catch(error) {
        return res.status(500).json({message: error.message});
    }
}

export const updateUserProfile = async(req, res) => {

    try {   
        const {token, ...newUserData} = req.body;

        const user = await User.findOne({token: token});
        if(!user) {
            return res.status(404).json({message: "User doesn't exist"});
        }
       const {username, email} = newUserData;

       const existingUser = await User.findOne({
           $or: [{username: username}, {email: email}]
       })

       if (existingUser) {
        if(existingUser || String(existingUser._id) !== String(user._id)) {
             return res.status(400).json({message: "Username or email already exists"});
        }
          
       }
       Object.assign(user, newUserData);
       await user.save();
       return res.json({message: "User updated successfully"});
    }catch(err) {
        return res.status(500).json({message: err.message});
    }
}

export const getUserAndProfile = async(req, res) => {
    try {
        const {token} = req.query;
        const user = await User.findOne({token: token});

        if(!user) {
            return res.status(404).json({message: "User doesn't exist"});
        }
        const userProfile = await Profile.findOne({userId: user._id})
        .populate("userId", "name email username profilePicture");

        return res.json(userProfile);
       
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export const commentPost = async(req, res) => {
    const {token, post_id, commentBody} = req.body;

    try {
        const user = await User.findOne({token: token}).select("_id");

        if(!user) {
            return res.status(404).json({message: "User doesn't exist"});
        }

        const post = await Post.findOne({_id: post_id});

        if(!post) {
            return res.status(404).json({message: "Post doesn't exist"});
        }

        const comment = new Comment({
            userId: user._id,
            postId: post._id,
            body: commentBody
        });


        await comment.save();

        return res.status(200).json({message: "Comment added successfully"});


    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}
export const updateProfileData = async(req, res) => {
    try {
        const {token, ...newProfileData} = req.body;

        const userProfile = await User.findOne({token: token});
        if(!userProfile) {
            return res.status(404).json({message: "User doesn't exist"});
        }

        const profile_to_update = await Profile.findOne({userId: userProfile._id});
        if(!profile_to_update) {
            return res.status(404).json({message: "Profile doesn't exist"});
        }

        Object.assign(profile_to_update, newProfileData);
        await profile_to_update.save();
        return res.json({message: "Profile updated successfully"});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}              

export const getAllUserProfile = async(req, res) => {
    try {
        const profiles = await Profile.find().populate("userId", "name email username profilePicture");
        return res.json({profiles});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export const downloadProfile = async(req, res) => {
    try {
        const user_id = req.query.id;
        const userProfile = await Profile.findOne({userId: user_id}).populate("userId", "name email username profilePicture");

        let outputPath = await convertUserDataToPDF(userProfile);

        return res.json({"message": outputPath});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export const sendConnectionRequest = async(req, res) => {
    const {token, followerId} = req.body;


    try {
        const user = await User.findOne({token: token});
        if(!user) {
            return res.status(404).json({message: "User doesn't exist"});
        }
        const connectionUser = await User.findOne({_id: followerId});
        if(!connectionUser) {
            return res.status(404).json({message: "Connection user doesn't exist"});
        }

        const existingRequest = await FollowerRequest.findOne({
            userId: user._id,
            followerId : connectionUser._id
        })
        if(existingRequest) {
            return res.status(400).json({message: "Connection request already sent"});
        }

        const request = new FollowerRequest({
            userId: user._id,
            followerId: connectionUser._id
        })
        await request.save();
        return res.status(200).json({message: "Connection request sent successfully"});
    }
    catch(error){
        return res.status(500).json({message: error.message});
    }
}

export const getMyConnectionRequests = async(req, res) => {
    const {token} = req.query;
    try {
        const user = await User.findOne({token: token});

        if(!user) {
            return res.status(404).json({message: "User doesn't exist"});
        }

        const connection = await FollowerRequest.find({userId: user._id}).populate("followerId", "name email username profilePicture");
        return res.json({connection});

    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}
export const getMyConnections = async(req, res) => {
    const {token} = req.query;
    try{

        const user = await User.findOne({token: token});
        if(!user) {
            return res.status(404).json({message: "User doesn't exist"});
        }

        const connections = await FollowerRequest.find({followerId: user._id}).populate("userId", "name email username profilePicture");

        return res.json(connections);
    }catch(error) {
        return res.status(500).json({message: error.message});
    }
}

export const acceptConnectionRequest = async(req, res) => {
    const {token, requestId, action_type} = req.body;

    try{
        const user = await User.findOne({token});
        if(!user) {
            return res.status(404).json({message: "User doesn't exist"});
        }
        const connection = await FollowerRequest.findOne({_id: requestId});
        if(!connection) {
            return res.status(404).json({message: "Connection request doesn't exist"});
        }
        if(action_type === "accept") {
            connection.status_accepted = true;
        } else if(action_type === "reject") {
            connection.status_accepted = false;
        }
        await connection.save();
        return res.json({message: "Connection request accepted successfully"});
    }catch(error) {
        return res.status(404).json({message: error.message});
    }
}

export const getUserProfileThroughUsername = async(req, res) => {
  const {username} = req.query;
    try {
        const user = await User.findOne({
            username
        });

        if(!user) {
            return res.status(404).json({message: "User doesn't exist"});
        }
        const userProfile = await Profile.findOne({userId: user._id}).populate("userId", "name username email profilePicture");
        return res.json({ "profile": userProfile});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}