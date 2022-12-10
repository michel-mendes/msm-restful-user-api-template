import {model, Schema} from "mongoose"

export {
    IUser,
    User
}

interface IUser {
    id?: string;
    firstName: string;
    lastName?: string;
    role: string | undefined;
    email: string;
    password: string;
    verificationToken?: string;
    verifiedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        // _id: Number, // Set automatically by mongoose
        firstName: { type: String, required: true },
        lastName: { type: String },
        role: { type: String },
        email: { type: String, required: true },
        password: { type: String, required: true },
        verificationToken: { type: String },
        verifiedAt: { type: Date }
    },
    {
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (doc, ret) => {
                delete ret._id
                delete ret.password
            }
        },
        timestamps: true
    }
)

const User = model<IUser>('User', userSchema)
