import { Schema } from "mongoose";
import { ITour } from "./tour.interface";

const tourSchema = new Schema<ITour>({},{
    timestamps:true
})