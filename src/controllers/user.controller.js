import asyncHandler from '../utils/asyncHandler.js'
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefereshTokens = async(userId) =>{
  try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}


  } catch (error) {
      throw new ApiError(500, "Something went wrong while generating referesh and access token")
  }
}

const registerUser = asyncHandler( async (req, res) => {
  const { email, password, fullName } = req.body;

  if ( [fullName, email, password].some((field) => field?.trim() === "") ) {
    return res.status(400).json(
      new ApiResponse(400, 'fullName, email and password is required!')
    )
  }

  const existedUser = await User.findOne({
    $or: [{ email }]
  })

  if(existedUser){
    return res.status(422).json(
      new ApiResponse(422, 'User already exist with this email!')
    )
  }

  const user = await User.create({
    fullName,
    email,
    password
  })

  const createdUser = await User.findById(user._id).select("-password -refreshToken" )

  if(!createdUser) {
    return res.status(500).json(
      new ApiResponse(500, "Something went wrong while registering the user!")
    )
  }

  return res.status(200).json(
    new ApiResponse(200, "User registered Successfully", createdUser)
  )
})

const loginUser = asyncHandler( async (req, res) => {
  const { email, password } = req.body

  const existedUser = await User.findOne({
    $or: [{ email }]
  })

  if(!existedUser){
    return res.status(422).json(
      new ApiResponse(422, 'User does exist with this email!')
    )
  }

  const passwordCheck = await existedUser.isPasswordCorrect(password)

  if(!passwordCheck){
    return res.status(422).json(
      new ApiResponse(422, 'Email or password may be wrong!')
    )
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(existedUser._id)

  const user = await User.findById(existedUser._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(200, "User logged In Successfully!", { user, accessToken, refreshToken })
        )

})

const logoutUser = asyncHandler( async (req, res) => {
  await User.findByIdAndUpdate(req.user?._id, { $set: { refreshToken: '' }}, { new: true })

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully!"))
})

const refreshAccessToken = asyncHandler ( async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if(!incomingRefreshToken){
      return res.status(401).json(
        new ApiResponse(401, 'Unauthorized request!')
      )
    }
    
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken._id)

    if(!user){
      return res.status(400).json(
        new ApiResponse(400, "Invalid Refresh Token!")
      )
    }


    if (incomingRefreshToken !== user?.refreshToken) {
      return res.status(401).json(
        new ApiResponse(401, 'Refresh token expired or used!')
      )
    }

    const options = {
      httpOnly: true,
      secure: true
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    return res
           .status(200)
           .cookie("accessToken", accessToken, options)
           .cookie("refreshToken", refreshToken, options)
           .json(
              new ApiResponse(
                  200,
                  "Access token refreshed",
                  { accessToken, refreshToken }
              )
            )
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error.message || "Invalid Refresh Token!")
    )
  }
})

const changeCurrentPassword = asyncHandler( async (req, res) => {
 try {
  const { currentPassword, newPassword } = req.body

  if(!currentPassword || !newPassword){
    return res.status(400).json(
      new ApiResponse(400, "Current password and new password required!")
    )
  }

  const user = await User.findById(req.user?._id)

  const checkpassword = await user.isPasswordCorrect(currentPassword)

  if(!checkpassword){
    return res.status(422).json(
      new ApiResponse(422, "Current password is incorrect!")
    )
  }

  user.password = newPassword
  await user.save({validateBeforeSave: false})

  return res.status(200).json(
    new ApiResponse(200, "Password Updated Successfully!")
  )
 } catch (error) {
  return res.status(500).json(
    new ApiResponse(500, error.message)
  )
 }
})

const getCurrentUser = asyncHandler(async(req, res) => {
  return res
  .status(200)
  .json(new ApiResponse(
      200,
      "User fetched successfully",
      req.user
  ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
  const {fullName, email} = req.body

  if (!fullName || !email) {
      throw new ApiError(400, "All fields are required")
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set: {
              fullName,
              email: email
          }
      },
      {new: true}
      
  ).select("-password -refreshToken")

  return res
  .status(200)
  .json(new ApiResponse(200, user, "Account details updated successfully"))
});

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails }