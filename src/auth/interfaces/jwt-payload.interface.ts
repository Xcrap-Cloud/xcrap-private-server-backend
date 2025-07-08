export interface JwtAccessPayload {
    sub: string
    username: string
    email: string
    role: string
}

export interface JwtRefreshPayload {
    sub: string
}
