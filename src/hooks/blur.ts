// src/components/hooks/blur.ts
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAuthStore } from "@/store/authStore";

const useBlurEffect = () => {
  const [blur, setBlur] = useState(true);
  const { ready, authenticated } = usePrivy();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const checkBlur = () => {
      setBlur(!(ready && authenticated && token));
    };

    checkBlur();
    const interval = setInterval(checkBlur, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [ready, authenticated, token]);

  return blur;
};

export default useBlurEffect;
