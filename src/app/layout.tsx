import type { Metadata } from "next";
import "./globals.css";
import { ApolloClientProvider } from "@/lib/apolloProvider";

export const metadata: Metadata = {
  title: "GraphQL Workshop",
  description: "Fragment-driven data fetching with Apollo Client + Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <ApolloClientProvider>{children}</ApolloClientProvider>
      </body>
    </html>
  );
}
