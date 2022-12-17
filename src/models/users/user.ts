import {model, Schema, Document} from "mongoose"

export {
    IUser,
    User
}

interface IUser extends Document {
    id?: string;
    firstName: string;
    lastName?: string;
    role: string | undefined;
    email: string;
    password: string;
    verificationToken?: string;
    verifiedAt: Date;
    authorizationToken?: string
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
        verifiedAt: { type: Date },
        authorizationToken: { type: String }
    },
    {
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (doc, ret) => {
                delete ret._id
                delete ret.password
                delete ret.verificationToken
                delete ret.authorizationToken
            }
        },
        timestamps: true
    }
)

userSchema.virtual( 'isVerified' ).get( function () {
    return this.verifiedAt !== undefined
})

const User = model<IUser>('User', userSchema)
