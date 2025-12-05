const express = require("express");
const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const router = express.Router();

//Connection request
router.post("/send/:status/:userId", userAuth, async(req,res) => {
    try {
         const fromUserId = req.user._id;
         const toUserId = req.params.userId;
         const status = req.params.status;

         const allowedStaus = ["ignored", "interested"];

         if(!allowedStaus.includes(status)){
            return res.
            status(400).
            send({
                message: "Invalid status type : "+status,
            });
         } 

         const toUser = await User.findById({_id: toUserId});

         if(!toUser){
            return res.
            status(400).
            json({
                message: "User not found"
            });
         }

         // Check if there is existing conneciton request
          const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId: fromUserId}
            ]
          });

          if(existingConnectionRequest){
            return res.
            status(400).
            json({
                message: "Connection Request Already exist"
            })
          }

         const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
         });
         const data = await connectionRequest.save();

         res.json({
             message: "Connection request sent successfully",
             data,

    })

         
         
    } catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
})

//Review request
router.post("/review/:status/:requestId", userAuth, async(req, res) => {
      try {
        const toUserId = req.user._id;
        const status = req.params.status;
        const requestId = req.params.requestId;

        const allowedStatus = ["accepted", "rejected"];

        if(!allowedStatus.includes(status)){
            return res.
                    status(400).
                    json({
                        message: `Invalid status type : ${status}`,
                    })
        };

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: toUserId,
            status: "interested",
        });

        if(!connectionRequest){
            return res.
                    status(404).
                    json({
                        message: `Invalid connection request`,
                    })
        }


        connectionRequest.status = status;
        const data = await connectionRequest.save()

        res.json({
            message: `Connection request status updated to ${status}`,
            data,
        });

      } catch (error) {
        res.status(400).send("ERROR : " + error.message);
      }
})


module.exports = router;