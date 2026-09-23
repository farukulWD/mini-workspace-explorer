import AppShell from "@/components/layout/appShell";
import MainPanel from "@/components/layout/mainPanel";
import WorkspaceTree from "@/components/tree/workspaceTree";

export default function Home() {
  return (
    <AppShell sidebar={<WorkspaceTree />}>
      <MainPanel />
    </AppShell>
  );
}
