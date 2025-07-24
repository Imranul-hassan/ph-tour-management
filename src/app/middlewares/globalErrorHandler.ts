import { envVars } from "../config/env"
import { NextFunction, Request, Response } from "express"
import AppError from "../errorHelpers/AppError"
import { any } from "zod"


export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    
    const errorSource : any=[

    ]
    let statusCode = 500
    let message = `Something went wrong!! ${err.message}`

    if(err.code === 11000){
        const matchedArray = err.message.match(/"([^"]*)"/)
        statusCode = 400
        message =`${matchedArray[1]} already exist!! `
    }

    else if(err.name === "CastError"){
        statusCode = 400;
        message = "Invalid MongoDB objectId"
    }

    else if(err.name === "ZodError"){
        message = "Zod Error"

        err.issues.forEach((issue: any)=>{
            errorSource.push({
                path: issue.path[0],
                message: issue.message
            })
        })
    }
    
    else if(err instanceof AppError){
        statusCode = err.statusCode
        message = err.message
    }

    res.status(statusCode).json({
        success: false,
        message,
        err,
        stack: envVars.NODE_ENV === "development" ? err.stack : null
    })
}