import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";

const createComment = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const owner = req.user?._id;

    const videoId = req.params.videoId;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not fount");
    }

    const newComment = await Comment.create({
        content,
        video: videoId,
        owner,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, { newComment }, "Comment created successfully")
        );
});

const getVideoComments = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId;
    const { page = 1, limit = 10 } = req.query;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: {
            createdAt: "desc",
        },
    };

    const queryOptions = {
        video: videoId,
    };

    const comments = await Comment.aggregatePaginate(queryOptions, options);

    return res
        .status(200)
        .json(
            new ApiResponse(200, { comments }, "Comments fetched successfully")
        );
});

const updateComment = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        const { content } = req.body;

        if (!content) {
            throw new ApiError(400, "Content is required");
        }

        const comment = await Comment.findById(id);

        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        comment.content = content;

        await comment.save();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { comment },
                    "Comment updated successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, "Failed to update comment");
    }
});

const deleteComment = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;

        const comment = await Comment.findById(id);

        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        await comment.remove();

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Comment deleted successfully"));
    } catch (error) {
        throw new ApiError(500, "Failed to delete comment");
    }
});

export { createComment, getVideoComments, updateComment, deleteComment };
