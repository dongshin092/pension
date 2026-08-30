import Link from "next/link";
import { redirect } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "로그인" };
export const dynamic = "force-dynamic";

export default async function LoginPage(props: PageProps<"/login">) {
  const user = await getCurrentUser();
  if (user) redirect("/mypage");

  const params = await props.searchParams;
  const raw = typeof params.next === "string" ? params.next : "";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/mypage";

  return (
    <AuthShell
      title="로그인"
      description="예약 내역 확인과 빠른 재예약을 위해 로그인해 주세요."
      footer={
        <>
          아직 회원이 아니신가요?{" "}
          <Link href="/signup" className="font-semibold text-forest-700 hover:underline">
            회원가입
          </Link>
          <span className="mx-2 text-forest-200">|</span>
          <Link href="/reservation" className="text-forest-500 hover:underline">
            비회원으로 예약하기
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
