import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path
    // TODO: get video, upload to cloudinary, create video

     if (!title) {
    throw new ApiError(400, "Title field is empty");
  }

  if (!description) {
    throw new ApiError(400, "description field is empty");
    
  }

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);

  if (!videoFile) {
    throw new ApiError(500, "Video File failed to upload");
  }
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail) {
    throw new ApiError(500, "thumbnail file failed to upload");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    owner: req.user._id,
    duration: videoFile.duration
});

    if (!video) {
        throw new ApiError(500, "video failed to save to database");
    }

    return res
        .status(201)
        .json(new ApiResponse(true, "Video published successfully"));

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId).populate("owner", "name username email") 

    if (!video) {
        throw new ApiError(404, "Video not found");
    } 
    return res
        .status(200)
        .json(new ApiResponse(true, "Video fetched successfully", video)) 
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    const thumbnailLocalPath = req.file?.path

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Optional: only owner can update
    if (video.owner?.toString() !== req.user?._id?.toString()) {
        throw new ApiError(403, "Not authorized to update this video")
    }

    if (title) video.title = title
    if (description) video.description = description

    if (thumbnailLocalPath) {
        const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath)
        if (!thumbnailUpload) {
            throw new ApiError(500, "Thumbnail upload failed")
        }
        video.thumbnail = thumbnailUpload.url
    }

    await video.save()

    return res
        .status(200)
        .json(new ApiResponse(true, "Video updated successfully", video))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}