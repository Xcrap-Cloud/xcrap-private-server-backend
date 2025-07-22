export interface JwtAccessPayload {
    sub: string
    username: string
    name: string
    email: string
    role: string
}

export interface JwtRefreshPayload {
    sub: string
}
