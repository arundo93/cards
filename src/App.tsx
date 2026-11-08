import { HashRouter, Route, Routes } from "react-router-dom";
import { PwaProvider } from "./context/PwaContext";
import { WalletProvider } from "./context/WalletContext";
import { AppShell } from "./layouts/AppShell";
import { CardEditorPage } from "./pages/CardEditorPage";
import { DeleteCardPage } from "./pages/DeleteCardPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SettingsPage } from "./pages/SettingsPage";
import { WalletPage } from "./pages/WalletPage";
export default function App() {
  return (
    <HashRouter>
      <WalletProvider>
        <PwaProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<WalletPage />}>
                <Route path="cards/new" element={<CardEditorPage create />} />
                <Route path="cards/:id/edit" element={<CardEditorPage />} />
                <Route path="cards/:id/delete" element={<DeleteCardPage />} />
              </Route>
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </PwaProvider>
      </WalletProvider>
    </HashRouter>
  );
}
