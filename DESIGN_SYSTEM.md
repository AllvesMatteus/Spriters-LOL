# 💎 Spriters LOL — Design System

Este documento estabelece o sistema de design visual do **Spriters LOL**, consolidando os tokens visuais, tipografia, paleta de cores e padrões de interface (UI) para manter a consistência e a alta fidelidade estética por toda a aplicação.

---

## 🌌 1. Diretrizes de Design: Liquid Glass

O sistema de design baseia-se na estética de **Glassmorphism (vidro líquido)** sobre fundos escuros e profundos. O visual combina transparência semi-translúcida, saturação de cores e desfoque de fundo (backdrop blur), acompanhado de efeitos de brilho radial e luzes difusas para dar uma sensação premium e moderna de dashboard de e-sports.

### Classes de Vidro (Tailwind + CSS Customizado):

*   **`.liquid-glass` (Padrão de Cards e Painéis)**:
    *   *Uso*: Envoltórios principais de cards (ex: `RankCard`, `ImprovementTips`, `StatsSummary`).
    *   *Propriedades*:
        ```css
        background: rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(24px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        ```
*   **`.liquid-glass-enhanced` (Destaque Elevado)**:
    *   *Uso*: Modais, popups importantes ou estados de destaque.
    *   *Propriedades*:
        ```css
        background: rgba(255, 255, 255, 0.09);
        backdrop-filter: blur(24px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.18);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15);
        ```
*   **`.liquid-glass-subtle` (Containers Internos)**:
    *   *Uso*: Sub-painéis e divisões secundárias dentro de um card principal.
    *   *Propriedades*:
        ```css
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(12px) saturate(150%);
        border: 1px solid rgba(255, 255, 255, 0.06);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        ```

---

## 🎨 2. Paleta de Cores

### Fundos e Contêineres:
*   `Fundo Principal`: `#22242c` (Cinza chumbo azulado)
*   `Inputs e Formulários`: `#212328` (Cinza escuro sólido)
*   `Linhas de Grade e Bordas`: `rgba(255, 255, 255, 0.05)` a `rgba(255, 255, 255, 0.1)`

### Cores de Texto:
*   `Texto Puro/Título`: `#ffffff`
*   `Texto Secundário`: `#e1e1e1` (Branco gelo)
*   `Subtítulos e Rótulos`: `#9e9eb1` (Cinza azulado médio)
*   `Rótulos Mutos/Desativados`: `#62636c` (Cinza grafite)

### Cores de Status e Acentuação:
*   `Destaque / Link`: `#4c92fc` (Azul elétrico / Neon)
*   `Meta Batida / Positivo`: `#5de8c8` (Verde esmeralda suave)
*   `Meta Não Batida / Negativo`: `#f24254` (Vermelho carmim suave)
*   `Elo Ouro / Destaque Secundário`: `#f0ba65` (Dourado fosco)

---

## 📐 3. Escala de Arredondamento (Border Radius)

Para garantir consistência estrutural, o sistema de design adota três níveis de arredondamento base:

1.  **`rounded-2xl` ($16\text{px}$)**:
    *   *Uso*: Contêineres de cartões estruturais externos e painéis de layout (ex: cards de histórico, perfil, metas, barra de pesquisa principal).
2.  **`rounded-xl` ($12\text{px}$)**:
    *   *Uso*: Botões de ação, dropdowns abertos, caixas de input e balões de tooltips.
3.  **`rounded-lg` ($8\text{px}$)**:
    *   *Uso*: Abas selecionáveis internas, badges e pequenas tags de status.

---

## 🔠 4. Hierarquia de Tipografia

*   **Títulos de Seção (Headers)**:
    *   *Classe*: `text-[12px] md:text-[13px] font-black uppercase tracking-wider text-white`
    *   *Uso*: Títulos dos cards (`Metas de Desempenho`, `Recentemente Jogado Com`).
*   **Dados e Valores Principais**:
    *   *Classe*: `text-[17px] md:text-[18px] font-black uppercase tracking-tight text-white`
    *   *Uso*: Nomes de elos, pontuações médias.
*   **Textos de Apoio / Descrições**:
    *   *Classe*: `text-[10px] md:text-[11px] font-bold text-[#62636c] leading-relaxed`
    *   *Uso*: Textos descritivos logo abaixo de títulos ou notas de rodapé.

---

## 🛠️ 5. Padrões de Componentes (Code Snippets)

### Barra de Abas / Seletores (Ex: Rotas ou Filas):
```tsx
<div className="flex bg-black/20 rounded-xl p-1 border border-white/5">
  {items.map(item => (
    <button
      key={item.id}
      className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-1 ${
        isSelected 
          ? "bg-white/10 text-white shadow border border-white/10" 
          : "text-[#62636c] hover:text-[#9e9eb1]"
      }`}
    >
      {item.label}
    </button>
  ))}
</div>
```

### Balão de Tooltip de Informação (Hover):
```tsx
<div className="relative group/info cursor-help hover:z-50 shrink-0">
  <button className="text-[#62636c] hover:text-white transition-colors flex items-center justify-center">
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </button>
  <div className="absolute right-0 bottom-[130%] bg-[#1c1d21]/95 text-[#9e9eb1] text-[10px] leading-relaxed p-2.5 rounded-xl border border-white/10 shadow-2xl opacity-0 pointer-events-none group-hover/info:opacity-100 transition-opacity duration-200 w-56 z-[100] backdrop-blur-md font-bold">
    Explicação detalhada do cálculo da métrica aqui.
  </div>
</div>
```

### Barra de Progresso de Meta:
```tsx
<div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden border border-white/5">
  <div 
    className="h-full bg-[#5de8c8] rounded-full transition-all duration-500" 
    style={{ width: `${porcentagem}%` }}
  />
</div>
```
