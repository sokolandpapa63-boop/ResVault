import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header } from "@/components/header";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="relative z-10">
      <Header userName={session.user.name ?? "Пользователь"} />
      <main>
        <DashboardClient userName={session.user.name ?? "Пользователь"} />
      </main>
    </div>
  );
}
