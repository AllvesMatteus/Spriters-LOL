import React from "react";
import { Github, Linkedin, ExternalLink, Code2, GitFork, Star, ArrowLeft } from "lucide-react";

interface ContactPageProps {
  onBack?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-[680px] mx-auto px-4 py-16 text-[#e1e1e1]">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-10 px-4 py-2 liquid-glass rounded-lg text-[#9e9eb1] hover:text-white hover:border-white/20 transition-all duration-200 text-[13px] font-bold group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Voltar ao início
        </button>
      )}

      <div className="mb-12">
        <span className="text-[11px] font-black uppercase tracking-widest text-[#5de8c8]">Spriters LOL</span>
        <h1 className="text-[36px] font-black text-white mt-1 leading-none tracking-tight">Contato & Links</h1>
        <p className="text-[14px] text-[#9e9eb1] mt-3 leading-relaxed max-w-lg font-medium">
          O Spriters LOL é um projeto de código aberto e independente. Fique à vontade para sugerir melhorias, reportar problemas ou contribuir!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <a
          href="https://github.com/AllvesMatteus"
          target="_blank"
          rel="noreferrer"
          className="block group"
        >
          <div className="liquid-glass rounded-2xl p-6 flex items-center gap-5 hover:border-white/20 hover:bg-white/10 transition-all duration-300 shadow-xl h-full">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 group-hover:border-white/20 transition-colors">
              <Github className="w-7 h-7 text-[#e1e1e1]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-[#9e9eb1] uppercase tracking-wider mb-0.5">GitHub</p>
              <p className="text-[18px] font-black text-white truncate">AllvesMatteus</p>
              <p className="text-[12px] text-[#9e9eb1] truncate">github.com/AllvesMatteus</p>
            </div>
            <ExternalLink className="w-4 h-4 text-[#9e9eb1] group-hover:text-white transition-colors shrink-0" />
          </div>
        </a>

        <a
          href="https://linkedin.com/in/mateus-allves"
          target="_blank"
          rel="noreferrer"
          className="block group"
        >
          <div className="liquid-glass rounded-2xl p-6 flex items-center gap-5 hover:border-white/20 hover:bg-white/10 transition-all duration-300 shadow-xl h-full">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 group-hover:border-white/20 transition-colors">
              <Linkedin className="w-7 h-7 text-[#4c92fc]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-[#9e9eb1] uppercase tracking-wider mb-0.5">LinkedIn</p>
              <p className="text-[18px] font-black text-white truncate">Mateus Alves</p>
              <p className="text-[12px] text-[#9e9eb1] truncate">linkedin.com/in/mateus-allves</p>
            </div>
            <ExternalLink className="w-4 h-4 text-[#9e9eb1] group-hover:text-white transition-colors shrink-0" />
          </div>
        </a>
      </div>

      <a
        href="https://github.com/AllvesMatteus/Spriters-LOL"
        target="_blank"
        rel="noreferrer"
        className="block group mb-8"
      >
        <div className="liquid-glass rounded-2xl p-5 flex items-center gap-5 hover:border-white/20 hover:bg-white/10 transition-all duration-300 shadow-xl">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10 group-hover:border-white/20 transition-colors">
            <Code2 className="w-5 h-5 text-[#5de8c8]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black text-white">Spriters-LOL</p>
            <p className="text-[12px] text-[#9e9eb1]">Repositório público do projeto — aberto para contribuições</p>
          </div>
          <div className="flex items-center gap-3 text-[#9e9eb1] text-[11px] shrink-0 font-black">
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" /> Star</span>
            <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5 text-[#4c92fc]" /> Fork</span>
          </div>
        </div>
      </a>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { title: "Projeto em Beta", desc: "O sistema está em desenvolvimento ativo. Novos recursos são adicionados regularmente." },
          { title: "Contribuições", desc: "Pull requests são bem-vindos. Leia o README no repositório para entender a arquitetura." },
          { title: "Reporte um Bug", desc: "Encontrou algo errado? Abra uma issue no GitHub com o máximo de detalhes possível." },
          { title: "Sugestões", desc: "Tem uma ideia para melhorar o sistema? Crie uma issue com a tag 'enhancement'." },
        ].map(({ title, desc }) => (
          <div key={title} className="liquid-glass rounded-xl p-5 flex flex-col gap-2">
            <p className="text-[13px] font-black text-white">{title}</p>
            <p className="text-[12px] text-[#9e9eb1] leading-relaxed font-semibold">{desc}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-[10px] text-[#62636c] font-black mt-12">
        Spriters LOL não é afiliado ou patrocinado pela Riot Games.
      </p>
    </div>
  );
};
