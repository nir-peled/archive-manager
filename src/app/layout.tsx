import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Publication Manager",
	description: "Fanfic Writer's Publication Manager",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
