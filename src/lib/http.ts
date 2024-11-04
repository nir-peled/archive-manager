import { JsonValue } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";

export namespace HTTPResponseCodes {
	export function success(body: JsonValue = null) {
		return response_with_status(200, body);
	}

	export function bad_request(body: JsonValue = null) {
		return response_with_status(400, body);
	}

	export function request_unauthorized(body: JsonValue = null) {
		return response_with_status(401, body);
	}

	export function forbidden(body: JsonValue = null) {
		return response_with_status(403, body);
	}

	export function not_found(body: JsonValue = null) {
		return response_with_status(404, body);
	}

	export function method_forbidden(body: JsonValue = null) {
		return response_with_status(405, body);
	}

	export function server_error(body: JsonValue = null) {
		return response_with_status(500, body);
	}

	export function response_with_status(status: number, body: JsonValue = null) {
		let body_raw = body != null ? JSON.stringify(body) : null;
		return new NextResponse<string | null>(body_raw, { status });
	}
}
