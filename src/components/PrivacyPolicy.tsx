import React from "react";
import { ChevronLeft } from "lucide-react";

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="max-w-[760px] mx-auto px-4 py-16 text-[#e1e1e1]">
      <div className="mb-10">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-[11px] text-[#9e9eb1] hover:text-[#4c92fc] transition-colors mb-6 group"
          >
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Início
          </button>
        )}
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#4c92fc]">Spriters LOL</span>
        <h1 className="text-[32px] font-black mt-2 mb-1">Política de Privacidade</h1>
        <p className="text-[13px] text-[#9e9eb1]">Última atualização: Março de 2026</p>
      </div>

      {[
        {
          title: "1. Informações que Coletamos",
          content: `O Spriters LOL não coleta, armazena nem processa dados pessoais identificáveis dos usuários. Toda a análise de desempenho é feita com base nos dados públicos da API oficial da Riot Games, mediante o Riot ID (nome de jogo + tag) informado voluntariamente pelo usuário na busca.`
        },
        {
          title: "2. Uso da API da Riot Games",
          content: `Este sistema utiliza a API pública da Riot Games para buscar dados de partidas, sumoners e ranque. Esses dados são de acesso público e estão disponíveis conforme os Termos de Serviço da Riot Games. Não acessamos dados privados de conta ou informações vinculadas ao login da Riot.`
        },
        {
          title: "3. Armazenamento Local",
          content: `O Spriters LOL pode armazenar buscas recentes no armazenamento local (localStorage) do seu navegador para facilitar o acesso rápido. Esses dados ficam apenas no seu dispositivo e não são enviados a nenhum servidor.`
        },
        {
          title: "4. Cookies",
          content: `Não utilizamos cookies de rastreamento, publicidade ou análise de terceiros. Qualquer uso de armazenamento do navegador é exclusivamente funcional, para persistência de preferências como região ou buscas recentes.`
        },
        {
          title: "5. Compartilhamento de Dados",
          content: `Não vendemos, alugamos nem compartilhamos dados de usuários com terceiros. As únicas requisições externas feitas pelo sistema são direcionadas à API oficial da Riot Games e à CDN pública do Data Dragon (imagens de campeões, itens e runas).`
        },
        {
          title: "6. Segurança",
          content: `Adotamos boas práticas de desenvolvimento seguro. A chave de API da Riot Games é mantida no lado do servidor (nunca exposta ao cliente), e todas as requisições são feitas através do nosso backend proxy.`
        },
        {
          title: "7. Contato",
          content: `Em caso de dúvidas sobre esta Política de Privacidade, entre em contato através do nosso repositório público no GitHub: github.com/AllvesMatteus`
        },
      ].map(({ title, content }) => (
        <div key={title} className="mb-8 bg-[#1c1d21] border border-[#2b2c30] rounded-xl p-6">
          <h2 className="text-[16px] font-black text-[#4c92fc] mb-3">{title}</h2>
          <p className="text-[14px] text-[#9e9eb1] leading-relaxed">{content}</p>
        </div>
      ))}

      <div className="text-center mt-12 text-[11px] text-[#9e9eb1] opacity-60">
        <p>Spriters LOL não é endossado pela Riot Games.</p>
        <p>League of Legends é uma marca registrada da Riot Games, Inc.</p>
      </div>
    </div>
  );
};
