import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import getVideoDuration from "../utils/duration.js";
import mongoose from "mongoose";

const createVideo = asyncHandler(async (req, res) => {
    const { title, description, isPublished } = req.body;

    const videoInfo = await Video.findOne({ title });

    if (!title) {
        throw new ApiError(400, "Title is required");
    }
    if (videoInfo) {
        throw new ApiError(400, "Title already exists");
    }
    if (!description) {
        throw new ApiError(400, "Description is required");
    }

    const published = isPublished !== false;

    const videoLocalPath = req.files?.video[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;

    const duration = await getVideoDuration(videoLocalPath)
        .then((duration) => {
            return duration;
        })
        .catch((error) => {
            throw new ApiError(500, "Failed to get video duration");
        });

    console.log("duration", duration);

    if (!duration) {
        throw new ApiError(500, "Failed to get video duration");
    }

    if (!videoLocalPath) {
        throw new ApiError(400, "Video is required");
    }
    const video = await uploadOnCloudinary(videoLocalPath);

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!video) {
        throw new ApiError(500, "Failed to upload video.");
    }
    if (!thumbnail) {
        throw new ApiError(500, "Failed to upload thumbnail.");
    }

    const owner = req.user?._id;

    const uploadVideo = await Video.create({
        videoFile: video?.url,
        thumbnail: thumbnail?.url,
        title,
        description,
        isPublished: published,
        views: 0,
        duration: duration,
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
    } else {
        options.sort = {
            createdAt: -1,
        };
    }

    const match = {
        isPublished: true,
    };

    if (userId) {
        match.owner = userId;
    }

    if (query) {
        match.title = { $regex: query, $options: "i" };
    }

    const aggregate = [
        { $match: match },
        { $sort: options.sort },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
            },
        },
        { $unwind: "$ownerDetails" },
        {
            $project: {
                owner: "$ownerDetails.fullName",
                ownerId: "$ownerDetails._id",
                ownerUsername: "$ownerDetails.username",
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ];

    try {
        const videos = await Video.aggregatePaginate(aggregate, options);

        return res
            .status(200)
            .json(
                new ApiResponse(200, { videos }, "Videos fetched successfully")
            );
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Failed to fetch videos : ", error);
    }
});

const getVideoById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const match = {
        _id: new mongoose.Types.ObjectId(id),
        isPublished: true,
    };

    const aggregate = [
        { $match: match },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
            },
        },
        { $unwind: "$ownerDetails" },
        {
            $project: {
                owner: "$ownerDetails.fullName",
                ownerId: "$ownerDetails._id",
                ownerUsername: "$ownerDetails.username",
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ];

    const video = await Video.aggregate(aggregate);

    if (!video.length) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { video }, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { title, description, isPublished } = req.body;

    if (!id) {
        throw new ApiError(400, "Video ID is required");
    }

    if (!title) {
        throw new ApiError(400, "Title is required");
    }
    if (!description) {
        throw new ApiError(400, "Description is required");
    }

    let video = await Video.findById(id);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const userId = req.user?._id;

    if (userId !== video.owner.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    video.title = title;
    video.description = description;
    video.isPublished = isPublished || video.isPublished;

    await video.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { video }, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const id = req.params?.id;
    const userId = req.user?._id;

    const video = await Video.findById(id);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (userId !== video.owner.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    const videoPublicId = video.videoFile.split("/").pop().split(".")[0];

    try {
        await deleteFromCloudinary(videoPublicId);
    } catch (error) {
        throw new ApiError(500, "Failed to delete video");
    }

    await video.deleteOne({ _id: video._id });

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Video deleted successfully"));
});

const togglePublishedVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?._id;

    const video = await Video.findById(id);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (userId !== video.owner.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
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
