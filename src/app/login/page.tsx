import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Вход — ResVault" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <LoginForm />
    </div>
  );
}
