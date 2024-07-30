import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { StatusCodes } from "http-status-codes";

const healthCheck = asyncHandler(async (req, res) => {
    try {
        return res.status(StatusCodes.OK).json(
            new ApiResponse(
                StatusCodes.OK,
                {
                    uptime: process.uptime(),
                },
                "Up",
                "Health check is successful"
            )
        );
    } catch (error) {
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Internal Server Error"
        );
    }
});

const getSystemMetrics = asyncHandler(async (req, res) => {
    try {
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        const uptime = process.uptime();
        const timestamp = new Date().toISOString();

        return res.status(StatusCodes.OK).json(
            new ApiResponse(
                StatusCodes.OK,
                {
                    memoryUsage,
                    cpuUsage,
                    uptime,
                    timestamp,
                },
                "System Metrics",
                "System metrics retrieved successfully"
            )
        );
    } catch (error) {
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Failed to retrieve system metrics"
        );
    }
});

export { healthCheck, getSystemMetrics };
