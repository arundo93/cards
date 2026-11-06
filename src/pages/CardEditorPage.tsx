import { CardEditor } from "../components/CardEditor";
import { useWallet } from "../context/WalletContext";
import { useCardRoute } from "../hooks/useCardRoute";
import { CardMissing } from "./CardMissing";
export function CardEditorPage({ create = false }: { create?: boolean }) {
  const { save } = useWallet();
  const { card, close } = useCardRoute();
  if (!create && !card) return <CardMissing onClose={close} />;
  return (
    <CardEditor
      key={create ? "new" : card?.id}
      card={create ? undefined : card}
      onClose={close}
      onSave={async (value) => {
        await save(value);
        close();
      }}
    />
  );
}
