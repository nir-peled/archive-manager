import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

export type Middleware =
	| ((
			request: NextRequest,
			response: NextResponse,
			event: NextFetchEvent
	  ) => NextResponse)
	| ((
			request: NextRequest,
			response: NextResponse,
			event: NextFetchEvent
	  ) => Promise<NextResponse>);

export type MiddlewareFactory = (middleware: Middleware) => Middleware;
