
# US Master Companion — MVP Frontend

Construir um app PWA-friendly em TanStack Start, mobile-first (otimizado para 390×844), apenas frontend, com dados em `localStorage` e conteúdo placeholder. Sem login, sem pagamento, sem IA, sem comunidade nesta fase.

## Escopo desta entrega

**Incluso**
1. Onboarding (5 perguntas → cria perfil e nível inicial)
2. Tela inicial (saudação, nível, pontos, sequência, missões do dia)
3. Módulo Atlas de Sonoanatomia (navegação por região → estrutura → conteúdo)
4. Módulo Quiz Diário (imagem placeholder + 4 alternativas + explicação + pontos)
5. Módulo Caso Clínico Semanal (apresentação + perguntas + resolução comentada)
6. Sistema de gamificação local (pontos, streak, missões diárias, badges simples)
7. Perfil do usuário (editar dados, ver progresso, resetar)

**Fora do escopo (próximas fases)**
- Backend / login / persistência em nuvem
- Logbook, Simulador CIPS, Procedimento da semana, IA, Comunidade, Mapa de carreira, Mentoria
- Pagamentos / planos
- Conteúdo real (imagens de US, vídeos, textos clínicos)

## Estrutura de rotas

```text
/                          → splash/redireciona
/onboarding                → 5 passos
/home                      → dashboard diário
/atlas                     → grid de regiões
/atlas/$region             → lista de estruturas (ex: ombro)
/atlas/$region/$structure  → conteúdo da estrutura
/quiz                      → quiz do dia
/caso                      → caso clínico da semana
/perfil                    → dados + progresso + reset
```

Layout `_app` com bottom-nav fixa (Home, Atlas, Quiz, Caso, Perfil).

## Estado e dados

- `localStorage` chave `usm:profile` → `{ nome, especialidade, cidade, tempoFormado, temUS, trabalhaDor, nivel, pontos, streak, ultimoAcessoISO, missoesHoje, quizzesRespondidos[], casosRespondidos[], badges[] }`.
- Hook `useProfile()` centraliza leitura/escrita e cálculo de nível a partir de pontos (1: 0–499, 2: 500–1499, 3: 1500–3499, 4: 3500–6999, 5: 7000–11999, 6: 12000+).
- Lógica de streak: incrementa se último acesso foi ontem; reseta se >1 dia; mantém se hoje.
- Conteúdo (atlas, banco de quiz, casos) em arquivos TypeScript estáticos em `src/content/`.

## Conteúdo placeholder

- 9 regiões do atlas com 3–5 estruturas cada (texto lorem clínico curto + imagem placeholder gerada).
- 20 perguntas de quiz com imagens placeholder de "ultrassom".
- 3 casos clínicos completos.
- Algumas imagens chave geradas (hero do onboarding, ícones de região); demais via `https://placehold.co` com label.

## Design

- Mobile-first, paleta clínica premium (azul-profundo + branco + accent quente para gamificação tipo Duolingo).
- Tipografia: Inter para corpo, Sora para títulos.
- Tokens em `src/styles.css` (oklch), sem cores hardcoded em componentes.
- Componentes shadcn já disponíveis (Card, Button, Progress, Badge, Tabs, Dialog).
- Bottom nav com ícones Lucide.
- Animações leves (Motion) em ganho de pontos e troca de tela.
- Quando enviar cores/screenshots do AVANTE, ajusto os tokens.

## Detalhes técnicos

- TanStack Router file-based em `src/routes/` (sem `src/pages/`).
- Cada rota com `head()` próprio (title/description PT-BR).
- `__root.tsx` mantém shell; layout do app em `src/routes/_app.tsx` com `<Outlet/>` + bottom nav.
- `errorComponent` e `notFoundComponent` em cada rota com loader (nenhuma rota terá loader nesta fase — tudo client-side a partir de `localStorage`).
- Sem TanStack Query nesta fase (dados locais).
- Conteúdo do atlas tipado: `type AtlasRegion = { slug, nome, icone, estruturas: AtlasStructure[] }`.

## Passos de implementação

1. Tokens de design + tipografia + layout base com bottom-nav
2. Hook `useProfile` + utilidades de nível/streak/pontos
3. Fluxo de onboarding (5 telas com Progress)
4. Tela Home (saudação, card de nível, missões do dia, atalhos)
5. Conteúdo estático do atlas + 3 rotas do atlas
6. Quiz: componente de pergunta + tela diária + lógica anti-repetição no dia
7. Caso clínico: tela semanal com perguntas abertas/múltipla e resolução
8. Perfil: visualizar dados, progresso por módulo, botão de reset
9. Geração de imagens-chave (hero, 9 ícones de região)
10. Polimento visual + microanimações + verificação mobile 390×844

## Pronto para próximas fases

Estrutura preparada para, depois, plugar Lovable Cloud (login + sincronização), adicionar Logbook, Procedimento da semana, Simulador CIPS, Comunidade, IA e os planos de assinatura, sem reescrever o que for feito agora.
