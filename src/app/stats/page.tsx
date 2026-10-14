import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header } from "@/components/header";
import { StatsClient } from "@/components/stats-client";

export const metadata = { title: "Статистика — ResVault" };

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="relative z-10">
      <Header userName={session.user.name ?? "Пользователь"} />
      <main>
        <StatsClient />
      </main>
    </div>
  );
}
