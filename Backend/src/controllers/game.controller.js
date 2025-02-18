import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Game } from "../models/game.model.js";
import { renameFolder,copyFolderContents } from "../utils/RenameFolder.js";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { fileURLToPath } from "url";
import { isValidObjectId } from "mongoose";
import decompress from "decompress"


const uploadGame = asyncHandler(async (req, res) => {
    const { gameName, description, category, splashColor, isrotate, gameUrl } = req.body;

    //  ensuring boolean value
    const isdownload = req.body.isdownload === "true";


    if (gameUrl && !isdownload) {
        throw new ApiError(400, "If you provided gameUrl , you cant allow the game to be downloaded");
    }


    // input validation
    if ([gameName, description, splashColor, isrotate].some((field) => !field || field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    if (!category) {
        throw new ApiError(400, "Category is required");
    }


    const existedgameName = await Game.findOne({ gameName });

    if (existedgameName) {
        throw new ApiError(400, "Game name already exists");
    }



    // upload an image
    const __dirname = path.resolve();
    const gameFolderName = gameName.replace(/\s+/g, "-").toLowerCase();
    let imageUrl = req.body.imageUrl || ""
    let imageFile = req.files?.image?.[0];
    const imageFolderPath = path.join(__dirname, "public/images", gameFolderName);

    // Ensure image folder exists
    if (!fs.existsSync(imageFolderPath)) {
        fs.mkdirSync(imageFolderPath, { recursive: true });
    }


    if (imageFile) {
        const imageFilePath = path.join(imageFolderPath, imageFile.filename);
        fs.renameSync(imageFile.path, imageFilePath); // Move file to correct folder
        const encodedFilename = encodeURIComponent(imageFile.filename); // Encode spaces and special characters
        const baseUrl = `${req.protocol}://${req.get("host")}`; //Get the backend url dynamically
        imageUrl = `${baseUrl}/images/${gameFolderName}/${encodedFilename}`;
    }

    // Extract ZIP File (Only if no `gameUrl` is provided)
    let gameFolder = "";
    let finalGameUrl = gameUrl?.trim() || "";

    const gameZipPath = req.files?.gameZip?.[0]?.path;


    

    if (!gameUrl && gameZipPath) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const rootDir = path.resolve(__dirname, "../../");

        const gameFolderName = gameName.replace(/\s+/g, "-").toLowerCase();

        // Paths for both folders
        const gamesPath = path.join(rootDir, "public/games", gameFolderName);
        const downloadedGamesPath = path.join(rootDir, "public/downloaded_games", gameFolderName);

        // Get the backend URL dynamically
        const baseUrl = `${req.protocol}://${req.get("host")}`;

        if (!isdownload) {
            // Store the game in the "downloaded_games" folder
            if (!fs.existsSync(downloadedGamesPath)) {
                fs.mkdirSync(downloadedGamesPath, { recursive: true });
            }



            try {
                await decompress(gameZipPath, downloadedGamesPath);
            } catch (error) {
                throw new ApiError(500, "Failed to extract game ZIP file");
            }
            gameFolder = `/public/downloaded_games/${gameFolderName}`; // Save only in downloaded_games
            finalGameUrl = `${baseUrl}/downloaded_games/${gameFolderName}/`;
        } else {
            // Store the game in the "games" folder
            if (!fs.existsSync(gamesPath)) {
                fs.mkdirSync(gamesPath, { recursive: true });
            }

            try {
                await decompress(gameZipPath, gamesPath);
            } catch (error) {
                throw new ApiError(500, "Failed to extract game ZIP file");
            }
            gameFolder = `/public/games/${gameFolderName}`; // Save in games folder
            finalGameUrl = `${baseUrl}/games/${gameFolderName}/`;
        }
        fs.unlinkSync(gameZipPath);
    }

    // Ensure only one source of game URL
    if (gameUrl && gameZipPath) {
        throw new ApiError(400, "Either provide a game URL manually or upload a ZIP file, not both.");
    }

    // Determine Source Type

    let source = gameZipPath ? "self" : "link";

    // Create game object
    let gameData = {
        gameName,
        description,
        category,
        splashColor,
        isrotate: isrotate === "true",
        imageUrl,
        gameUrl: finalGameUrl,
        isdownload,
        source
    };

    if (!isdownload) {
        gameData.gameFolder = gameFolder; // Add gameFolder only when isdownload is false
    }

    const game = await Game.create(gameData);

    return res.status(201).json(new ApiResponse(201, game, "Game Uploaded Succesfully"));
});

const getAllGame = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10, query,category } = req.query;
    console.log(category);

    const pipeline = [];

    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { gameName: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                ]
            }
        });
    }

    if(category){
        pipeline.push({
            $match:{
                category:{$in:[category]}
            }
        })
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const game = await Game.aggregatePaginate(Game.aggregate(pipeline), options);

    return res.status(200).json(new ApiResponse(200, game, "All Games Fetched Successfully"));
});

const getGameById = asyncHandler(async (req, res) => {
    const { gameId } = req.params;

    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid Game Id");
    }

    const game = await Game.findById(gameId);

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }
    return res.status(200).json(new ApiResponse(200, game, "Game Fetched Successfully"));

})

const deleteGame = asyncHandler(async (req, res) => {

    const { gameId } = req.params;

    if (!isValidObjectId) {
        throw new ApiError(400, "Invalid Game Id");
    }

    const game = await Game.findById(gameId);

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }
    //Determine the game folder path based on `isdownload` status
    const __dirname = path.resolve();
    let gameFolderPath = "";

    if (game.isdownload) {
        gameFolderPath = path.join(__dirname, "public/games", game.gameName.replace(/\s+/g, "-").toLowerCase());
    }
    else {
        gameFolderPath = path.join(__dirname, "public/downloaded_games", game.gameName.replace(/\s+/g, "-").toLowerCase());
    }

    console.log(gameFolderPath);

    // Delete the game folder if it exists
    if (fs.existsSync(gameFolderPath)) {
        fs.rmSync(gameFolderPath, { recursive: true, force: true }); // Deletes the entire folder
    }


    // deleting game image
    let imageFolderPath = path.join(__dirname, "public/images", game.gameName.replace(/\s+/g, "-").toLowerCase());

    if (fs.existsSync(imageFolderPath)) {
        fs.rmSync(imageFolderPath, { recursive: true, force: true }); // Deletes the entire folder
    }

    const isdeleted = await Game.findByIdAndDelete(gameId);

    if (!isdeleted) {
        throw new ApiError(500, "Failed To Delte Game");
    }


    return res.status(200).json(new ApiResponse(200, isdeleted, "Game Deleted Succesfully"));
})

const downloadGame = asyncHandler(async (req, res) => {
    const { gameName } = req.params;

    const game = await Game.findOne({ gameName });

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }

    const __dirname = path.resolve();


    const gameFolderPath = path.join(__dirname, game.gameFolder);
    const zipFileName = `${gameName}.zip`;
    const zipFilePath = path.join(__dirname, zipFileName);

    // check if folder exists

    if (!fs.existsSync(gameFolderPath)) {
        throw new ApiError(404, "Game Folder Not Found");
    }

    // Create a Zip Stream and pipe it to response

    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });



    output.on('close', () => {
        // Send the zip file as download
        res.download(zipFilePath, zipFileName, () => {
            // Clean up the zip file after sending
            fs.unlinkSync(zipFilePath);
        });
    });

    archive.pipe(output);
    archive.directory(gameFolderPath, false);
    await archive.finalize();


})

const editGame = asyncHandler(async (req, res) => {

    const { gameId } = req.params;
    const { gameName, description, category, splashColor } = req.body;
    const __dirname = path.resolve();
    const isrotate = req.body.isrotate === "true"
    let imageUrl = req.body.imageUrl || "";
    let gameUrl=req.body.gameUrl || "";


    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid gameId");
    }

    // input validation
    if ([gameName, description, splashColor,].some((field) => !field || field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    if (!category) {
        throw new ApiError(400, "Category is required");
    }

    const game = await Game.findById(gameId);
    // to ensure gamer url changes or not
    const bool = req.body.gameUrl !== game.gameUrl; 


    const isdownload=game.isdownload;
    

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }

    let updateFields = { description, category, splashColor, isdownload, isrotate, gameName };

    // Check if gameName is changed
    if (game.gameName !== gameName) {
        const oldGameName = game.gameName.replace(/\s+/g, "-").toLowerCase();
        const newGameName = gameName.replace(/\s+/g, "-").toLowerCase();
        const existingImageName = game.imageUrl?.split("/").pop()

        // Determine old and new paths based on isdownload
        const baseFolder = isdownload ? "public/games" : "public/downloaded_games";
        const oldGameFolder = path.join(__dirname, baseFolder, oldGameName);
        const newGameFolder = path.join(__dirname, baseFolder, newGameName);



        // ✅ Check if the new folder already exists
        if (fs.existsSync(newGameFolder)) {
            throw new ApiError(400, "Game name already exists. Please choose a different name.");
        }

        // Rename game folder
        renameFolder(oldGameFolder, newGameFolder);



        // Rename associated image folder
        const imageBasePath = path.join(__dirname, "public", "images");
        const oldImageFolder = path.join(imageBasePath, oldGameName);
        const newImageFolder = path.join(imageBasePath, newGameName);

        renameFolder(oldImageFolder, newImageFolder);

        // Update image URL & game URL
        const baseUrl = `${req.protocol}://${req.get("host")}`; //Get the backend url dynamically
        
        imageUrl = `${baseUrl}/images/${newGameName}/${existingImageName}`; // Assuming image file remains same
        gameUrl = isdownload ? `${baseUrl}/games/${newGameName}/` : `${baseUrl}/downloaded_games/${newGameName}/`;
        updateFields.gameFolder = !isdownload ? `/public/downloaded_games/${newGameName}` : "";
    }


    // **HANDLE IMAGE UPDATE**
    let imageFile = req.files?.image?.[0];

    if (imageUrl && imageFile) {
        throw new ApiError(400, "Either provide an image URL manually or upload an image file, not both");
    }

    // **Paths for old and new image folders**
    const oldImageFolderPath = path.join(__dirname, "public/images", game.gameName.replace(/\s+/g, "-").toLowerCase());
    const imageFolderPath = path.join(__dirname, "public/images", gameName.replace(/\s+/g, "-").toLowerCase());

    console.log("🟡 Old Image Folder Path:", oldImageFolderPath);
    console.log("🟢 New Image Folder Path:", imageFolderPath);

    // **Remove old image folder if game name is changing**
    if (gameName !== game.gameName) {
        if (fs.existsSync(oldImageFolderPath)) {
            fs.rmSync(oldImageFolderPath, { recursive: true, force: true });
            console.log("✅ Deleted old image folder:", oldImageFolderPath);
        }
    }

    // **Handle new image upload**
    if (imageFile) {
        console.log("running");
        console.log("📸 New image uploaded:", imageFile.originalname);

        // **Delete previous images if folder exists**
        if (fs.existsSync(imageFolderPath)) {
            fs.rmSync(imageFolderPath, { recursive: true, force: true });
            console.log("🗑️ Deleted existing image folder:", imageFolderPath);
        }

        // **Create new folder**
        fs.mkdirSync(imageFolderPath, { recursive: true });
        console.log("📂 Created new image folder:", imageFolderPath);

        // **Move new image**
        const imageFilePath = path.join(imageFolderPath, imageFile.filename);
        fs.renameSync(imageFile.path, imageFilePath);
        console.log("✅ Image saved at:", imageFilePath);

        // **Generate accessible image URL**
        console.log(imageFile.filename);
        const encodedFilename = encodeURIComponent(imageFile.filename);
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        imageUrl = `${baseUrl}/images/${gameName.replace(/\s+/g, "-").toLowerCase()}/${encodedFilename}`;
        console.log("🆕 Updated Image URL:", imageUrl);
    }


    if (req.files?.gameZip?.[0]) {
        const gameZipFile = req.files.gameZip[0]; // The uploaded ZIP file
        const __dirname = path.resolve();
        const baseUrl = `${req.protocol}://${req.get("host")}`;

        // Determine the correct game folder base path
        const gameFolderBase = isdownload ? "public/games" : "public/downloaded_games";
        let oldGameFolder = path.join(__dirname, gameFolderBase, game.gameName.replace(/\s+/g, "-").toLowerCase());

        if (game.gameName !== gameName) {
            // Means the game name changed, handle renaming logic if needed
            oldGameFolder=path.join(__dirname,gameFolderBase,gameName.replace(/\s+/g, "-").toLowerCase());
        }

        // Extract ZIP directly to the target folder
        await decompress(gameZipFile.path, oldGameFolder);
        updateFields.source="self"
        fs.unlinkSync(gameZipFile.path);
    }
    console.log(imageUrl);
    if (imageUrl) {
        updateFields.imageUrl = imageUrl;
    }
    console.log(gameUrl);
    console.log(game.gameUrl);
    if(gameUrl){
        updateFields.gameUrl = gameUrl;
        if(bool){
            // it means gameUrl changes
            updateFields.source="link"
        }
    }

    // Update game in DB
    const updatedGame = await Game.findByIdAndUpdate(gameId, updateFields, { new: true });
    return res.status(200).json(new ApiResponse(200, updatedGame, "Game Updated Succesfully"));


})

const incrementTopTenCount = asyncHandler(async (req, res) => {
    const { gameId } = req.params;

    if (!isValidObjectId(gameId)) {
        throw new ApiError(404, "Invalid Game Id");
    }

    const game = await Game.findById(gameId);

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }

    // Increment the topTenCount by 1
    game.topTenCount += 1;

    await game.save();

    return res.status(200).json(new ApiResponse(200, game, "topTenCount Incremented Successfully"));
});

const updateLoadingState = asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    const { isloading } = req.query;

    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid Game Id");
    }

    if (!isloading) {
        throw new ApiError(400, "isloading is required");
    }

    const game = await Game.findById(gameId);

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }

    if (typeof isloading !== 'string' || (isloading !== 'true' && isloading !== 'false')) {
        throw new ApiError(400, "Invalid value fro isloading. It must be true or false");
    }

    // Update the isloading value
    game.isloading = (isloading === 'true');

    await game.save();

    return res.status(200).json(new ApiResponse(200, game, "isloaded updated Succesfully"));
})

const getNumberOfTotalGames = asyncHandler(async (req, res) => {
    const totalGames = await Game.countDocuments();

    return res.status(200).json(new ApiResponse(200, totalGames, "Count of total games Fetched Successfully"))
})

const getNumberOfAllowedDownloadGames = asyncHandler(async (req, res) => {
    const allowedDownloadGames = await Game.countDocuments({ isdownload: false });

    return res.status(200).json(new ApiResponse(200, allowedDownloadGames, "Count of Allowed Download Games Fetched Succesfully"));

})

const getNumberOfSelfUploadedGames = asyncHandler(async (req, res) => {
    const selfUploadedGames = await Game.countDocuments({ source: "self" });
    return res.status(200).json(new ApiResponse(200, selfUploadedGames, "Count of Self Uploaded Games Fetched Succesfully"))
})

const getNumberofUploadedGamesByLink = asyncHandler(async (req, res) => {
    const uploadedGamesByLink = await Game.countDocuments({ source: "link" });
    return res.status(200).json(new ApiResponse(200, uploadedGamesByLink, "Count of Uploaded Games By Link Fetched Succesfully"));
})


const getGameCategories=asyncHandler(async(req,res)=>{

    const categories=await Game.aggregate([
        {$unwind:"$category"},
        {$group:{_id:"$category",count:{$sum:1}}},
        {$sort:{count:-1}}
    ])

    return res.status(200).json(new ApiResponse(200,categories,"Categories Fetched Succesfully"))
   
})

const toggleDownloadStatus=asyncHandler(async(req,res)=>{
    const {gameId}=req.params;

    if(!isValidObjectId(gameId)){
        throw new ApiError(400,"Invalid Game Id");
    }

    const game=await Game.findById(gameId);

    if(!game){
        throw new ApiError(404,"Game Not Found");
    }

    if(game.source==="link"){
        throw new ApiError(400,"You Cannot Change Download Status,First upload the game folder");
    }

    const __dirname=path.resolve();
    const baseUrl = `${req.protocol}://${req.get("host")}`;



    if(game.isdownload){
        // it means allowing download
        const oldGameFolder=path.join(__dirname,"public/games",game.gameName.replace(/\s+/g, "-").toLowerCase());
        const newGameFolder=path.join(__dirname,"public/downloaded_games",game.gameName.replace(/\s+/g, "-").toLowerCase());
        

        // make new folder in downloaded games
        fs.mkdirSync(newGameFolder,{recursive:true});
-
        // copy folder contents
        copyFolderContents(oldGameFolder,newGameFolder);

        // Delete Old Folder
        fs.rmdirSync(oldGameFolder,{recursive:true});

        // update fields
        game.isdownload=false;
        game.gameFolder=`/public/downloaded_games/${game.gameName.replace(/\s+/g, "-").toLowerCase()}`;
        game.gameUrl=`${baseUrl}/downloaded_games/${game.gameName.replace(/\s+/g, "-").toLowerCase()}`;
        await game.save();
    }
    else{

        // ite means not allowing download

        const oldGameFolder=path.join(__dirname,"public/downloaded_games",game.gameName.replace(/\s+/g, "-").toLowerCase());
        const newGameFolder=path.join(__dirname,"public/games",game.gameName.replace(/\s+/g, "-").toLowerCase());

        // make new folder in game folder
        fs.mkdirSync(newGameFolder,{recursive:true});

        // copy folder contents
        copyFolderContents(oldGameFolder,newGameFolder);

        // delete old folder
        fs.rmdirSync(oldGameFolder,{recursive:true});

        // update fields
        game.isdownload=true;
        game.gameFolder="";
        game.gameUrl=`${baseUrl}/games/${game.gameName.replace(/\s+/g, "-").toLowerCase()}`;
        await game.save();

    }

    return res.status(200).json(new ApiResponse(200,game,"Toggle Download Status Succesfully"));

})




export {
    uploadGame, getAllGame, getGameById,
    deleteGame, downloadGame, editGame,
    incrementTopTenCount, updateLoadingState,
    getNumberOfTotalGames, getNumberOfAllowedDownloadGames,
    getNumberOfSelfUploadedGames, getNumberofUploadedGamesByLink,
    getGameCategories,toggleDownloadStatus
};
