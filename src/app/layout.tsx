import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import AuthButton from "@/components/AuthButton";
import Navigation from "@/components/Navigation";
import Providers from "@/components/Providers";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

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
    <html lang="en" className="dark">
      <body className={spaceGrotesk.className}>
        <Providers session={session}>
          <div className="min-h-screen bg-[#0F172A]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <header className="py-6 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-8">
                  <h1 className="text-2xl font-bold gradient-text">BlockParty</h1>
                  <Navigation />
                </div>
                <AuthButton />
              </header>
              <main className="py-8">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
