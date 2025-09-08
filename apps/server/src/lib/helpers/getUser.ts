import { type Request } from "express";

export function getUser(req: Request) {
    // @ts-ignore
    return req.user
}

