import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, default: null },
    email: { type: String, unique: true, default: null },
    phoneNumber: { type: String, unique: true },
    priceRange: { type: Number, default: null },
    preferences: {
        categories: [String],
        orders: [String]
    }
});

const User = mongoose.model("User", UserSchema);

export default User;