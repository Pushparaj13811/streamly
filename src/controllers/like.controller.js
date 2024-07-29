import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";

const like = asyncHandler(async (req, res) => {
    const { videoId, commentId, tweetId } = req.body;
    const likedBy = req.user?._id;

    if (!videoId && !commentId && !tweetId) {
        throw new ApiError(400, "Invalid request");
    }

    if (videoId) {
        const video = await Video.findById(videoId);

        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        const alreadyLiked = await Like.findOne({ video: video._id, likedBy });

        if (alreadyLiked) {
            throw new ApiError(400, "Video already liked");
        }

        const like = await Like.create({
            video: video._id,
            likedBy,
        });

        return res
            .status(200)
            .json(new ApiResponse(200, { like }, "Video liked successfully"));
    }

    if (commentId) {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }
        const alreadyLiked = await Like.findOne({
            video: comment._id,
            likedBy,
        });

        if (alreadyLiked) {
            throw new ApiError(400, "Video already liked");
        }

        const like = await Like.create({
            comment: comment._id,
            likedBy,
        });

        return res
            .status(200)
            .json(new ApiResponse(200, { like }, "Comment liked successfully"));
    }

    if (tweetId) {
        const tweet = await Tweet.findById(tweetId);

        if (!tweet) {
            throw new ApiError(404, "Tweet not found");
        }

        const alreadyLiked = await Like.findOne({ video: tweet._id, likedBy });

        if (alreadyLiked) {
            throw new ApiError(400, "Video already liked");
        }

        const like = await Like.create({
            tweet: tweet._id,
            likedBy,
        });

        return res
            .status(200)
            .json(new ApiResponse(200, { like }, "Tweet liked successfully"));
    }
});

const dislike = asyncHandler(async (req, res) => {});

const getAllLikes = asyncHandler(async (req, res) => {
    const { videoId, commentId, tweetId } = req.body;

    if (!videoId && !commentId && !tweetId) {
        throw new ApiError(400, "Invalid request");
    }

    if (videoId) {
        const objectId = new mongoose.Types.ObjectId(videoId);
        const likes = await Like.countDocuments({ video: objectId });
        console.log("Likes on video", likes);

        return res
            .status(200)
            .json(
                new ApiResponse(200, { likes }, "Likes fetched successfully")
            );
    }
    if (commentId) {
        const objectId = new mongoose.Types.ObjectId(commentId);
        const likes = await Like.countDocuments({ comment: commentId });

        return res
            .status(200)
            .json(
                new ApiResponse(200, { likes }, "Likes fetched successfully")
            );
    }

    if (tweetId) {
        const objectId = new mongoose.Types.ObjectId(tweetId);
        const likes = await Like.countDocuments({ tweet: objectId });

        return res
            .status(200)
            .json(
                new ApiResponse(200, { likes }, "Likes fetched successfully")
            );
    }
});

const getAllDislikes = asyncHandler(async (req, res) => {});

const removeLike = asyncHandler(async (req, res) => {
    const { videoId, commentId, tweetId } = req.body;
    const likedBy = req.user?._id;

    if (!videoId && !commentId && !tweetId) {
        throw new ApiError(400, "Invalid request");
    }

    if (videoId) {
        const like = await Like.findOneAndDelete({
            video: videoId,
            likedBy,
        });
        if (!like) {
            throw new ApiError(404, "Like not found");
        }

        console.log("Like removed", like);
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { like },
                    "Video like removed successfully"
                )
            );
    }

    if (commentId) {
        const like = await Like.findOneAndDelete({
            comment: commentId,
            likedBy,
        });
        if (!like) {
            throw new ApiError(404, "Like not found");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { like },
                    "Comment like removed successfully"
                )
            );
    }

    if (tweetId) {
        const like = await Like.findOneAndDelete({
            tweet: tweetId,
            likedBy,
        });
        if (!like) {
            throw new ApiError(404, "Like not found");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { like },
                    "Tweet like removed successfully"
                )
            );
    }
});
const removeDislike = asyncHandler(async (req, res) => {});

export {
    like,
    dislike,
    getAllLikes,
    getAllDislikes,
    removeLike,
    removeDislike,
};
