import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";

const createVideo = asyncHandler(async (req, res) => {
    const { title, description, isPublished } = req.body;

    if (!title) {
        throw new ApiError(400, "Title is required");
    }
    if (!description) {
        throw new ApiError(400, "Description is required");
    }

    if (isPublished != false) {
        isPublished = true;
    }

    const videoLocalPath = req.files?.video[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!video) {
        throw new ApiError(500, "Failed to upload video.");
    }
    if (!thumbnail) {
        throw new ApiError(500, "Failed to upload thumbnail.");
    }

    const owner = req.user?._id;

    const uploadVideo = await Video.create({
        videoFile: video,
        thumbnail: thumbnail,
        title,
        description,
        isPublished,
        owner,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, { uploadVideo }, "Video uploaded successfully")
        );
});

const getAllVideo = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: {},
    };

    if (sortBy && sortType) {
        options.sort = {
            [sortBy]: sortType,
        };
    }

    const queryOptions = {};

    if (userId) {
        queryOptions.owner = userId;
    }

    if (query) {
        queryOptions.title = { $regex: query, $options: "i" };
    }

    try {
        const video = await Video.aggregatePaginate(queryOptions, options);

        return res
            .status(200)
            .json(
                new ApiResponse(200, { video }, "Videos fetched successfully")
            );
    } catch (error) {
        throw new ApiError(500, "Failed to fetch video");
    }
});

const getVideoById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { video }, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const id = req.video?._id;
    const { title, description, isPublished } = req.body;

    if (!title) {
        throw new ApiError(400, "Title is required");
    }
    if (!description) {
        throw new ApiError(400, "Description is required");
    }

    if (isPublished !== false) {
        isPublished = true;
    }

    const video = await Video.findById(id);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.title = title;
    video.description = description;
    video.isPublished = isPublished;

    await video.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { video }, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const id = req.params.id;

    const video = await Video.findById(id);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const videoPublicId = video.videoFile.split("/").pop().split(".")[0];

    try {
        await deleteFromCloudinary(videoPublicId);
    } catch (error) {
        throw new ApiError(500, "Failed to delete video");
    }

    await video.remove();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Video deleted successfully"));
});

const togglePublishedVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;

    await video.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isPublished: video.isPublished },
                "Video published status updated successfully"
            )
        );
});

export {
    createVideo,
    getAllVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishedVideo,
};
