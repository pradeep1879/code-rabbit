import LoginUI from "@/module/components/login-ui";
import { requireUnAuth } from "@/module/utils/auth-utils";
import { Suspense } from "react";

async function LoginGate() {
  await requireUnAuth();
  return <LoginUI />;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-black text-white" />}
    >
      <LoginGate />
    </Suspense>
  );
}
