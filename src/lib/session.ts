import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import type { User, Session } from "@prisma/client";
import { sha256 } from "@oslojs/crypto/sha2";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cache } from "react";

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

export function generate_session_token(): string {
	const token_size = Number(process.env.SESSION_TOKEN_SIZE);
	const bytes = new Uint8Array(token_size);
	crypto.getRandomValues(bytes);

	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function create_session(token: string, user_id: bigint): Promise<Session> {
	const expires_at = get_session_expires_at();
	const session_id = get_session_id(token);

	const session: Session = {
		id: session_id,
		user_id,
		expires_at,
	};
	await prisma.session.create({
		data: session,
	});

	return session;
}

export async function validate_session_token(
	token: string
): Promise<SessionValidationResult> {
	const session_id = get_session_id(token);
	const result = await prisma.session.findUnique({
		where: { id: session_id },
		include: { user: true },
	});
	if (result == null) return { user: null, session: null };

	const { user, ...session } = result;

	if (Date.now() > session.expires_at.getTime()) {
		await invalidate_session(session_id);
		return { user: null, session: null };
	}

	if (is_session_renewal_time(session.expires_at)) await renew_session_in_db(session);

	return { session, user };
}

export async function invalidate_session(session_id: string): Promise<void> {
	prisma.session.delete({ where: { id: session_id } });
}

export async function set_session_token_cookie(
	token: string,
	expires_at: Date
): Promise<void> {
	const cookies_storage = await cookies();
	cookies_storage.set("session", token, {
		...session_cookie_settings(),
		expires: expires_at,
	});
}

export async function delete_session_token_cookie(): Promise<void> {
	const cookies_storage = await cookies();
	cookies_storage.set("session", "", {
		...session_cookie_settings(),
		maxAge: 0,
	});
}

export function session_cookie_settings(): Partial<ResponseCookie> {
	return {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
	};
}

export const get_current_session = cache(async (): Promise<SessionValidationResult> => {
	const cookies_storage = await cookies();
	const token = cookies_storage.get("session")?.value ?? null;
	if (!token) return { session: null, user: null };

	const result = await validate_session_token(token);
	return result;
});

function get_session_expires_at(): Date {
	const session_length = Number(process.env.SESSION_LENGTH);

	return new Date(Date.now() + session_length);
}

function is_session_renewal_time(expires_at: Date): boolean {
	const session_length = Number(process.env.SESSION_LENGTH);

	return Date.now() >= expires_at.getTime() + session_length;
}

function get_session_id(token: string): string {
	const encoded_token = sha256(new TextEncoder().encode(token));
	return encodeHexLowerCase(encoded_token);
}

async function renew_session_in_db(session: Session) {
	session.expires_at = get_session_expires_at();

	await prisma.session.update({
		where: { id: session.id },
		data: {
			expires_at: session.expires_at,
		},
	});
}
