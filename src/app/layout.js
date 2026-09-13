import { Anton, Inter, Press_Start_2P, Roboto } from "next/font/google";
import Navbar from "./components/Navbar";
import ClientProviders from "./components/ClientProviders";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
const inter = Inter({ weight: ["400","500","600"], subsets: ["latin"], variable: "--font-inter" });
const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-press-start" });
const roboto = Roboto({ weight: ["400","500","600"], subsets: ["latin"], variable: "--font-roboto" });

export const metadata = {
  title: "TatHack '26 | Tathva NIT Calicut",
  description: "TatHack '26 Flagship Hackathon at Tathva NIT Calicut!",
  icons: {
    icon: "/assets/simon.png",
    shortcut: "/assets/simon.png",
    apple: "/assets/simon.png",
  },
};

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
