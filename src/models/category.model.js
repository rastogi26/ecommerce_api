import mongoose,{Schema} from "mongoose";


const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
  },
  color: {
    type: String,
  },
},{timestamps: true});

export const Category = mongoose.model("Category", categorySchema);