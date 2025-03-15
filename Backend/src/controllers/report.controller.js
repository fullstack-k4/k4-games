import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js"
import { isValidObjectId } from "mongoose";
import { Report } from "../models/report.model.js";


const createReport = asyncHandler(async (req, res) => {
  const { gameId, gameName, imageUrl, gameUrl, reportDescription, reportType } = req.body;

  if ([gameId, gameName, imageUrl, gameUrl, reportType].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Please fill in all fields");
  }
  if (!isValidObjectId(gameId)) {
    throw new ApiError(400, "Invalid game id");
  }
  const report = await Report.create({
    gameId,
    gameName,
    imageUrl,
    gameUrl,
    reportDescription,
    reportType
  })
  return res.status(201).json(new ApiResponse(201, report, "Report Submitted Successfully"));
})


const getAllReports = asyncHandler(async (req, res) => {
  const { type, page = 1, limit = 10 } = req.query;

  const aggregationPipeline = [
    { $sort: { createdAt: -1 } } // Sort by latest
  ]

  if (type) {
    aggregationPipeline.push(
      {
        $match: { reportType: type }
      },
    )
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const paginatedReports = await Report.aggregatePaginate(Report.aggregate(aggregationPipeline), options);


  return res.status(200).json(new ApiResponse(200, paginatedReports, "All Reports Fetched Successfully"));
})


const deleteReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Id");
  }

  const report = await Report.findByIdAndDelete(id);

  if (!report) {
    throw new ApiError(404, "Report Not Found");
  }
  return res.status(201).json(new ApiResponse(201, report, "Report Deleted Successfully"));
})


export { createReport, getAllReports, deleteReport };