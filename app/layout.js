import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "TeamTask – Manage Teams & Tasks",
  description: "Organize projects, assign tasks, and track progress with a clean workflow designed for teams.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}