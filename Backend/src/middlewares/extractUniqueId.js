import { isValidObjectId } from "mongoose";
import { Game } from "../models/game.model.js";



const extractUniqueId=async(req,res,next)=>{
    const {gameId}=req.params;

    if(!isValidObjectId(gameId)){
        return res.status(400).json({message:"Invalid game Id"});
    }

    const game=await Game.findById(gameId);

    if(!game){
        return res.status(404).json({message:"Game not found"});
    }

    let uniqueId;

    if(game.gameSource==="self"){
        const parts=game.gameUrl.split("/");
         uniqueId=parts[parts.indexOf("files")+1]; //Extracts '692b6760' from 'files/692b6760/
    }

    if(game.thumbnailSource==="self"){
        const parts=game.imageUrl.split("/");
        uniqueId=parts[parts.indexOf("files")+1]
    }

    if(uniqueId){
        req.existingUniqueId=uniqueId; //Attach to request Object
    }
    next(); //Continue to Multer and controller
}



export {extractUniqueId};