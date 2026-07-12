import React from "react";
import logo from "../assets/images/logo/logo.png";

interface FooterProps {
  onNavigate?: (page: string) => void;
  isHome?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, isHome }) => {
  return (
    <footer className={`w-full ${isHome ? 'mt-4' : 'mt-24'} pb-8 text-center text-[#9e9eb1]`}>
      <div className="flex flex-wrap justify-center items-center gap-6 text-[12px] font-bold mb-4">
        <button
          onClick={() => onNavigate?.("privacy")}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Política de Privacidade
        </button>
        <button
          onClick={() => onNavigate?.("about")}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Sobre
        </button>
        <button
          onClick={() => onNavigate?.("contact")}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Contato
        </button>
      </div>

      <p className="text-[10px] sm:text-[11px] max-w-2xl mx-auto leading-relaxed opacity-60 mb-3 px-4">
        O sistema Spriters LOL não é endossado pela Riot Games e não reflete as opiniões da Riot Games ou de qualquer pessoa oficialmente envolvida na produção ou gerenciamento do League of Legends. League of Legends e Riot Games são marcas comerciais ou marcas registradas da Riot Games, Inc.
      </p>

      <div className="flex flex-col md:flex-row items-center justify-center gap-2.5 opacity-60 mt-4 mb-4">
        <img src={logo} alt="Spriters LOL" className="h-[18px] w-auto object-contain" />
        <span className="text-[10px]">© Spriters Corp. Todos os direitos reservados.</span>
      </div>
    </footer>
  );
};
