
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// No need to call GeistSans or GeistMono as functions,
// they are objects with `variable` and `className` properties.

export const metadata: Metadata = {
  title: 'MemeAscii - AI Powered ASCII Art Memes',
  description: 'Turn images into AI-powered ASCII memes with customization and sharing options.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark"> {/* Set dark mode globally for consistency with theme */}
      {/*
        Use GeistSans.variable and GeistMono.variable directly.
        These properties provide the CSS variable names (e.g., '--font-geist-sans').
        The `font-sans` class in `globals.css` (via Tailwind base) will then use this variable.
      */}
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
