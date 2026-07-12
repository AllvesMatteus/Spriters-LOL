import React from "react";

interface AboutPageProps {
  onBack?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-[680px] mx-auto px-4 py-16 text-[#e1e1e1]">
      {onBack && (
        <button
          onClick={onBack}
          className="text-[12px] text-[#9e9eb1] hover:text-[#4c92fc] transition-colors mb-8 cursor-pointer block font-bold"
        >
          Voltar ao início
        </button>
      )}

      <div className="mb-12">
        <h1 className="text-[36px] font-black text-white mt-1 leading-none tracking-tight">O Projeto</h1>
        <p className="text-[14px] text-[#9e9eb1] mt-3 leading-relaxed max-w-lg font-medium">
          Uma plataforma de análise de estatísticas desenvolvida de forma independente para League of Legends, focada em aprimoramento e estudos.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="liquid-glass rounded-2xl p-6 shadow-xl">
          <h3 className="text-[16px] font-black text-white mb-1.5">Fins Educacionais e de Estudo</h3>
          <p className="text-[13px] text-[#9e9eb1] leading-relaxed font-semibold">
            Este projeto foi construído puramente para fins educacionais, acadêmicos e como laboratório prático de desenvolvimento de software. Ele serve para demonstrar a integração de APIs REST, manipulação de estados complexos em React e implementação de um sistema de design moderno.
          </p>
        </div>

        <div className="liquid-glass rounded-2xl p-6 shadow-xl">
          <h3 className="text-[16px] font-black text-white mb-1.5">Inspiração e Identidade</h3>
          <p className="text-[13px] text-[#9e9eb1] leading-relaxed font-semibold">
            O nome "Spriters" e o design visual começaram como uma piada e brincadeira saudável entre amigos, inspirando-se de forma satírica em uma clássica marca de refrigerante de limão. O logotipo e a identidade visual prestam uma homenagem humorística a essa referência, sem qualquer associação oficial, intenção comercial ou intuito de infringir direitos de propriedade intelectual da respectiva marca.
          </p>
        </div>

        <div className="liquid-glass rounded-2xl p-6 shadow-xl">
          <h3 className="text-[16px] font-black text-white mb-1.5">Melhoria de Performance e Estatísticas</h3>
          <p className="text-[13px] text-[#9e9eb1] leading-relaxed font-semibold">
            O objetivo prático do sistema é fornecer análises limpas do histórico de partidas para ajudar jogadores a entenderem seus pontos fracos e fortes. Através de dados simplificados e estruturados de desempenho, a ferramenta auxilia na evolução tática e na visualização de metas para subir de elo.
          </p>
        </div>
      </div>

      <p className="text-center text-[10px] text-[#62636c] font-black mt-16">
        Spriters LOL é um projeto de fã de uso não comercial e não é afiliado ou endossado pela Riot Games ou por detentores de marcas comerciais citadas.
      </p>
    </div>
  );
};
