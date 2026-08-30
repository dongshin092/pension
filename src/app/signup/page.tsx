import Link from "next/link";
import { redirect } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { getCurrentUser } from "@/lib/auth";
import SignupForm from "./SignupForm";

export const metadata = { title: "회원가입" };
export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/mypage");

  return (
    <AuthShell
      title="회원가입"
      description="가입은 1분이면 끝납니다. 예약할 때마다 이름과 연락처를 다시 쓰지 않아도 됩니다."
      footer={
        <>
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-semibold text-forest-700 hover:underline">
            로그인
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
