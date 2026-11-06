import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect, useState } from "react";

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
export function usePwaState() {
  const [online, setOnline] = useState(navigator.onLine);
  const [install, setInstall] = useState<InstallPrompt | null>(null);
  const [installHelp, setInstallHelp] = useState(false);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW();
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    const prompt = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallPrompt);
    };
    const installed = () => {
      setInstall(null);
      setInstallHelp(false);
    };
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    window.addEventListener("beforeinstallprompt", prompt);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      window.removeEventListener("beforeinstallprompt", prompt);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  async function installApp() {
    try {
      if (install) {
        await install.prompt();
        await install.userChoice;
        setInstall(null);
      } else setInstallHelp(true);
    } catch {
      setInstallHelp(true);
    }
  }
  return {
    online,
    offlineReady,
    installHelp,
    setInstallHelp,
    installApp,
    needRefresh,
    setNeedRefresh,
    updateServiceWorker,
  };
}
