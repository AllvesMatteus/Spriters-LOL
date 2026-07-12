import React from "react";

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
        <h1 className="text-[36px] font-black text-white mt-1 leading-none tracking-tight">Política de Privacidade</h1>
        <p className="text-[14px] text-[#9e9eb1] mt-3 leading-relaxed max-w-lg font-medium">
          Última atualização: Março de 2026
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {[
          {
            title: "1. Informações que Coletamos",
            content: "O Spriters LOL não coleta, armazena nem processa dados pessoais identificáveis dos usuários. Toda a análise de desempenho é feita com base nos dados públicos da API oficial da Riot Games, mediante o Riot ID informado de forma voluntária pelo usuário na busca."
          },
          {
            title: "2. Uso da API da Riot Games",
            content: "Este sistema utiliza a API pública da Riot Games para buscar dados de partidas, invocadores e ranques. Esses dados são de acesso público e estão disponíveis conforme os Termos de Serviço da Riot Games. Não acessamos dados privados de contas ou informações vinculadas a credenciais de login."
          },
          {
            title: "3. Armazenamento Local e Cookies",
            content: "O Spriters LOL utiliza cookies locais para armazenar suas buscas recentes, favoritos e preferências, facilitando o acesso rápido e aprimorando sua experiência. Esses dados ficam armazenados exclusivamente no seu próprio dispositivo e não são enviados a servidores externos."
          },
          {
            title: "4. Política de Rastreadores",
            content: "Não utilizamos cookies de rastreamento, publicidade ou análise de terceiros. Qualquer uso de armazenamento do navegador é estritamente funcional (como aceitação dos termos ou histórico recente)."
          },
          {
            title: "5. Compartilhamento de Dados",
            content: "Não vendemos, alugamos nem compartilhamos dados de usuários com terceiros. As únicas requisições externas feitas pelo sistema são direcionadas à API oficial da Riot Games e à CDN pública do Data Dragon (imagens de campeões, itens e runas)."
          },
          {
            title: "6. Segurança",
            content: "Adotamos boas práticas de desenvolvimento seguro. A chave de API da Riot Games é mantida protegida no lado do servidor, e todas as requisições são feitas através de rotas seguras do nosso backend proxy."
          },
          {
            title: "7. Contato",
            content: "Em caso de dúvidas sobre esta Política de Privacidade ou termos do sistema, você pode entrar em contato através dos nossos canais informados na seção de contato do projeto."
          }
        ].map(({ title, content }) => (
          <div key={title} className="liquid-glass rounded-2xl p-6 shadow-xl">
            <h3 className="text-[16px] font-black text-white mb-1.5">{title}</h3>
            <p className="text-[13px] text-[#9e9eb1] leading-relaxed font-semibold">{content}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-[10px] text-[#62636c] font-black mt-16">
        Spriters LOL não é endossado pela Riot Games. League of Legends é uma marca registrada da Riot Games, Inc.
      </p>
    </div>
  );
};
