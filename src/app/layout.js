
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./mycomponents/Navbar";
import Footer from "./mycomponents/footer";
import Providers from "./providers";
import Breadcrumbs from "./mycomponents/Breadcrumbs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Princely - Luxury Jewelry Store",
  description: "Discover exquisite jewelry pieces at Princely",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <div className="lg:w-[1440px] mx-auto">
            <Navbar />
            <Breadcrumbs />
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
