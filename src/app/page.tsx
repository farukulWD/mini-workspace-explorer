import { UnsavedGuardProvider } from "@/components/editor/unsavedGuard";
import AppShell from "@/components/layout/appShell";
import MainPanel from "@/components/layout/mainPanel";
import SearchBox from "@/components/search/searchBox";
import WorkspaceTree from "@/components/tree/workspaceTree";

export default function Home() {
  return (
    <UnsavedGuardProvider>
      <AppShell sidebar={<WorkspaceTree />} topBar={<SearchBox />}>
        <MainPanel />
      </AppShell>
    </UnsavedGuardProvider>
  );
}
