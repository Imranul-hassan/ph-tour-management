import { Request, Response } from "express";
import { User } from "./user.model";
import httpStatus from "http-status-codes"

const createUser = async (req: Request, res: Response)=>{
    try{
        const {name, email} = req.body;
        const user = await User.create({
            name,
            email
        })

        res.status(httpStatus.CREATED).json({
            message: "User created successfully",
            user
        })

    }catch(err: any){
        console.log(err);
        res.status(400).json({
            message: `Something wrong!! ${err.message}`,
            err
        })
    }
}

export const UserControllers = {
    createUser
}