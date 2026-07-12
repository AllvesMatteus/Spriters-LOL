import React from "react";
import { Github, Linkedin } from "lucide-react";

interface ContactPageProps {
  onBack?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-[680px] mx-auto px-4 py-16 text-[#e1e1e1]">
      {onBack && (
        <button
          onClick={onBack}
          className="text-[12px] text-[#9e9eb1] hover:text-[#5de8c8] transition-colors mb-8 cursor-pointer block font-bold"
        >
          Voltar ao início
        </button>
      )}

      <div className="mb-12">
        <h1 className="text-[36px] font-black text-white mt-1 leading-none tracking-tight">Contato</h1>
        <p className="text-[14px] text-[#9e9eb1] mt-3 leading-relaxed max-w-lg font-medium">
          Caso tenha alguma sugestão, feedback ou queira apenas bater um papo sobre o projeto, sinta-se à vontade para me contatar através de um dos canais abaixo.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <a
          href="https://github.com/AllvesMatteus"
          target="_blank"
          rel="noreferrer"
          className="block group"
        >
          <div className="liquid-glass rounded-2xl p-6 hover:border-white/20 hover:bg-white/10 transition-all duration-300 shadow-xl h-full flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10 group-hover:border-white/20 transition-colors">
              <Github className="w-6 h-6 text-[#e1e1e1]" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-[#9e9eb1] uppercase tracking-wider mb-0.5">GitHub</p>
              <p className="text-[17px] font-black text-white group-hover:text-[#5de8c8] transition-colors truncate">AllvesMatteus</p>
              <p className="text-[11px] text-[#9e9eb1] truncate mt-0.5">github.com/AllvesMatteus</p>
            </div>
          </div>
        </a>

        <a
          href="https://linkedin.com/in/mateus-allves"
          target="_blank"
          rel="noreferrer"
          className="block group"
        >
          <div className="liquid-glass rounded-2xl p-6 hover:border-white/20 hover:bg-white/10 transition-all duration-300 shadow-xl h-full flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10 group-hover:border-white/20 transition-colors">
              <Linkedin className="w-6 h-6 text-[#4c92fc]" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-[#9e9eb1] uppercase tracking-wider mb-0.5">LinkedIn</p>
              <p className="text-[17px] font-black text-white group-hover:text-[#5de8c8] transition-colors truncate">Mateus Alves</p>
              <p className="text-[11px] text-[#9e9eb1] truncate mt-0.5">linkedin.com/in/mateus-allves</p>
            </div>
          </div>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            title: "Desenvolvimento Ativo",
            desc: "O sistema passa por atualizações e otimizações constantes para garantir melhor performance e fidelidade estatística em jogo."
          },
          {
            title: "Feedbacks e Sugestões",
            desc: "Se você encontrar algum comportamento inesperado ou tiver ideias de melhoria para o dashboard, envie pelo LinkedIn."
          }
        ].map(({ title, desc }) => (
          <div key={title} className="liquid-glass rounded-2xl p-6 shadow-xl flex flex-col gap-2">
            <h3 className="text-[14px] font-black text-white">{title}</h3>
            <p className="text-[12px] text-[#9e9eb1] leading-relaxed font-semibold">{desc}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-[10px] text-[#62636c] font-black mt-16">
        Spriters LOL não é afiliado ou patrocinado pela Riot Games.
      </p>
    </div>
  );
};
