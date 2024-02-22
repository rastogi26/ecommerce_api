import mongoose,{Schema} from "mongoose";

const orderItemSchema = new Schema({
  quantity: {
    type: Number,
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
},{timestamps:true});

export const OrderItem = mongoose.model("OrderItem", orderItemSchema);
