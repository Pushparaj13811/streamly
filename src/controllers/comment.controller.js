import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

const createComment = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not fount");
    }

    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const owner = req.user?._id;

    try {
        const newComment = await Comment.create({
            content,
            video: videoId,
            owner,
        });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { newComment },
                    "Comment created successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, "Failed to create comment");
    }
});

const getVideoComments = asyncHandler(async (req, res) => {
    const videoId = req.params?.videoId;
    const { page = 1, limit = 10 } = req.query;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: {
            createdAt: -1,
        },
    };

    const objectId = new mongoose.Types.ObjectId(videoId);
    const aggregate = [{ $match: { video: objectId } }];

    try {
        const comments = await Comment.aggregatePaginate(aggregate, options);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { comments },
                    "Comments fetched successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, "Failed to fetch comments");
    }
});

const updateComment = asyncHandler(async (req, res) => {
    const id = req.params?.commentId;
    console.log("Comment id : ", id);

    const comment = await Comment.findById(id);
    console.log("Comment : ", comment);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const commentOwner = comment.owner;
    const requestUserId = req.user?._id;

    const isEqual = commentOwner.equals(requestUserId);

    if (!isEqual) {
        throw new ApiError(403, "You are not allowed to update this comment");
    }

    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    comment.content = content;

    await comment.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, { comment }, "Comment updated successfully")
        );
});

const deleteComment = asyncHandler(async (req, res) => {
    const id = req.params?.commentId;
    const comment = await Comment.findById(id);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const commentOwner = comment.owner;
    const requestUserId = req.user?._id;

    const isEqual = commentOwner.equals(requestUserId);

    if (!isEqual) {
        throw new ApiError(403, "You are not allowed to delete this comment");
    }

    await comment.deleteOne({ _id: comment._id });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { createComment, getVideoComments, updateComment, deleteComment };
