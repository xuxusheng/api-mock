import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Navbar } from "@/components/navbar";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/server/auth";

export const metadata: Metadata = {
  title: "API Mock Platform",
  description: "快速创建和管理 API 模拟接口",
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as "en" | "zh")) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const session = await auth();

  return (
    <NextIntlClientProvider messages={messages}>
      <SessionProvider session={session}>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster />
        </div>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}