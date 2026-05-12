import SetupClient from "./SetupClient";

export default function SetupPage() {
  const hasToken = !!process.env.SUPABASE_MANAGEMENT_TOKEN;
  return <SetupClient hasToken={hasToken} />;
}
