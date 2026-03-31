import React from "react";
import { Github, ExternalLink, Code2, GitFork, Star, ArrowLeft } from "lucide-react";

interface ContactPageProps {
  onBack?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-[680px] mx-auto px-4 py-16 text-[#e1e1e1]">
      
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-10 px-4 py-2 bg-[#1c1d21] border border-[#2b2c30] rounded-lg text-[#9e9eb1] hover:text-white hover:border-[#4c92fc]/40 hover:bg-[#212328] transition-all duration-200 text-[13px] font-bold group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Voltar ao início
        </button>
      )}

      <div className="text-center mb-12">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#4c92fc]">Spriters LOL</span>
        <h1 className="text-[32px] font-black mt-2 mb-3">Contato & Desenvolvedor</h1>
        <p className="text-[14px] text-[#9e9eb1] max-w-md mx-auto leading-relaxed">
          O Spriters LOL é um projeto independente em beta. Dúvidas, sugestões e contribuições são bem-vindas!
        </p>
      </div>

      
      <a
        href="https://github.com/AllvesMatteus"
        target="_blank"
        rel="noreferrer"
        className="block group"
      >
        <div className="bg-[#1c1d21] border border-[#2b2c30] rounded-2xl p-7 flex items-center gap-6 hover:border-[#4c92fc]/50 hover:bg-[#212328] transition-all duration-300 shadow-xl mb-4">
          <div className="w-16 h-16 bg-[#16171d] rounded-2xl flex items-center justify-center shrink-0 border border-[#2b2c30] group-hover:border-[#4c92fc]/40 transition-colors">
            <Github className="w-8 h-8 text-[#e1e1e1]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-[#9e9eb1] uppercase tracking-wider mb-0.5">GitHub</p>
            <p className="text-[20px] font-black text-white">AllvesMatteus</p>
            <p className="text-[13px] text-[#9e9eb1] mt-1">github.com/AllvesMatteus</p>
          </div>
          <ExternalLink className="w-5 h-5 text-[#9e9eb1] group-hover:text-[#4c92fc] transition-colors shrink-0" />
        </div>
      </a>

      
      <a
        href="https://github.com/AllvesMatteus/Spriters-LOL"
        target="_blank"
        rel="noreferrer"
        className="block group"
      >
        <div className="bg-[#1c1d21] border border-[#2b2c30] rounded-2xl p-5 flex items-center gap-5 hover:border-[#4c92fc]/50 hover:bg-[#212328] transition-all duration-300 shadow-xl mb-8">
          <div className="w-11 h-11 bg-[#16171d] rounded-xl flex items-center justify-center shrink-0 border border-[#2b2c30]">
            <Code2 className="w-5 h-5 text-[#4c92fc]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black text-white">Spriters-LOL</p>
            <p className="text-[12px] text-[#9e9eb1]">Repositório do projeto — aberto para contribuições</p>
          </div>
          <div className="flex items-center gap-3 text-[#9e9eb1] text-[12px] shrink-0">
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> Star</span>
            <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" /> Fork</span>
          </div>
        </div>
      </a>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { emoji: "🚀", title: "Projeto em Beta", desc: "O sistema está em desenvolvimento ativo. Novos recursos são adicionados regularmente." },
          { emoji: "🤝", title: "Contribuições", desc: "Pull requests são bem-vindos. Leia o README no repositório para entender a arquitetura." },
          { emoji: "🐛", title: "Reporte um Bug", desc: "Encontrou algo errado? Abra uma issue no GitHub com o máximo de detalhes possível." },
          { emoji: "💡", title: "Sugestões", desc: "Tem uma ideia para melhorar o sistema? Crie uma issue com a tag 'enhancement'." },
        ].map(({ emoji, title, desc }) => (
          <div key={title} className="bg-[#1c1d21] border border-[#2b2c30] rounded-xl p-5">
            <div className="text-[24px] mb-2">{emoji}</div>
            <p className="text-[13px] font-black text-white mb-1">{title}</p>
            <p className="text-[12px] text-[#9e9eb1] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-[#9e9eb1] opacity-50 mt-12">
        Spriters LOL não é afiliado à Riot Games.
      </p>
    </div>
  );
};
