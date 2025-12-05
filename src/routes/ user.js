const express = require("express");
const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");


const router = express.Router();

const USER_SAFE_DATA = ["firstName", "lastName", "photoUrl", "about", "skills"];

// User Connections
router.get("/connections", userAuth, async (req, res) => {
    try {
        const user = req.user;

        const userConnections = await ConnectionRequest.find({
             $or: [
                {fromUserId: user._id}, 
                {toUserId: user._id},
            ],
             status: "accepted"
        })
        .populate("fromUserId", USER_SAFE_DATA)
        .populate("toUserId", USER_SAFE_DATA);

        const data = userConnections.map((row) => {
            if(row.fromUserId._id.equals(user._id)){
                return row.toUserId;
            }
            return row.fromUserId;
        })



        res.json({
            data,
        })

    } catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
});

// Get Pending Connection Requests for the LoggedIn User
router.get("/requests", userAuth, async(req, res) => {
    try {
        
        const user = req.user;
    
        const requests = await ConnectionRequest.find({
            toUserId: user._id,
            status: "interested"
        }).populate("fromUserId", USER_SAFE_DATA);

        res.json({
            message: "User's pending requests fetched",
            data: requests,
        });

    } catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
})

// Feed
router.get("/feed", userAuth, async (req, res) => {
    try {
        const user = req.user;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        limit = limit > 50 ? 50 : limit;

        const skip = (page - 1) * limit;
        
        const userConnections = await ConnectionRequest.find({
            $or: [
                {fromUserId: user._id},
                {toUserId: user._id},
            ]
        }).
        select("fromUserId toUserId");

        const excludeUserIds = userConnections.map((row) => {{
            if(row.toUserId.equals(user._id)){
                return row.fromUserId;
            }
            return row.toUserId;
        }})

        excludeUserIds.push(user._id);

        const userFeed = await User.find({
            _id: { $nin: excludeUserIds}
        }).
        select(USER_SAFE_DATA).
        skip(skip).
        limit(limit);

        res.json({
            data: userFeed
        });


    } catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }


});


module.exports = router;