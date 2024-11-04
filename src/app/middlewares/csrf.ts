import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "./types";
import { HTTPResponseCodes } from "@/lib/http";

export const csrf_protection: MiddlewareFactory = (next) => {
	return async (request: NextRequest, response: NextResponse, _next: NextFetchEvent) => {
		if (request.method == "GET") return await next(request, response, _next);

		const origin_header = request.headers.get("Origin");
		const host_header = request.headers.get("Host");
		if (!origin_header || !host_header) return HTTPResponseCodes.forbidden();

		let origin: URL;
		try {
			origin = new URL(origin_header);
		} catch {
			return HTTPResponseCodes.forbidden();
		}

		if (origin.host != host_header) return HTTPResponseCodes.forbidden();
		return await next(request, response, _next);
	};
};
