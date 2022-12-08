import {model, Schema} from "mongoose"

export {
    IUser,
    User
}

interface IUser {
    _id: string;
    firstName: string;
    lastName?: string | null;
    role: string | undefined;
    email: string;
    password: string;
}

const userSchema = new Schema<IUser>(
    {
        // _id: Number, // Set automatically by mongoose
        firstName: { type: String, required: true },
        lastName: { type: String },
        role: { type: String },
        email: { type: String, required: true },
        password: { type: String, required: true, select: false }
    },
    {
        timestamps: true
    }
)

const User = model<IUser>('User', userSchema)
