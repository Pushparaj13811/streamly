import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { mongoose } from "mongoose";

const getPlaylistOverview = asyncHandler(async (req, res) => {
    const owner = req.user?._id;
    try {
        const result = await Playlist.aggregate([
            {
                $facet: {
                    totalPlaylists: [
                        { $match: { owner: owner } },
                        { $count: "total" },
                    ],
                    recentPlaylists: [
                        { $match: { owner: owner } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 5 },
                    ],
                    topPlaylists: [
                        { $match: { owner: owner } },
                        { $unwind: "$videos" },
                        {
                            $group: {
                                _id: "$_id",
                                totalViews: { $sum: "$videos.views" },
                            },
                        },
                        { $sort: { totalViews: -1 } },
                        { $limit: 5 },
                    ],
                },
            },
            {
                $project: {
                    totalPlaylists: {
                        $arrayElemAt: ["$totalPlaylists.total", 0],
                    },
                    recentPlaylists: 1,
                    topPlaylists: 1,
                },
            },
        ]);

        const totalPlaylists = result[0].totalPlaylists || 0;
        const recentPlaylists = result[0].recentPlaylists;
        const topPlaylists = result[0].topPlaylists;

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    totalPlaylists,
                    recentPlaylists,
                    topPlaylists,
                },
                "Playlist overview retrieved successfully"
            )
        );
    } catch (error) {
        throw new ApiError(500, "Failed to retrieve playlist overview");
    }
});

const getVideoOverview = asyncHandler(async (req, res) => {
    let ownerId = req.user?.id;

    const owner = new mongoose.Types.ObjectId(ownerId);

    try {
        const result = await Video.aggregate([
            {
                $facet: {
                    totalVideos: [
                        { $match: { owner: owner } },
                        { $count: "total" },
                    ],
                    recentVideos: [
                        { $match: { owner: owner } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 5 },
                    ],
                    topVideos: [
                        { $match: { owner: owner } },
                        { $sort: { views: -1 } },
                        { $limit: 5 },
                    ],
                },
            },
            {
                $project: {
                    totalVideos: { $arrayElemAt: ["$totalVideos.total", 0] },
                    recentVideos: 1,
                    topVideos: 1,
                },
            },
        ]);

        const totalVideos = result[0].totalVideos || 0; // If no videos, default to 0
        const recentVideos = result[0].recentVideos;
        const topVideos = result[0].topVideos;

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { totalVideos, recentVideos, topVideos },
                    "Video overview retrieved successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, "Failed to retrieve video overview");
    }
});

const getUserOverview = asyncHandler(async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
        const topUsers = await User.aggregate([
            {
                $lookup: {
                    from: "videos",
                    localField: "_id",
                    foreignField: "owner",
                    as: "videos",
                },
            },
            { $unwind: "$videos" },
            { $group: { _id: "$_id", totalViews: { $sum: "$videos.views" } } },
            { $sort: { totalViews: -1 } },
            { $limit: 5 },
        ]);
        const activeUsers = await User.find({
            lastLogin: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
        }).countDocuments();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { totalUsers, recentUsers, topUsers, activeUsers },
                    "User overview retrieved successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, "Failed to retrieve user overview");
    }
});

const getEngagementMetrix = asyncHandler(async (req, res) => {
    const owner = req.user?._id;

    try {
        const engagementData = await Video.aggregate([
            {
                $match: { owner: owner },
            },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: "$views" },
                    totalLikes: { $sum: "$likes" },
                    totalVideos: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalViews: 1,
                    totalLikes: 1,
                    totalVideos: 1,
                },
            },
        ]);

        const totalVideos = engagementData[0].totalVideos;
        const totalViews = engagementData[0].totalViews;
        const totalLikes = engagementData[0].totalLikes;
        const averageViews = totalViews / totalVideos;
        const averageLikes = totalLikes / totalVideos;

        const engagementMetrix = {
            totalVideos,
            totalViews,
            totalLikes,
            averageViews,
            averageLikes,
        };

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { engagementMetrix },
                    "Engagement metrix retrieved successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, "Failed to retrieve engagement metrix");
    }
});

export {
    getPlaylistOverview,
    getVideoOverview,
    getUserOverview,
    getEngagementMetrix,
};
