import AppShell from "@/components/layout/appShell";
import MainPanel from "@/components/layout/mainPanel";
import Sidebar from "@/components/layout/sidebar";

export default function Home() {
  return (
    <AppShell sidebar={<Sidebar />}>
      <MainPanel />
    </AppShell>
  );
}
