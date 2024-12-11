import "./globals.css";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import AuthButton from "@/components/AuthButton";
import Navigation from "@/components/Navigation";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BlockParty",
  description: "Modern apartment house party app",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className + " min-h-screen bg-gradient-to-br from-gray-900 to-gray-800"}>
        <Providers session={session}>
          <div className="container mx-auto px-4">
            <header className="py-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">BlockParty</h1>
                <Navigation />
              </div>
              <AuthButton />
            </header>
            <main>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
