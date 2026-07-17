import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginWithSignature, requestNonce } from "@/services/authService";
import { apiErrorMessage } from "@/services/apiClient";
import { connectWallet, signMessage, type WalletConnectionMethod } from "@/services/walletService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";

export function useWalletAuth() {
  const [connecting, setConnecting] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();

  async function connectAndLogin(method: WalletConnectionMethod = "injected") {
    setConnecting(true);
    try {
      const wallet = await connectWallet(method);
      const { message } = await requestNonce(wallet);
      const signature = await signMessage(message);
      const { accessToken, user } = await loginWithSignature(wallet, signature);
      setSession(accessToken, user);
      toast({ title: "Wallet connected", description: `Signed in as ${wallet.slice(0, 6)}…${wallet.slice(-4)}`, variant: "success" });
      navigate("/dashboard");
    } catch (error) {
      toast({ title: "Sign-in failed", description: apiErrorMessage(error), variant: "destructive" });
    } finally {
      setConnecting(false);
    }
  }

  return { connectAndLogin, connecting };
}
