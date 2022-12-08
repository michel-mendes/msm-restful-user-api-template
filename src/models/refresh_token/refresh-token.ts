import {model, Schema} from "mongoose"

export {
    IRefreshToken,
    RefreshToken
}

interface IRefreshToken {
    user: object,
    token: string,
    createdByIp: string,
    expiresAt: Date,
    createdAt: Date,
    updatedAt: Date,
    revokedAt: Date | undefined,
    revokedByIp: string | undefined,
    replacedByToken: string
    isExpired: boolean | undefined
}

const refreshTokenSchema = new Schema<IRefreshToken>({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    token: { type: String },
    createdByIp: { type: String },
    expiresAt: { type: Date },
    revokedAt: { type: Date },
    revokedByIp: { type: String },
    replacedByToken: { type: String }
});

refreshTokenSchema.virtual( 'isExpired' ).get( function () {
    return ( new Date(Date.now()) ) >= this.expiresAt
})

refreshTokenSchema.virtual( 'isActive' ).get( function () {
    return !this.revokedAt && !this.isExpired
})

const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema)