import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Webpushsubscription } from "../models/webpushsubscription.model.js";
import webpush from "web-push"



const saveSubscription = asyncHandler(async (req, res) => {
    const { subscription } = req.body

    if (!subscription || !subscription.endpoint) {
        throw new ApiError(400, "Invalid Subscription")
    }


    await Webpushsubscription.findOneAndUpdate(
        { endpoint: subscription.endpoint },
        { endpoint: subscription.endpoint, keys: subscription.keys },
        { upsert: true, new: true }
    )

    return res.status(201).json(new ApiResponse(201, subscription, "Subscription Saved Successfully"))
})


const sendNotification = asyncHandler(async (req, res) => {

    const { gameSlug, title, body, icon } = req.body;



    if (!gameSlug || !title || !body || !icon) {
        throw new ApiError(400, "Please Fill All Fields");
    }

    const payload = JSON.stringify({
        title,
        body,
        gameSlug,
        icon,
        url: `/play/${gameSlug}/`,
        tag: `game-${gameSlug}`
    })


    const subscriptions = await Webpushsubscription.find({});


    const results = await Promise.allSettled(subscriptions.map(sub =>
        webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)
    ))

    // Optionally remove invalid subscriptions
    for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (r.status === 'rejected') {
            const err = r.reason;
            // If 410 (gone) or 404, delete subscription
            if (err && err.statusCode && (err.statusCode === 404 || err.statusCode === 410)) {
                await Webpushsubscription.deleteOne({ endpoint: subscriptions[i].endpoint });
            }
        }
    }

    return res.status(200).json(new ApiResponse(200, results, "Notification Sent Successfully"))

})

const sendNormalNotification = asyncHandler(async (req, res) => {

    const { title, body, image } = req.body;


    if (!title || !body) {
        throw new ApiError(400, "Please Fill All Fields");
    }

    const payload = JSON.stringify({
        title,
        body,
        image,
        url: "/",
        tag: `k4-games-${title}`
    })

    const subscriptions = await Webpushsubscription.find({});

    const results = await Promise.allSettled(subscriptions.map(sub =>
        webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)
    ))

    // Optionally remove invalid subscriptions
    for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (r.status === 'rejected') {
            const err = r.reason;
            // If 410 (gone) or 404, delete subscription
            if (err && err.statusCode && (err.statusCode === 404 || err.statusCode === 410)) {
                await Webpushsubscription.deleteOne({ endpoint: subscriptions[i].endpoint });
            }
        }
    }

    return res.status(200).json(new ApiResponse(200, results, "Notification Sent Successfully"))

})


const sendAdvertisementNotification = asyncHandler(async (req, res) => {

    const { title, body, image, url } = req.body;

    if (!title || !body || !url) {
        throw new ApiError(400, "Please Fill All Fields");
    }

    const payload = JSON.stringify({
        title,
        body,
        image,
        url,
        tag: `k4-games-${title}`
    })

    const subscriptions = await Webpushsubscription.find({});

    const results = await Promise.allSettled(subscriptions.map(sub =>
        webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)
    ))

    // Optionally remove invalid subscriptions
    for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (r.status === 'rejected') {
            const err = r.reason;
            // If 410 (gone) or 404, delete subscription
            if (err && err.statusCode && (err.statusCode === 404 || err.statusCode === 410)) {
                await Webpushsubscription.deleteOne({ endpoint: subscriptions[i].endpoint });
            }
        }
    }

    return res.status(200).json(new ApiResponse(200, results, "Notification Sent Successfully"))


})


export { saveSubscription, sendNotification, sendNormalNotification, sendAdvertisementNotification }