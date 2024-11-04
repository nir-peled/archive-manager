import { NextRequest, NextFetchEvent, NextResponse } from "next/server";
import { MiddlewareFactory } from "./types";
import { session_cookie_settings } from "@/lib/session";

export const session_extender: MiddlewareFactory = (next) => {
	return async (request: NextRequest, response: NextResponse, _next: NextFetchEvent) => {
		const token = request.cookies.get("session")?.value ?? null;
		if (!token) return await next(request, response, _next);

		const session_length = Number(process.env.SESSION_LENGTH) / 1000;
		response.cookies.set("Session", token, {
			...session_cookie_settings(),
			maxAge: session_length,
		});
		return await next(request, response, _next);
	};
};
