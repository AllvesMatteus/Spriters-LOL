import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-24 pb-8 text-center text-[#9e9eb1]">
      <div className="flex flex-wrap justify-center items-center gap-6 text-[12px] font-bold mb-4">
        <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
        <a href="#" className="hover:text-white transition-colors">Contato</a>
        <a href="#" className="hover:text-white transition-colors">Registrar-se</a>
        <a href="#" className="hover:text-white transition-colors">Trabalhe conosco</a>
      </div>
      
      <p className="text-[10px] sm:text-[11px] max-w-2xl mx-auto leading-relaxed opacity-60 mb-3 px-4">
        O sistema Spriters LOL não é endossado pela Riot Games e não reflete as opiniões da Riot Games ou de qualquer pessoa oficialmente envolvida na produção ou gerenciamento do League of Legends. League of Legends e Riot Games são marcas comerciais ou marcas registradas da Riot Games, Inc.
      </p>

      <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 opacity-60 mt-4 mb-4">
        <span className="text-[12px] font-black tracking-widest text-[#4c92fc]">SPRITERS LOL</span>
        <span className="text-[10px]">© Spriters Corp. Todos os direitos reservados.</span>
      </div>
    </footer>
  );
};
