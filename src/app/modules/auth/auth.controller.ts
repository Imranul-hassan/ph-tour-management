import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes"
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";
import { createUserTokens } from "../../utils/userTokens";
import { envVars } from "../../config/env";
import passport from "passport";

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // const loginInfo = await AuthServices.credentialsLogin(req.body)

    passport.authenticate("local", async (err: any, user: any, info: any) => {

        if (err) {
            return next(err)
        }
        if (!user) {
            return next(new AppError(401, info.message))
        }

        const userTokens = createUserTokens(user)

        const { password: pass, ...rest } = user.toObject()

        setAuthCookie(res, userTokens)
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "User login successfully",
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user: rest
            }
        })
    })(req, res, next)

    // res.cookie("accessToken", loginInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false
    // })

    // res.cookie("refreshToken", loginInfo.refreshToken, {
    //     httpOnly: true,
    //     secure: false
    // })

})

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string)

    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token received from cookies ")
    }

    // res.cookie("accessToken", tokenInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false
    // })

    setAuthCookie(res, tokenInfo)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "New access token successfully",
        data: tokenInfo
    })
})

const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged out successfully",
        data: null
    })
})

const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const newPassword = req.body.newPassword
    const oldPassword = req.body.oldPassword
    const decodedToken = req.user

    await AuthServices.resetPassword(oldPassword, newPassword, decodedToken)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password change successfully",
        data: null
    })
})

const googleCallback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    let state = req.query.state ? req.query.state as string : ""
    if (state.startsWith("/")) {
        state = state.slice(1)
    }
    const user = req.user
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    const tokenInfo = createUserTokens(user)

    setAuthCookie(res, tokenInfo)

    // sendResponse(res, {
    //     success: true,
    //     statusCode: httpStatus.OK,
    //     message: "Password change successfully",
    //     data: null
    // })
    res.redirect(`${envVars.FRONTEND_URL}/${state}`)
})

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    googleCallback
}
