import { isValidObjectId } from "mongoose";
import { Game } from "../models/game.model.js";
import { Category } from "../models/category.model.js";
import { v4 as uuidv4 } from "uuid";





const extractUniqueId = async (req, res, next) => {
    const { gameId } = req.params;

    if (!isValidObjectId(gameId)) {
        return res.status(400).json({ message: "Invalid game Id" });
    }

    const game = await Game.findById(gameId);

    if (!game) {
        return res.status(404).json({ message: "Game not found" });
    }

    let uniqueId;

    if (game.gameSource === "self") {
        const parts = game.gameUrl.split("/");
        uniqueId = parts[parts.indexOf("files") + 1]; //Extracts '692b6760' from 'files/692b6760/
    }

    if (game.thumbnailSource === "self") {
        const parts = game.imageUrl.split("/");
        uniqueId = parts[parts.indexOf("files") + 1]
    }

    if(game.recommendedImageUrl){
        const parts = game.recommendedImageUrl.split("/");
        uniqueId = parts[parts.indexOf("files") + 1]
    }

    if(game.featuredVideoUrl){
        const parts = game.featuredVideoUrl.split("/");
        uniqueId = parts[parts.indexOf("files") + 1]
    }

    if(game.featuredImageUrl){
        const parts = game.featuredImageUrl.split("/");
        uniqueId = parts[parts.indexOf("files") + 1]
    }

    if (uniqueId) {
        req.existingUniqueId = uniqueId; //Attach to request Object
    }

    req.game = game //Attach game to request object

    next(); //Continue to Multer and controller
}


const extractCategoryUniqueId = async (req, res, next) => {
    const { categoryId } = req.params;
    if (!isValidObjectId(categoryId)) {
        return res.status(400).json({ message: "Invalid Category Id" });
    }
    const category = await Category.findById(categoryId);


    if (!category) {
        return res.status(404).json({ message: "Category Not Found" })
    }

    // Extract unique Id
    let uniqueId;

    if (category.imageSource === "self") {
        const parts = category.imageUrl.split("/");
        uniqueId = parts[parts.indexOf("gamecategory") + 1]
    }
    else {
        uniqueId = uuidv4().replace(/-/g, "").substring(0, 8)
    }

    if (uniqueId) {
        req.existingUniqueId = uniqueId; //Attach to request Object
    }

    req.category = category;
    next();

}


export { extractUniqueId, extractCategoryUniqueId };