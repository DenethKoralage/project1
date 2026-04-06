import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

export const metadata = {
  title: "The Financial Freedom",
  description: "A frontend-only financial education site built with Next.js.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen flex flex-col items-center pt-28">
        <Navbar />
        <div className="flex-grow w-full max-w-5xl px-4 ">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
