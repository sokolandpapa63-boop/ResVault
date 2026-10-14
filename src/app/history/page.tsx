import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header } from "@/components/header";
import { HistoryClient } from "@/components/history-client";

export const metadata = { title: "История — ResVault" };

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="relative z-10">
      <Header userName={session.user.name ?? "Пользователь"} />
      <main>
        <HistoryClient />
      </main>
    </div>
  );
}
