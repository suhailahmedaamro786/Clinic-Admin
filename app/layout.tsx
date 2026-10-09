import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Clinic Admin | SkinCare Clinic", description: "Secure clinic appointment management dashboard." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
