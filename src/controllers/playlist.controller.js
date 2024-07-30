import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, videoId } = req.body;

    if (!name) {
        throw new ApiError(400, "Name is required");
    }
    if (!description) {
        throw new ApiError(400, "Description is required");
    }
    const owner = req.user?.id;
    const playlistExist = await Playlist.findOne({ name, owner });
    if (playlistExist) {
        throw new ApiError(400, "Playlist already exists");
    }
    const videos = [];

    if (videoId) {
        console.log(videoId);
        const video = await Video.findById(videoId);
        console.log(video);
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        videos.push(videoId);
    }

    console.log(videos);

    const playlist = await Playlist.create({
        title: name,
        description,
        videos,
        owner,
    });

    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Playlist created successfully", playlist));
});

const getPlaylist = asyncHandler(async (req, res) => {
    const playlistId = req.params?.playlistId;
    console.log(playlistId);

    const aggregate = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId),
            },
        },
        {
            $lookup: {
                from: "users", // Collection name for Users
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
            },
        },
        {
            $unwind: {
                path: "$ownerDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "videos", // Collection name for Videos
                localField: "videos",
                foreignField: "_id",
                as: "videosDetails",
            },
        },
        {
            $lookup: {
                from: "users", // Collection name for Users
                localField: "videosDetails.owner",
                foreignField: "_id",
                as: "videoOwners",
            },
        },
        {
            $addFields: {
                videosDetails: {
                    $map: {
                        input: "$videosDetails",
                        as: "video",
                        in: {
                            _id: "$$video._id",
                            title: "$$video.title",
                            videoFile: "$$video.videoFile",
                            thumbnail: "$$video.thumbnail",
                            description: "$$video.description",
                            duration: "$$video.duration",
                            views: "$$video.views",
                            isPublished: "$$video.isPublished",
                            owner: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$videoOwners",
                                            as: "owner",
                                            cond: {
                                                $eq: [
                                                    "$$owner._id",
                                                    "$$video.owner",
                                                ],
                                            },
                                        },
                                    },
                                    0,
                                ],
                            },
                        },
                    },
                },
            },
        },
        {
            $project: {
                "ownerDetails._id": 1,
                "ownerDetails.fullName": 1,
                "ownerDetails.username": 1,
                "ownerDetails.avatar": 1,
                "videosDetails._id": 1,
                "videosDetails.title": 1,
                "videosDetails.videoFile": 1,
                "videosDetails.thumbnail": 1,
                "videosDetails.description": 1,
                "videosDetails.duration": 1,
                "videosDetails.views": 1,
                "videosDetails.isPublished": 1,
                // "videosDetails.owner._id": 1,
                "videosDetails.owner.fullName": 1,
                "videosDetails.owner.avatar": 1,
                "videosDetails.owner.username": 1,
                title: 1,
                description: 1,
                // videosDetails: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ];

    const playlist = await Playlist.aggregate(aggregate);

    console.log(playlist);
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlists fetched successfully"));
});

const getAllPlaylists = asyncHandler(async (req, res) => {
    const ownerId = req.user?.id;
    console.log(ownerId);
    if (!ownerId) {
        throw new ApiError(401, "Unauthorized request");
    }

    const playlists = await Playlist.find({
        owner: ownerId,
    });

    if (!playlists) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "No playlists found"));
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlists, "Playlists fetched successfully")
        );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId } = req.body;
    const ownerId = req.user?.id;
    const playlistId = req.params.playlistId;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: ownerId,
            videos: { $ne: videoId },
        },
        {
            $push: { videos: videoId },
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!updatedPlaylist) {
        const playlist = await Playlist.findOne({ _id: playlistId });

        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
        if (playlist.owner.toString() !== ownerId) {
            throw new ApiError(
                403,
                "You are not authorized to add video to this playlist"
            );
        }
        if (playlist.videos.includes(videoId)) {
            throw new ApiError(400, "Video already exists in playlist");
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Video added to playlist successfully"
            )
        );
});

const deleteVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { videoId } = req.body;
    const playlistId = req.params?.playlistId;
    const ownerId = req.user?.id;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: ownerId,
            videos: videoId,
        },
        {
            $pull: { videos: videoId },
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!updatedPlaylist) {
        const playlist = await Playlist.findOne({ _id: playlistId });

        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
        if (playlist.owner.toString() !== ownerId) {
            throw new ApiError(
                403,
                "You are not authorized to delete video from this playlist"
            );
        }
        if (!playlist.videos.includes(videoId)) {
            throw new ApiError(400, "Video does not exists in playlist");
        }
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Video deleted from playlist successfully"
            )
        );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const playlistId = req.params?.playlistId;
    const ownerId = req.user?.id;

    const isPlaylistDeleted = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: ownerId,
    });

    if (!isPlaylistDeleted) {
        const playlist = await Playlist.findOne({ _id: playlistId });
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
        if (playlist.owner.toString() !== ownerId) {
            throw new ApiError(
                403,
                "You are not authorized to delete this playlist"
            );
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                !!isPlaylistDeleted,
                "Playlist deleted successfully"
            )
        );
});

export {
    createPlaylist,
    getPlaylist,
    addVideoToPlaylist,
    deleteVideoFromPlaylist,
    deletePlaylist,
    getAllPlaylists,
};
