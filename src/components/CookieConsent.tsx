import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { getCookie, setCookie } from "../utils/cookies";

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = getCookie("cookie_consent_accepted");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setCookie("cookie_consent_accepted", "true", 365);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg"
        >
          <div className="bg-[#1e2029] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-[#2b2c30] p-3 rounded-full flex-shrink-0">
              <Cookie className="w-6 h-6 text-[#9e9eb1]" />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-white font-semibold text-sm mb-1">Aviso de Cookies e Plugins</h3>
              <p className="text-[#9e9eb1] text-xs leading-relaxed">
                Utilizamos cookies e plugins apenas para funcionalidades essenciais, como salvar seus favoritos e histórico de buscas recentes. Não realizamos rastreamento para anúncios.
              </p>
            </div>

            <button
              onClick={handleAccept}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#5de8c8] to-[#45c3a5] text-[#12131a] font-bold text-sm rounded-lg hover:shadow-[0_0_15px_rgba(93,232,200,0.4)] transition-all flex-shrink-0"
            >
              Entendi e Aceito
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
