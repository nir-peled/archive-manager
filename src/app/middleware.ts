import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { Middleware, MiddlewareFactory } from "./middlewares/types";
import { csrf_protection } from "./middlewares/csrf";
import { session_extender } from "./middlewares/session_extender";

export function stackMiddlewares(
	functions: MiddlewareFactory[] = [],
	index = 0
): Middleware {
	const current = functions[index];
	if (current) {
		const next = stackMiddlewares(functions, index + 1);
		return current(next);
	}
	return (_, response, __) => response;
}

const middlewares: MiddlewareFactory[] = [csrf_protection, session_extender];

export async function middleware(request: NextRequest, event: NextFetchEvent) {
	const middleware_stack = stackMiddlewares(middlewares);
	return middleware_stack(request, NextResponse.next(), event);
}

export const config = {
	matcher: "/((?!api|static|.*\\..*|_next|favicon.ico).*)",
};
