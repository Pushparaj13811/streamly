import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/apiError.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const owner = req.user?._id;

    const newTweet = await Tweet.create({
        content,
        owner,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { newTweet }, "Tweet created successfully"));
});

const getTweets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const tweets = await Tweet.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    console.log(tweets);

    return res
        .status(200)
        .json(new ApiResponse(200, { tweets }, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params?.tweetId;

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is invalid or not provided");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const tweetOwner = tweet.owner;
    const reqUser = req.user?._id;

    const isEqual = tweetOwner.equals(reqUser);

    if (!isEqual) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    const content = req.body?.content;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    try {
        tweet.content = content;

        await tweet.save();

        return res
            .status(200)
            .json(
                new ApiResponse(200, { tweet }, "Tweet updated successfully")
            );
    } catch (error) {
        throw new ApiError(500, "Failed to update tweet");
    }
});

const deleteTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params?.tweetId;

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is invalid or not provided");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const tweetOwner = tweet.owner;
    const reqUser = req.user?._id;

    const isEqual = tweetOwner.equals(reqUser);

    if (!isEqual) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }
    try {
        await Tweet.findByIdAndDelete(tweetId);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Tweet deleted successfully"));
    } catch (error) {
        throw new ApiError(500, "Failed to delete tweet");
    }
});

export { createTweet, getTweets, updateTweet, deleteTweet };