import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
export function useCardRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { cards, setActiveId } = useWallet();
  const card = cards.find((item) => item.id === id);
  useEffect(() => {
    if (card) setActiveId(card.id);
  }, [card, setActiveId]);
  function close() {
    if (location.state?.walletDialog) navigate(-1);
    else navigate("/", { replace: true });
  }
  return { card, close, navigate };
}
