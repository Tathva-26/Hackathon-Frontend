// src/app/layout.js
import { Anton, Inter, Press_Start_2P, Roboto } from "next/font/google";
import Navbar from "./components/Navbar";
import ClientProviders from "./components/ClientProviders";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
const inter = Inter({ weight: ["400","500","600"], subsets: ["latin"], variable: "--font-inter" });
const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-press-start" });
const roboto = Roboto({ weight: ["400","500","600"], subsets: ["latin"], variable: "--font-roboto" });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} ${pressStart.variable} ${roboto.variable}`}>
      <body>
        <ClientProviders>
          <Navbar />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
