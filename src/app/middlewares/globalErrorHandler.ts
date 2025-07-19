import { envVars } from "../config/env"
import { NextFunction, Request, Response } from "express"

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    
    const statusCode = 500
    const message = `Something went wrong!! ${err.message}`
    
    res.status(statusCode).json({
        success: false,
        message,
        err,
        stack: envVars.NODE_ENV === "development" ? err.stack : null
    })
}