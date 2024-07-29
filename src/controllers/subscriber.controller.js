import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { Subscription as Subscriber } from "../models/subscription.model.js";
import mongoose from "mongoose";

const subscribe = asyncHandler(async (req, res) => {
    const channel = req.params.channelId;
    if (!channel) {
        throw new ApiError(400, "No channel specified");
    }

    const subscriber = req.user?._id;

    const channelObjectId = new mongoose.Types.ObjectId(channel);

    const alreadySubscribed = await Subscriber.findOne({
        channel: channelObjectId,
        subscriber,
    });

    if (alreadySubscribed) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { response: true },
                    "You are already subscribed to this channel"
                )
            );
    }

    const newSubscriber = await Subscriber.create({
        channel,
        subscriber,
    });

    if (!newSubscriber) {
        throw new ApiError(500, "Failed to subscribe");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { response: true }, "Subscribed successfully")
        );
});

const unsubscribe = asyncHandler(async (req, res) => {
    const channel = req.params.channelId;
    if (!channel) {
        throw new ApiError(400, "No channel specified");
    }

    const subscriber = req.user?._id;
    const channelObjectId = new mongoose.Types.ObjectId(channel);

    const subscription = await Subscriber.findOneAndDelete({
        channel: channelObjectId,
        subscriber,
    });

    if (!subscription) {
        throw new ApiError(404, "Subscription not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { response: true },
                "Unsubscribed successfully"
            )
        );
});

const checkSubscription = asyncHandler(async (req, res) => {
    const channel = req.params.channelId;
    if (!channel) {
        throw new ApiError(400, "No channel specified");
    }

    const channelObjectId = new mongoose.Types.ObjectId(channel);
    const subscriber = req.user?._id;

    const subscription = await Subscriber.findOne({
        channel: channelObjectId,
        subscriber,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { response: !!subscription },
                "Subscription status checked"
            )
        );
});

export { subscribe, unsubscribe, checkSubscription };
