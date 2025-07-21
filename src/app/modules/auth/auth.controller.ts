import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes"
import { AuthServices } from "./auth.service";

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body)

    sendResponse(res,{
        success: true,
        statusCode: httpStatus.OK,
        message: "User login successfully",
        data: loginInfo
    })
})

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tokenInfo = await AuthServices.credentialsLogin(req.body)

    sendResponse(res,{
        success: true,
        statusCode: httpStatus.OK,
        message: "User login successfully",
        data: tokenInfo
    })
})

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken
}
