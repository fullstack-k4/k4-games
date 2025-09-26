import { Game } from "../models/game.model.js"
import admin from "../config/firebaseConfig.js"



export const publishScheduledGames = async () => {
    const now = new Date();

    const pendingGames = await Game.find({
        status: "scheduled",
        scheduledAt: { $lte: now }
    })

    for (let game of pendingGames) {
        game.status = "published";
        game.scheduledAt = null;

        if (game.notify) {

            const mediaPayload = {
                _id: game?._id,
                gameName: game?.gameName,
                description: game?.description,
                category: game?.category,
                splashColor: game?.splashColor,
                imageUrl: game?.imageUrl,
                gameUrl: game?.gameUrl,
                downloadable: game?.downloadable,
                isloading: game?.isloading,
                isrotate: game?.isrotate,
                topTenCount: game?.topTenCount,
                gameSource: game?.gameSource,
                thumbnailSource: game?.thumbnailSource,
                createdBy: game?.createdBy,
                createdAt: game?.createdAt,
                updatedAt: game?.updatedAt,
                slug: game?.slug,
                isFeatured: game?.isFeatured,
                isRecommended: game?.isRecommended,
                recommendedImageUrl: game?.recommendedImageUrl,
                primaryCategory: game?.primaryCategory
            }

            const messageId = Date.now().toString();

            const message = {
                data: {
                    subscription: "play",
                    screen: "GamePlayActivity",
                    title: game?.gameName,
                    body: game?.description,
                    image: game?.imageUrl,
                    mediaData: JSON.stringify(mediaPayload),
                    messageId
                },
                topic: "all"
            }

            try {
                await admin.messaging().send(message);
                console.log(`📢 Notification sent for: ${game?.gameName}`);
                game.notify = false;
            } catch (error) {
                console.log(`❌ Failed to send Notification for: ${game.gameName}`)
            }
        }

        await game.save();
        console.log(`✅ Published scheduled game:${game?.gameName}`)
    }

}