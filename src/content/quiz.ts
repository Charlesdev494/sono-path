import anatomiaPerineal from "@/assets/anatomia-perineal.png.asset.json";
import usCervicalFacetas from "@/assets/us-cervical-facetas.png.asset.json";
import usCervicalC6 from "@/assets/us-cervical-c6.png.asset.json";

export type QuizNivel = "basico" | "avancado";

export type QuizLetra = "A" | "B" | "C" | "D" | "E";

export type QuizQuestion = {
  id: string;
  regiao: string;
  nivel: QuizNivel;
  enunciado: string;
  imagemLabel: string;
  imagemUrl?: string;
  caso?: string;
  alternativas: { letra: QuizLetra; texto: string }[];
  correta: QuizLetra;
  explicacao: string;
};

export const QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    regiao: "Ombro",
    nivel: "basico",
    enunciado: "Qual estrutura está sendo demonstrada na imagem em corte longitudinal?",
    imagemLabel: "Ombro · Longitudinal anterior",
    alternativas: [
      { letra: "A", texto: "Tendão supraespinhal" },
      { letra: "B", texto: "Ligamento coracoumeral" },
      { letra: "C", texto: "Bursa subacromial" },
      { letra: "D", texto: "Cabeça longa do bíceps" },
    ],
    correta: "A",
    explicacao:
      "O tendão supraespinhal aparece com padrão fibrilar característico inserindo-se na tuberosidade maior do úmero.",
  },
  {
    id: "q2",
    regiao: "Punho",
    nivel: "basico",
    enunciado: "Estrutura hipoecóica oval entre os tendões flexores no nível do túnel do carpo:",
    imagemLabel: "Punho · Transversal",
    alternativas: [
      { letra: "A", texto: "Artéria radial" },
      { letra: "B", texto: "Nervo mediano" },
      { letra: "C", texto: "Tendão flexor radial do carpo" },
      { letra: "D", texto: "Ligamento transverso" },
    ],
    correta: "B",
    explicacao:
      "O nervo mediano apresenta padrão em favo de mel e situa-se superficialmente aos flexores no túnel do carpo.",
  },
  {
    id: "q3",
    regiao: "Joelho",
    nivel: "basico",
    enunciado: "Qual nervo é alvo do bloqueio para gonalgia crônica na face medial superior?",
    imagemLabel: "Joelho · Curta axial",
    alternativas: [
      { letra: "A", texto: "Genicular superior medial" },
      { letra: "B", texto: "Safeno" },
      { letra: "C", texto: "Fibular comum" },
      { letra: "D", texto: "Obturador" },
    ],
    correta: "A",
    explicacao:
      "O nervo genicular superior medial transcorre adjacente ao côndilo femoral medial e é alvo clássico em RFA do joelho.",
  },
  {
    id: "q4",
    regiao: "Tornozelo",
    nivel: "basico",
    enunciado: "Espessamento >4mm na inserção calcânea sugere:",
    imagemLabel: "Tornozelo · Longitudinal plantar",
    alternativas: [
      { letra: "A", texto: "Tendinopatia de Aquiles" },
      { letra: "B", texto: "Fascite plantar" },
      { letra: "C", texto: "Síndrome do túnel do tarso" },
      { letra: "D", texto: "Neuroma de Morton" },
    ],
    correta: "B",
    explicacao:
      "Espessura da fáscia plantar > 4 mm na inserção calcânea é critério ultrassonográfico clássico de fascite plantar.",
  },
  {
    id: "q5",
    regiao: "Cotovelo",
    nivel: "basico",
    enunciado: "O nervo ulnar é mais bem avaliado em qual posição?",
    imagemLabel: "Cotovelo · Transversal medial",
    alternativas: [
      { letra: "A", texto: "Extensão neutra" },
      { letra: "B", texto: "Flexão dinâmica" },
      { letra: "C", texto: "Pronação máxima" },
      { letra: "D", texto: "Supinação forçada" },
    ],
    correta: "B",
    explicacao:
      "Avaliação dinâmica em flexão identifica subluxação do nervo ulnar sobre o epicôndilo medial.",
  },
  {
    id: "q6",
    regiao: "Quadril",
    nivel: "basico",
    enunciado: "Nervo alvo no bloqueio para dor perineal crônica:",
    imagemLabel: "Períneo · Anatomia (vista inferior)",
    imagemUrl: anatomiaPerineal.url,
    alternativas: [
      { letra: "A", texto: "Femoral" },
      { letra: "B", texto: "Ciático" },
      { letra: "C", texto: "Pudendo" },
      { letra: "D", texto: "Cutâneo femoral posterior" },
    ],
    correta: "C",
    explicacao:
      "O nervo pudendo, abordado entre os ligamentos sacroespinhoso e sacrotuberoso, é o alvo na neuralgia do pudendo.",
  },
  {
    id: "q7",
    regiao: "Coluna",
    nivel: "basico",
    enunciado: "Estrutura-alvo da rizotomia por radiofrequência facetária lombar:",
    imagemLabel: "Coluna lombar · Paraespinhal",
    alternativas: [
      { letra: "A", texto: "Raiz nervosa" },
      { letra: "B", texto: "Ramo medial do ramo dorsal" },
      { letra: "C", texto: "Gânglio simpático" },
      { letra: "D", texto: "Disco intervertebral" },
    ],
    correta: "B",
    explicacao:
      "O ramo medial do ramo dorsal inerva a faceta e é o alvo da neurotomia por radiofrequência.",
  },
  {
    id: "q8",
    regiao: "Ombro",
    nivel: "basico",
    enunciado: "Imagem hipoecóica entre supraespinhal e deltoide:",
    imagemLabel: "Ombro · Subacromial",
    alternativas: [
      { letra: "A", texto: "Bursa subacromial-subdeltoidea" },
      { letra: "B", texto: "Lábio glenoidal" },
      { letra: "C", texto: "Cápsula posterior" },
      { letra: "D", texto: "Bursa olecraneana" },
    ],
    correta: "A",
    explicacao:
      "A bursa subacromial-subdeltoidea é uma fina lâmina hipoecóica entre o deltoide e o supraespinhal.",
  },
  {
    id: "q9",
    regiao: "Punho",
    nivel: "basico",
    enunciado: "Achado típico na síndrome do túnel do carpo ao US:",
    imagemLabel: "Punho · Transversal",
    alternativas: [
      { letra: "A", texto: "Aumento da área seccional do mediano" },
      { letra: "B", texto: "Hiperecogenicidade dos flexores" },
      { letra: "C", texto: "Calcificação do retináculo" },
      { letra: "D", texto: "Atrofia do FCR" },
    ],
    correta: "A",
    explicacao:
      "ASC > 10 mm² do nervo mediano na entrada do túnel sugere síndrome do túnel do carpo.",
  },
  {
    id: "q10",
    regiao: "Joelho",
    nivel: "basico",
    enunciado: "Nervo principal da face medial do joelho e perna:",
    imagemLabel: "Joelho · Medial",
    alternativas: [
      { letra: "A", texto: "Fibular" },
      { letra: "B", texto: "Safeno" },
      { letra: "C", texto: "Tibial" },
      { letra: "D", texto: "Sural" },
    ],
    correta: "B",
    explicacao:
      "O nervo safeno, ramo terminal sensitivo do femoral, atravessa o canal adutor e inerva a face medial.",
  },
  {
    id: "q11",
    regiao: "Tornozelo",
    nivel: "basico",
    enunciado: "Estrutura no túnel do tarso entre maléolo medial e calcâneo:",
    imagemLabel: "Tornozelo · Túnel do tarso",
    alternativas: [
      { letra: "A", texto: "Nervo fibular profundo" },
      { letra: "B", texto: "Nervo tibial posterior" },
      { letra: "C", texto: "Nervo sural" },
      { letra: "D", texto: "Nervo plantar lateral isolado" },
    ],
    correta: "B",
    explicacao:
      "O nervo tibial posterior passa pelo túnel do tarso, dando origem aos plantares medial e lateral.",
  },
  {
    id: "q12",
    regiao: "Mão",
    nivel: "basico",
    enunciado: "Polia comumente afetada no dedo em gatilho:",
    imagemLabel: "Mão · Longitudinal palmar",
    alternativas: [
      { letra: "A", texto: "A1" },
      { letra: "B", texto: "A2" },
      { letra: "C", texto: "A4" },
      { letra: "D", texto: "C1" },
    ],
    correta: "A",
    explicacao:
      "A polia A1 é a mais frequentemente acometida no dedo em gatilho (tenossinovite estenosante).",
  },
  {
    id: "q13",
    regiao: "Quadril",
    nivel: "basico",
    enunciado: "Bloqueio para dor anterior do quadril visa principalmente:",
    imagemLabel: "Quadril · Anterior",
    alternativas: [
      { letra: "A", texto: "Nervo obturador" },
      { letra: "B", texto: "Nervo femoral / PENG" },
      { letra: "C", texto: "Cutâneo lateral" },
      { letra: "D", texto: "Pudendo" },
    ],
    correta: "B",
    explicacao:
      "O bloqueio PENG (pericapsular nerve group) cobre ramos articulares do femoral e do obturador acessório.",
  },
  {
    id: "q14",
    regiao: "Coluna",
    nivel: "basico",
    enunciado: "Alvo do bloqueio do gânglio da raiz dorsal:",
    imagemLabel: "Coluna · Foraminal",
    alternativas: [
      { letra: "A", texto: "Forame intervertebral" },
      { letra: "B", texto: "Espaço epidural" },
      { letra: "C", texto: "Articulação facetária" },
      { letra: "D", texto: "Disco" },
    ],
    correta: "A",
    explicacao:
      "O DRG situa-se no forame intervertebral; o procedimento é guiado para essa região com cuidado vascular.",
  },
  {
    id: "q15",
    regiao: "Ombro",
    nivel: "basico",
    enunciado: "Bloqueio do nervo supraescapular tem como alvo a fossa:",
    imagemLabel: "Ombro · Posterior",
    alternativas: [
      { letra: "A", texto: "Subescapular" },
      { letra: "B", texto: "Supraespinhal" },
      { letra: "C", texto: "Infraespinhal" },
      { letra: "D", texto: "Glenóide" },
    ],
    correta: "B",
    explicacao:
      "O nervo supraescapular é abordado na fossa supraespinhal, próximo à incisura escapular.",
  },
  {
    id: "q16",
    regiao: "Nervos",
    nivel: "basico",
    enunciado: "Aspecto ultrassonográfico característico de nervo periférico no eixo curto:",
    imagemLabel: "Nervo periférico · Axial",
    alternativas: [
      { letra: "A", texto: "Padrão fibrilar" },
      { letra: "B", texto: "Padrão em favo de mel" },
      { letra: "C", texto: "Anecóico homogêneo" },
      { letra: "D", texto: "Hiperecóico sólido" },
    ],
    correta: "B",
    explicacao:
      "No eixo curto, fascículos hipoecóicos circundados por epineuro hiperecóico geram o aspecto em favo de mel.",
  },
  {
    id: "q17",
    regiao: "Joelho",
    nivel: "basico",
    enunciado: "Nervo genicular mais inconstante anatomicamente:",
    imagemLabel: "Joelho · Inferolateral",
    alternativas: [
      { letra: "A", texto: "Superior medial" },
      { letra: "B", texto: "Superior lateral" },
      { letra: "C", texto: "Inferior medial" },
      { letra: "D", texto: "Inferior lateral" },
    ],
    correta: "D",
    explicacao:
      "O genicular inferior lateral apresenta maior variabilidade e proximidade com o nervo fibular comum.",
  },
  {
    id: "q18",
    regiao: "Cotovelo",
    nivel: "basico",
    enunciado: "Epicondilite lateral está associada principalmente ao tendão:",
    imagemLabel: "Cotovelo · Lateral",
    alternativas: [
      { letra: "A", texto: "Extensor radial curto do carpo" },
      { letra: "B", texto: "Bíceps" },
      { letra: "C", texto: "Pronador redondo" },
      { letra: "D", texto: "Flexor ulnar" },
    ],
    correta: "A",
    explicacao:
      "O extensor radial curto do carpo é o principal envolvido na epicondilite lateral (cotovelo de tenista).",
  },
  {
    id: "q19",
    regiao: "Punho",
    nivel: "basico",
    enunciado: "Tenossinovite de De Quervain envolve o:",
    imagemLabel: "Punho · 1º compartimento",
    alternativas: [
      { letra: "A", texto: "1º compartimento extensor" },
      { letra: "B", texto: "3º compartimento extensor" },
      { letra: "C", texto: "Flexor longo do polegar" },
      { letra: "D", texto: "Nervo mediano" },
    ],
    correta: "A",
    explicacao:
      "Acomete o abdutor longo e extensor curto do polegar no 1º compartimento extensor.",
  },
  {
    id: "q20",
    regiao: "Coluna",
    nivel: "basico",
    enunciado: "Bloqueio caudal acessa o espaço epidural pelo:",
    imagemLabel: "Sacro · Longitudinal",
    alternativas: [
      { letra: "A", texto: "Hiato sacral" },
      { letra: "B", texto: "Forame S1" },
      { letra: "C", texto: "Articulação SI" },
      { letra: "D", texto: "Cóccix" },
    ],
    correta: "A",
    explicacao:
      "Acesso pelo hiato sacral entre os cornos sacrais permite injeção no espaço epidural caudal.",
  },

  // ===================== NÍVEL AVANÇADO =====================
  {
    id: "qa1",
    regiao: "Coluna",
    nivel: "avancado",
    caso:
      "Paciente de 62 anos, lombalgia axial mecânica há 2 anos, alívio >80% após dois bloqueios diagnósticos do ramo medial L4 e L5 com anestésico de duração distinta.",
    enunciado:
      "Quais parâmetros são considerados padrão-ouro para a RFA convencional do ramo medial lombar?",
    imagemLabel: "RFA facetária lombar · parâmetros",
    alternativas: [
      { letra: "A", texto: "42 °C por 60 s, agulha perpendicular ao ramo medial" },
      { letra: "B", texto: "80 °C por 90 s, agulha paralela ao ramo medial sobre o pilar articular" },
      { letra: "C", texto: "60 °C por 120 s em modo pulsado, alvo no gânglio simpático" },
      { letra: "D", texto: "90 °C por 30 s em ponta perpendicular à apófise transversa" },
    ],
    correta: "B",
    explicacao:
      "A neurotomia por RF convencional do ramo medial exige posicionamento paralelo da ponta ativa ao nervo sobre o pilar articular (junção processo transverso/SAP), tipicamente 80 °C por 90 s para lesão térmica adequada.",
  },
  {
    id: "qa2",
    regiao: "Joelho",
    nivel: "avancado",
    caso:
      "Mulher de 71 anos, gonartrose grau IV bilateral, contraindicação cirúrgica. Programada RFA genicular guiada por US.",
    enunciado:
      "Sobre os alvos clássicos descritos por Choi e a anatomia atualizada (Tran/Fonkoue), qual conduta é mais adequada?",
    imagemLabel: "RFA genicular · alvos",
    alternativas: [
      { letra: "A", texto: "Lesar apenas os 3 nervos clássicos (SM, SL, IM) na junção epífise–diáfise" },
      { letra: "B", texto: "Incluir SM, SL, IM e ramos do nervo para o vasto intermédio/medial/lateral, evitando o IL pela proximidade do fibular comum" },
      { letra: "C", texto: "Lesar somente o genicular inferior lateral, mais constante" },
      { letra: "D", texto: "Realizar bloqueio único do nervo safeno no canal adutor substitui a RFA genicular" },
    ],
    correta: "B",
    explicacao:
      "Estudos anatômicos recentes mostram que a inervação articular é mais extensa, incluindo ramos para os vastos. O IL é evitado por risco ao fibular comum. O safeno trata dor cutânea, não articular.",
  },
  {
    id: "qa3",
    regiao: "Ombro",
    nivel: "avancado",
    caso:
      "Homem de 68 anos, dor crônica em ombro após artroplastia reversa, falha em tratamento conservador.",
    enunciado:
      "Qual combinação de alvos para RF pulsada cobre melhor a inervação sensitiva da articulação glenoumeral?",
    imagemLabel: "Inervação articular do ombro",
    alternativas: [
      { letra: "A", texto: "Apenas nervo supraescapular" },
      { letra: "B", texto: "Supraescapular + axilar + ramos do peitoral lateral" },
      { letra: "C", texto: "Subescapular + radial" },
      { letra: "D", texto: "Cervical superficial + frênico" },
    ],
    correta: "B",
    explicacao:
      "A cápsula glenoumeral recebe contribuição do supraescapular (posterossuperior), axilar (inferior) e ramos do peitoral lateral (anterior). A abordagem tripla amplia a cobertura analgésica.",
  },
  {
    id: "qa4",
    regiao: "Pelve",
    nivel: "avancado",
    caso:
      "Mulher de 45 anos com neuralgia do pudendo (critérios de Nantes positivos), falha em fisioterapia e gabapentinoides.",
    enunciado:
      "Qual o melhor alvo anatômico para o bloqueio guiado por US do nervo pudendo?",
    imagemLabel: "Pudendo · canal de Alcock",
    alternativas: [
      { letra: "A", texto: "Forame ciático maior, medial à artéria glútea superior" },
      { letra: "B", texto: "Entre os ligamentos sacroespinhoso e sacrotuberoso, medial à artéria pudenda interna" },
      { letra: "C", texto: "Forame obturador, lateral ao nervo obturador" },
      { letra: "D", texto: "Fossa isquioanal, superficial ao músculo elevador do ânus" },
    ],
    correta: "B",
    explicacao:
      "O alvo padrão é o espaço interligamentar (sacroespinhoso–sacrotuberoso), na altura da espinha isquiática, identificando a artéria pudenda interna no Doppler como referência ao nervo.",
  },
  {
    id: "qa5",
    regiao: "Coluna",
    nivel: "avancado",
    caso:
      "Paciente oncológico com dor visceral abdominal alta refratária a opioides em altas doses.",
    enunciado:
      "Qual estrutura é o alvo da neurólise para esta indicação e qual seu nível típico?",
    imagemLabel: "Plexo celíaco · nível T12-L1",
    alternativas: [
      { letra: "A", texto: "Gânglio estrelado em C6" },
      { letra: "B", texto: "Plexo celíaco anterolateral à aorta em T12-L1" },
      { letra: "C", texto: "Gânglio ímpar anterior ao cóccix" },
      { letra: "D", texto: "Plexo hipogástrico superior em L5-S1" },
    ],
    correta: "B",
    explicacao:
      "Dor visceral do andar supramesocólico (pâncreas, fígado, estômago) é tratada por neurólise do plexo celíaco, anterolateral à aorta no nível T12-L1, classicamente com álcool 50–100%.",
  },
  {
    id: "qa6",
    regiao: "Coluna",
    nivel: "avancado",
    caso:
      "Paciente com dor perineal e coccigodínea crônica pós-trauma, sem melhora com infiltração local.",
    enunciado:
      "Qual gânglio é o alvo e qual sua localização anatômica?",
    imagemLabel: "Gânglio ímpar",
    alternativas: [
      { letra: "A", texto: "Gânglio estrelado, anterior a C7" },
      { letra: "B", texto: "Gânglio ímpar (de Walther), anterior à junção sacrococcígea" },
      { letra: "C", texto: "Plexo hipogástrico superior, anterior a L5-S1" },
      { letra: "D", texto: "Gânglio celíaco, retroperitoneal alto" },
    ],
    correta: "B",
    explicacao:
      "O gânglio ímpar (de Walther) é a fusão terminal das cadeias simpáticas paravertebrais, anterior à junção sacrococcígea. É alvo em dor perineal/coccigodínea simpático-mediada.",
  },
  {
    id: "qa7",
    regiao: "Farmacologia",
    nivel: "avancado",
    enunciado:
      "Em adulto de 70 kg, qual a dose máxima recomendada de ropivacaína para bloqueio de nervo periférico em dose única?",
    imagemLabel: "Doses máximas de anestésicos locais",
    alternativas: [
      { letra: "A", texto: "1 mg/kg (≈70 mg)" },
      { letra: "B", texto: "3 mg/kg (≈210 mg)" },
      { letra: "C", texto: "7 mg/kg (≈490 mg)" },
      { letra: "D", texto: "10 mg/kg (≈700 mg)" },
    ],
    correta: "B",
    explicacao:
      "Dose máxima recomendada de ropivacaína em bloqueio periférico é ~3 mg/kg (≈225 mg). Para lidocaína sem adrenalina ~4,5 mg/kg; com adrenalina ~7 mg/kg.",
  },
  {
    id: "qa8",
    regiao: "Emergência",
    nivel: "avancado",
    caso:
      "Durante bloqueio interescalênico, paciente apresenta confusão, gosto metálico e em seguida convulsão.",
    enunciado:
      "Qual a conduta inicial específica indicada para LAST (toxicidade sistêmica por anestésico local)?",
    imagemLabel: "Manejo de LAST",
    alternativas: [
      { letra: "A", texto: "Bolus de adrenalina 1 mg IV imediatamente" },
      { letra: "B", texto: "Bolus de propofol 2 mg/kg para controle de crise" },
      { letra: "C", texto: "Emulsão lipídica 20% — bolus 1,5 mL/kg seguido de infusão 0,25 mL/kg/min" },
      { letra: "D", texto: "Bicarbonato de sódio 1 mEq/kg em bolus" },
    ],
    correta: "C",
    explicacao:
      "Protocolo ASRA: emulsão lipídica 20% (1,5 mL/kg bolus + 0,25 mL/kg/min), evitar vasopressina, limitar adrenalina a <1 µg/kg, evitar propofol em instabilidade hemodinâmica.",
  },
  {
    id: "qa9",
    regiao: "Ombro",
    nivel: "avancado",
    caso:
      "Bloqueio interescalênico de rotina para artroscopia de ombro.",
    enunciado:
      "Qual a complicação mais frequente e seu mecanismo?",
    imagemLabel: "Interescalênico · frênico",
    alternativas: [
      { letra: "A", texto: "Pneumotórax por punção pleural" },
      { letra: "B", texto: "Paresia hemidiafragmática por bloqueio do nervo frênico (próximo de 100%)" },
      { letra: "C", texto: "Síndrome de Horner permanente" },
      { letra: "D", texto: "Lesão direta do plexo braquial superior" },
    ],
    correta: "B",
    explicacao:
      "O bloqueio interescalênico cursa com paresia hemidiafragmática em até 100% dos casos pela difusão ao nervo frênico, contraindicando o procedimento em insuficiência respiratória grave.",
  },
  {
    id: "qa10",
    regiao: "Coluna",
    nivel: "avancado",
    caso:
      "Paciente com dor radicular L5 por hérnia foraminal, indicado bloqueio transforaminal seletivo.",
    enunciado:
      "Qual a principal precaução técnica para reduzir o risco de lesão medular/isquêmica?",
    imagemLabel: "TFESI · artéria de Adamkiewicz",
    alternativas: [
      { letra: "A", texto: "Usar agulha cortante calibre 18G para maior precisão" },
      { letra: "B", texto: "Injetar contraste sob fluoroscopia em tempo real e preferir corticoide não-particulado em níveis altos" },
      { letra: "C", texto: "Administrar volume total >10 mL para garantir dispersão" },
      { letra: "D", texto: "Evitar uso de contraste para reduzir reação alérgica" },
    ],
    correta: "B",
    explicacao:
      "O risco catastrófico em TFESI é a injeção intra-arterial em ramo radicular contribuinte à artéria de Adamkiewicz. Mitiga-se com contraste em tempo real, aspiração negativa e corticoides não-particulados (dexametasona) em níveis torácicos/lombares altos.",
  },

  // ===================== SESSÃO OMBRO · AVANÇADO =====================
  {
    id: "omb1",
    regiao: "Ombro",
    nivel: "avancado",
    enunciado:
      "Durante o bloqueio do nervo supraescapular pela abordagem posterior, qual estrutura representa o principal limite superior da incisura supraescapular?",
    imagemLabel: "Incisura supraescapular",
    alternativas: [
      { letra: "A", texto: "Ligamento coracoumeral" },
      { letra: "B", texto: "Ligamento transverso superior da escápula" },
      { letra: "C", texto: "Ligamento transverso inferior da escápula" },
      { letra: "D", texto: "Ligamento coracoacromial" },
    ],
    correta: "B",
    explicacao:
      "O ligamento transverso superior da escápula fecha a incisura supraescapular. O nervo supraescapular passa abaixo desse ligamento, enquanto a artéria supraescapular passa acima — detalhe clássico cobrado em provas.",
  },
  {
    id: "omb2",
    regiao: "Ombro",
    nivel: "avancado",
    enunciado:
      "Na incisura supraescapular, a relação anatômica clássica é:",
    imagemLabel: "Incisura supraescapular · relação A/N",
    alternativas: [
      { letra: "A", texto: "Artéria, nervo e veia passam abaixo do ligamento" },
      { letra: "B", texto: "Artéria acima e nervo abaixo do ligamento transverso superior" },
      { letra: "C", texto: "Nervo acima e artéria abaixo do ligamento" },
      { letra: "D", texto: "Artéria e nervo acima do ligamento" },
    ],
    correta: "B",
    explicacao:
      "Mnemônico clássico: \"Army over, Navy under\" (Artéria sobre, Nervo sob o ligamento transverso superior).",
  },
  {
    id: "omb3",
    regiao: "Ombro",
    nivel: "avancado",
    enunciado:
      "A principal inervação sensitiva da articulação acromioclavicular é proveniente de:",
    imagemLabel: "Inervação da AC",
    alternativas: [
      { letra: "A", texto: "Nervo peitoral medial exclusivamente" },
      { letra: "B", texto: "Ramos do nervo supraescapular e nervo peitoral lateral" },
      { letra: "C", texto: "Nervo axilar exclusivamente" },
      { letra: "D", texto: "Nervo musculocutâneo" },
    ],
    correta: "B",
    explicacao:
      "Estudos anatômicos recentes mostram participação importante do peitoral lateral e do supraescapular, justificando técnicas modernas de denervação para dor da AC.",
  },
  {
    id: "omb4",
    regiao: "Ombro",
    nivel: "avancado",
    enunciado:
      "Durante a ultrassonografia do tendão do supraespinal em eixo longo, sua aparência clássica costuma lembrar:",
    imagemLabel: "Supraespinal · eixo longo",
    alternativas: [
      { letra: "A", texto: "Bico de tucano" },
      { letra: "B", texto: "Asa de morcego" },
      { letra: "C", texto: "Olho de boi" },
      { letra: "D", texto: "Favo de mel" },
    ],
    correta: "A",
    explicacao:
      "Muitos ultrassonografistas usam a imagem do \"bico de tucano\" para o reconhecimento didático do supraespinal em eixo longo.",
  },
  {
    id: "omb5",
    regiao: "Ombro",
    nivel: "avancado",
    enunciado:
      "A artéria circunflexa posterior do úmero é um importante marco anatômico para qual bloqueio?",
    imagemLabel: "Espaço quadrangular",
    alternativas: [
      { letra: "A", texto: "Nervo axilar no espaço quadrangular" },
      { letra: "B", texto: "Nervo musculocutâneo" },
      { letra: "C", texto: "Nervo mediano" },
      { letra: "D", texto: "Nervo radial" },
    ],
    correta: "A",
    explicacao:
      "A artéria circunflexa posterior do úmero acompanha o nervo axilar pelo espaço quadrangular e serve como excelente referência ao US.",
  },
  {
    id: "omb6",
    regiao: "Ombro",
    nivel: "avancado",
    enunciado: "O espaço quadrangular contém:",
    imagemLabel: "Conteúdo do quadrangular",
    alternativas: [
      { letra: "A", texto: "Nervo supraescapular e artéria supraescapular" },
      { letra: "B", texto: "Nervo axilar e artéria circunflexa posterior do úmero" },
      { letra: "C", texto: "Nervo radial e artéria braquial profunda" },
      { letra: "D", texto: "Nervo toracodorsal e artéria toracodorsal" },
    ],
    correta: "B",
    explicacao:
      "Associação anatômica clássica em provas de dor intervencionista e ultrassonografia.",
  },
  {
    id: "omb7",
    regiao: "Ombro",
    nivel: "avancado",
    enunciado:
      "Em relação ao bloqueio do nervo axilar guiado por ultrassom, a melhor referência vascular é:",
    imagemLabel: "Doppler do quadrangular",
    alternativas: [
      { letra: "A", texto: "Artéria toracoacromial" },
      { letra: "B", texto: "Artéria circunflexa posterior do úmero" },
      { letra: "C", texto: "Artéria subescapular" },
      { letra: "D", texto: "Artéria braquial" },
    ],
    correta: "B",
    explicacao:
      "A identificação da circunflexa posterior do úmero pelo Doppler localiza rapidamente o nervo axilar.",
  },
  {
    id: "omb8",
    regiao: "Ombro",
    nivel: "avancado",
    enunciado:
      "Na radiofrequência pulsada do nervo supraescapular, o posicionamento ideal da ponta ativa deve ser:",
    imagemLabel: "RF pulsada supraescapular",
    alternativas: [
      { letra: "A", texto: "Intraneural" },
      { letra: "B", texto: "Dentro da artéria supraescapular" },
      { letra: "C", texto: "Adjacente ao nervo, evitando contato intraneural" },
      { letra: "D", texto: "Dentro da articulação glenoumeral" },
    ],
    correta: "C",
    explicacao:
      "A RF deve ser realizada próxima ao nervo, evitando lesão intraneural, reduzindo o risco de déficit motor ou neuropatia.",
  },
  {
    id: "omb9",
    regiao: "Ombro",
    nivel: "avancado",
    enunciado:
      "Qual nervo é responsável por aproximadamente 70% da inervação sensitiva da articulação glenoumeral?",
    imagemLabel: "Inervação glenoumeral",
    alternativas: [
      { letra: "A", texto: "Musculocutâneo" },
      { letra: "B", texto: "Supraescapular" },
      { letra: "C", texto: "Mediano" },
      { letra: "D", texto: "Ulnar" },
    ],
    correta: "B",
    explicacao:
      "O nervo supraescapular fornece a maior parte da sensibilidade da cápsula posterior e superior da glenoumeral; seu bloqueio gera analgesia significativa.",
  },
  {
    id: "omb10",
    regiao: "Ombro",
    nivel: "avancado",
    enunciado:
      "Na denervação intervencionista do ombro baseada em estudos anatômicos recentes, quais nervos são os principais alvos?",
    imagemLabel: "Denervação tripla do ombro",
    alternativas: [
      { letra: "A", texto: "Supraescapular, axilar e peitoral lateral" },
      { letra: "B", texto: "Musculocutâneo e radial" },
      { letra: "C", texto: "Mediano e ulnar" },
      { letra: "D", texto: "Toracodorsal e acessório" },
    ],
    correta: "A",
    explicacao:
      "Tríade base das técnicas modernas de radiofrequência para osteoartrite glenoumeral refratária.",
  },
  {
    id: "omb11",
    regiao: "Ombro",
    nivel: "avancado",
    enunciado:
      "Ao exame ultrassonográfico, o tendão da cabeça longa do bíceps localiza-se:",
    imagemLabel: "Cabo longo do bíceps",
    alternativas: [
      { letra: "A", texto: "Na incisura escapular" },
      { letra: "B", texto: "No sulco intertubercular do úmero" },
      { letra: "C", texto: "No espaço quadrangular" },
      { letra: "D", texto: "Na fossa infraespinal" },
    ],
    correta: "B",
    explicacao:
      "O tendão da cabeça longa do bíceps é identificado no sulco bicipital, entre os tubérculos maior e menor do úmero.",
  },
  {
    id: "omb12",
    regiao: "Ombro",
    nivel: "avancado",
    enunciado:
      "Qual ligamento mantém o tendão da cabeça longa do bíceps no sulco bicipital?",
    imagemLabel: "Polia bicipital",
    alternativas: [
      { letra: "A", texto: "Ligamento glenoumeral inferior" },
      { letra: "B", texto: "Ligamento transverso do úmero (complexo da polia bicipital)" },
      { letra: "C", texto: "Ligamento coracoacromial" },
      { letra: "D", texto: "Ligamento acromioclavicular" },
    ],
    correta: "B",
    explicacao:
      "A estabilidade depende de um complexo ligamentar amplo (polia bicipital), mas o ligamento transverso do úmero é a resposta clássica em provas.",
  },
  {
    id: "omb13",
    regiao: "Ombro",
    nivel: "avancado",
    enunciado:
      "Na síndrome do espaço quadrangular, qual nervo é tipicamente comprimido?",
    imagemLabel: "Sd. do quadrangular",
    alternativas: [
      { letra: "A", texto: "Supraescapular" },
      { letra: "B", texto: "Axilar" },
      { letra: "C", texto: "Mediano" },
      { letra: "D", texto: "Musculocutâneo" },
    ],
    correta: "B",
    explicacao:
      "A compressão do nervo axilar pode causar dor posterior do ombro e fraqueza do deltoide e redondo menor.",
  },
  {
    id: "omb14",
    regiao: "Ombro",
    nivel: "avancado",
    enunciado:
      "Durante a abordagem ultrassonográfica do nervo supraescapular na fossa supraespinal, qual músculo forma o principal assoalho da imagem?",
    imagemLabel: "Fossa supraespinal · US",
    alternativas: [
      { letra: "A", texto: "Deltoide" },
      { letra: "B", texto: "Infraespinal" },
      { letra: "C", texto: "Supraespinal" },
      { letra: "D", texto: "Redondo maior" },
    ],
    correta: "C",
    explicacao:
      "Na fossa supraespinal, o nervo repousa profundamente ao músculo supraespinal antes de seguir para a incisura espinoglenoidal.",
  },
  {
    id: "omb15",
    regiao: "Ombro",
    nivel: "avancado",
    caso:
      "Paciente com osteoartrite glenoumeral avançada, sem indicação cirúrgica.",
    enunciado:
      "Qual estratégia intervencionista tem maior racional anatômico para analgesia prolongada?",
    imagemLabel: "Denervação do ombro",
    alternativas: [
      { letra: "A", texto: "Bloqueio isolado do nervo musculocutâneo" },
      { letra: "B", texto: "Radiofrequência dos nervos supraescapular, axilar e peitoral lateral" },
      { letra: "C", texto: "Bloqueio do nervo radial" },
      { letra: "D", texto: "Infiltração do túnel do carpo" },
    ],
    correta: "B",
    explicacao:
      "A tendência atual é a denervação seletiva da cápsula glenoumeral, baseada em estudos que demonstram a participação predominante desses três nervos.",
  },
  {
    id: "adv1",
    regiao: "Punho",
    nivel: "avancado",
    enunciado:
      "No diagnóstico ultrassonográfico da síndrome do túnel do carpo, assinale a alternativa CORRETA:",
    imagemLabel: "Nervo mediano · túnel do carpo",
    alternativas: [
      { letra: "A", texto: "A medida isolada da área de secção transversal (AST) do mediano tem alta acurácia independente do biotipo." },
      { letra: "B", texto: "A AST do mediano deve ser medida no processo unciforme do hamato." },
      { letra: "C", texto: "O aumento da AST do mediano ao nível do pisiforme associado à relação túnel/antebraço ≥ 1,4 é um dos critérios mais aceitos." },
      { letra: "D", texto: "O Doppler colorido não tem qualquer valor na avaliação do túnel do carpo." },
    ],
    correta: "C",
    explicacao:
      "O aumento da AST do mediano ao nível do pisiforme, associado a uma relação túnel/antebraço ≥ 1,4 ou a uma diferença significativa entre a AST no túnel e no antebraço distal, é um dos critérios ultrassonográficos mais aceitos. A medida isolada da AST sofre influência do biotipo.",
  },
  {
    id: "adv2",
    regiao: "Cotovelo",
    nivel: "avancado",
    enunciado:
      "Qual das alternativas abaixo NÃO corresponde a um ponto clássico de entrapment do nervo mediano?",
    imagemLabel: "Trajeto do nervo mediano",
    alternativas: [
      { letra: "A", texto: "Ligamento de Struthers" },
      { letra: "B", texto: "Lacertus fibrosus" },
      { letra: "C", texto: "Arco do pronador redondo" },
      { letra: "D", texto: "Arcada de Frohse" },
    ],
    correta: "D",
    explicacao:
      "A Arcada de Frohse é o principal local de compressão do nervo interósseo posterior (ramo profundo do radial). Os demais são pontos clássicos de compressão do mediano.",
  },
  {
    id: "adv3",
    regiao: "Ombro",
    nivel: "avancado",
    enunciado:
      "Sobre o uso do ultrassom na avaliação da capsulite adesiva (ombro congelado), assinale a alternativa CORRETA:",
    imagemLabel: "Intervalo dos rotadores",
    alternativas: [
      { letra: "A", texto: "O principal achado é a ruptura completa do tendão supraespinhal." },
      { letra: "B", texto: "Não há alterações detectáveis ao ultrassom, sendo o diagnóstico exclusivamente clínico." },
      { letra: "C", texto: "Observa-se afilamento do ligamento coracoumeral com hipossinal Doppler." },
      { letra: "D", texto: "Espessamento do ligamento coracoumeral e do intervalo dos rotadores, com aumento focal do Doppler próximo à cabeça longa do bíceps." },
    ],
    correta: "D",
    explicacao:
      "Os principais achados incluem espessamento do ligamento coracoumeral e do intervalo dos rotadores, aumento focal do sinal Doppler próximo ao tendão da cabeça longa do bíceps, além de restrição dinâmica do movimento do supraespinhal por rigidez capsular.",
  },
  {
    id: "adv4",
    regiao: "Ombro",
    nivel: "avancado",
    enunciado:
      "Em relação à inervação motora do nervo axilar, assinale a alternativa correta:",
    imagemLabel: "Nervo axilar",
    alternativas: [
      { letra: "A", texto: "Deltoide e supraespinhal" },
      { letra: "B", texto: "Deltoide e infraespinhal" },
      { letra: "C", texto: "Deltoide e redondo menor" },
      { letra: "D", texto: "Deltoide e redondo maior" },
    ],
    correta: "C",
    explicacao:
      "O nervo axilar fornece inervação motora exclusivamente ao deltoide e ao redondo menor.",
  },
  {
    id: "adv5",
    regiao: "Quadril",
    nivel: "avancado",
    enunciado:
      "Durante a punção intra-articular do quadril pela via anterior, qual estrutura vascular deve ser identificada e evitada?",
    imagemLabel: "Quadril · acesso anterior",
    alternativas: [
      { letra: "A", texto: "Artéria femoral comum" },
      { letra: "B", texto: "Artéria glútea superior" },
      { letra: "C", texto: "Artéria obturatória" },
      { letra: "D", texto: "Ramo ascendente da artéria circunflexa femoral medial" },
    ],
    correta: "D",
    explicacao:
      "O ramo ascendente da artéria circunflexa femoral medial é um vaso importante relacionado à cápsula anterior e ao colo femoral, devendo ser identificado ao Doppler durante a punção.",
  },
  {
    id: "adv6",
    regiao: "Antebraço",
    nivel: "avancado",
    enunciado:
      "Paciente incapaz de realizar o gesto do “OK”, sem alterações sensitivas. Qual a hipótese correta?",
    imagemLabel: "Nervo interósseo anterior",
    alternativas: [
      { letra: "A", texto: "Síndrome do túnel do carpo" },
      { letra: "B", texto: "Síndrome do nervo interósseo anterior (sinal de Kiloh-Nevin)" },
      { letra: "C", texto: "Síndrome do canal de Guyon" },
      { letra: "D", texto: "Síndrome do interósseo posterior" },
    ],
    correta: "B",
    explicacao:
      "Trata-se do sinal de Kiloh-Nevin, característico da síndrome do nervo interósseo anterior, ramo exclusivamente motor do nervo mediano.",
  },
  {
    id: "adv7",
    regiao: "Punho",
    nivel: "avancado",
    enunciado:
      "Fraqueza da mão, Froment positivo, garra ulnar e preservação da sensibilidade do dorso proximal da mão. Qual o diagnóstico?",
    imagemLabel: "Nervo ulnar · canal de Guyon",
    alternativas: [
      { letra: "A", texto: "Compressão ulnar no cotovelo (túnel cubital)" },
      { letra: "B", texto: "Neuropatia mediana proximal" },
      { letra: "C", texto: "Compressão ulnar no canal de Guyon" },
      { letra: "D", texto: "Plexopatia braquial inferior" },
    ],
    correta: "C",
    explicacao:
      "O quadro é sugestivo de compressão do nervo ulnar no canal de Guyon. A preservação do dorso da mão ocorre porque o ramo cutâneo dorsal emerge proximalmente ao punho.",
  },
  {
    id: "adv8",
    regiao: "Abdome/Pelve",
    nivel: "avancado",
    enunciado:
      "Em relação à origem anatômica dos nervos ilio-hipogástrico e ilioinguinal:",
    imagemLabel: "Plexo lombar",
    alternativas: [
      { letra: "A", texto: "Originam-se predominantemente de L4-L5." },
      { letra: "B", texto: "São ramos diretos do plexo sacral." },
      { letra: "C", texto: "São ramos do plexo lombar, originando-se predominantemente de L1, com possível contribuição de T12." },
      { letra: "D", texto: "Originam-se exclusivamente de T12." },
    ],
    correta: "C",
    explicacao:
      "Ambos são ramos do plexo lombar, originando-se predominantemente de L1, podendo receber contribuição de T12.",
  },
  {
    id: "adv9",
    regiao: "Geral",
    nivel: "avancado",
    enunciado:
      "Quais dos nervos abaixo são considerados essencialmente sensitivos?",
    imagemLabel: "Nervos sensitivos",
    alternativas: [
      { letra: "A", texto: "Sural, safeno, cutâneo femoral lateral e auricular maior" },
      { letra: "B", texto: "Mediano, ulnar, radial e axilar" },
      { letra: "C", texto: "Tibial, fibular comum, femoral e obturador" },
      { letra: "D", texto: "Frênico, vago, glossofaríngeo e hipoglosso" },
    ],
    correta: "A",
    explicacao:
      "Nervo sural, safeno, cutâneo femoral lateral e auricular maior são nervos essencialmente sensitivos.",
  },
  {
    id: "adv10",
    regiao: "Pé",
    nivel: "avancado",
    enunciado:
      "Qual o principal critério ultrassonográfico para o diagnóstico de fascite plantar?",
    imagemLabel: "Fáscia plantar",
    alternativas: [
      { letra: "A", texto: "Espessura < 2 mm com padrão fibrilar preservado" },
      { letra: "B", texto: "Presença isolada de esporão calcâneo" },
      { letra: "C", texto: "Hiperecogenicidade difusa da fáscia sem alterações estruturais" },
      { letra: "D", texto: "Espessura > 4 mm associada à perda do padrão fibrilar" },
    ],
    correta: "D",
    explicacao:
      "Espessura superior a 4 mm, associada à perda do padrão fibrilar, é um dos principais critérios diagnósticos da fascite plantar.",
  },
  {
    id: "adv11",
    regiao: "Joelho",
    nivel: "avancado",
    enunciado:
      "Em relação ao bloqueio IPACK (Infiltration between the Popliteal Artery and Capsule of the Knee), assinale a alternativa correta:",
    imagemLabel: "IPACK · fossa poplítea",
    alternativas: [
      { letra: "A", texto: "Provoca bloqueio motor importante do quadríceps." },
      { letra: "B", texto: "Atua predominantemente sobre o nervo femoral." },
      { letra: "C", texto: "Atua sobre ramos articulares posteriores do joelho, principalmente do tibial e do obturador posterior, preservando a função motora." },
      { letra: "D", texto: "Substitui completamente o bloqueio do canal dos adutores." },
    ],
    correta: "C",
    explicacao:
      "O IPACK atua sobre os ramos articulares posteriores do joelho, principalmente derivados do tibial e do obturador posterior, preservando a função motora.",
  },
  {
    id: "adv12",
    regiao: "Tornozelo",
    nivel: "avancado",
    enunciado:
      "Paciente com trauma em inversão do tornozelo em uso de salto alto. Quais as estruturas mais frequentemente lesionadas?",
    imagemLabel: "Ligamentos laterais do tornozelo",
    alternativas: [
      { letra: "A", texto: "Ligamento deltoide e tibial posterior" },
      { letra: "B", texto: "Ligamento talofibular anterior, calcaneofibular e, em alguns casos, tendões fibulares" },
      { letra: "C", texto: "Fáscia plantar e tendão calcâneo" },
      { letra: "D", texto: "Ligamento tibiofibular anterior e sindesmose alta isoladamente" },
    ],
    correta: "B",
    explicacao:
      "Em trauma por inversão, as estruturas mais comumente lesadas são o ligamento talofibular anterior, o calcaneofibular e eventualmente os tendões fibulares.",
  },
  {
    id: "adv13",
    regiao: "Intervenção",
    nivel: "avancado",
    enunciado:
      "Sobre técnicas neuroablativas, assinale a alternativa INCORRETA:",
    imagemLabel: "Radiofrequência",
    alternativas: [
      { letra: "A", texto: "A radiofrequência convencional gera lesão térmica por aquecimento tecidual." },
      { letra: "B", texto: "A radiofrequência pulsada não gera lesão térmica significativa." },
      { letra: "C", texto: "A crioablação utiliza temperaturas extremamente baixas para causar lesão axonal." },
      { letra: "D", texto: "A radiofrequência resfriada é uma forma de crioablação." },
    ],
    correta: "D",
    explicacao:
      "A radiofrequência resfriada NÃO é uma forma de crioablação. O resfriamento do eletrodo apenas permite gerar uma lesão térmica maior e mais uniforme.",
  },
  {
    id: "adv14",
    regiao: "Coluna",
    nivel: "avancado",
    enunciado:
      "Na imagem ultrassonográfica em corte longitudinal parassagital da coluna cervical, as três estruturas hiperecóicas indicadas pelas setas correspondem a:",
    imagemLabel: "Coluna cervical · Parassagital",
    imagemUrl: usCervicalFacetas.url,
    alternativas: [
      { letra: "A", texto: "Processos espinhosos cervicais" },
      { letra: "B", texto: "Lâminas vertebrais cervicais" },
      { letra: "C", texto: "Articulações zigapofisárias (facetas cervicais)" },
      { letra: "D", texto: "Ligamento flavum" },
      { letra: "E", texto: "Raízes nervosas cervicais no forame intervertebral" },
    ],
    correta: "C",
    explicacao:
      "A imagem em corte longitudinal parassagital da coluna cervical mostra o padrão clássico em 'ondas' das articulações zigapofisárias (facetas), formado pelo contorno hiperecóico contínuo dos processos articulares superior e inferior de vértebras adjacentes — referência fundamental para bloqueio do ramo medial cervical.",
  },
  {
    id: "adv15",
    regiao: "Intervenção",
    nivel: "avancado",
    enunciado:
      "Na imagem ultrassonográfica em corte transversal da região cervical, obtida durante o planejamento de um bloqueio do gânglio estrelado ao nível de C6, as estruturas numeradas 5 e 6 exercem papel anatômico relevante para a segurança do procedimento. Assinale a alternativa que correlaciona corretamente essas estruturas e a implicação técnica mais adequada:",
    imagemLabel: "Cervical C6 · Transversal",
    imagemUrl: usCervicalC6.url,
    alternativas: [
      { letra: "A", texto: "5 = traqueia → deve ser transfixada com agulha fina para alcançar o plano pré-vertebral; 6 = músculo escaleno anterior → referência superficial obrigatória para o bloqueio" },
      { letra: "B", texto: "5 = esôfago → estrutura compressível, que pode ser deslocada medialmente com o transdutor; 6 = músculo longo do pescoço → alvo profundo sobre o qual se deposita o anestésico local" },
      { letra: "C", texto: "5 = artéria carótida comum → estrutura que delimita medialmente o plano de injeção; 6 = cadeia simpática cervical → alvo ecogênico linear visível rotineiramente ao ultrassom" },
      { letra: "D", texto: "5 = nervo laríngeo recorrente → estrutura hiperecogênica pulsátil; 6 = fáscia pré-traqueal → principal referência anatômica para o bloqueio simpático" },
      { letra: "E", texto: "5 = lobo esquerdo da tireoide → marco profundo constante para punção segura; 6 = músculo longo da cabeça → principal músculo relacionado ao gânglio cervicotorácico" },
    ],
    correta: "B",
    explicacao:
      "A estrutura 5 corresponde ao esôfago — compressível e deslocável medialmente com o transdutor, manobra clássica para reduzir o risco de punção esofágica. A estrutura 6 é o músculo longo do pescoço (longus colli), sobre cuja fáscia se deposita o anestésico local para o bloqueio do gânglio estrelado em C6.",
  },
  {
    id: "fis1",
    regiao: "Física do US",
    nivel: "basico",
    enunciado: "Ao substituir um transdutor de ultrassom de 6 MHz por outro de 12 MHz, qual alteração física é mais esperada?",
    imagemLabel: "Física · Frequência do transdutor",
    alternativas: [
      { letra: "A", texto: "Aumento da penetração e da resolução." },
      { letra: "B", texto: "Redução da atenuação e aumento da profundidade." },
      { letra: "C", texto: "Aumento da resolução espacial e redução da penetração." },
      { letra: "D", texto: "Redução da anisotropia dos tendões." },
      { letra: "E", texto: "Aumento automático da PRF." },
    ],
    correta: "C",
    explicacao:
      "O aumento da frequência melhora a resolução espacial, permitindo maior detalhamento anatômico. Entretanto, ocorre maior atenuação do feixe ultrassonográfico, reduzindo sua capacidade de penetração. Por esse motivo, transdutores de alta frequência são ideais para estruturas superficiais, enquanto frequências menores são preferidas para estruturas profundas.",
  },
  {
    id: "fis2",
    regiao: "Física do US",
    nivel: "basico",
    enunciado: "Nos tecidos moles, qual é o principal mecanismo responsável pela atenuação do feixe ultrassonográfico?",
    imagemLabel: "Física · Atenuação",
    alternativas: [
      { letra: "A", texto: "Reflexão." },
      { letra: "B", texto: "Espalhamento." },
      { letra: "C", texto: "Absorção." },
      { letra: "D", texto: "Refração." },
      { letra: "E", texto: "Interferência construtiva." },
    ],
    correta: "C",
    explicacao:
      "A absorção é o principal mecanismo de atenuação nos tecidos biológicos, convertendo parte da energia acústica em calor. Embora reflexão e espalhamento também reduzam a intensidade do feixe, a absorção representa a maior parcela da perda energética.",
  },
  {
    id: "fis3",
    regiao: "Física do US",
    nivel: "basico",
    enunciado: "Durante um exame ultrassonográfico, determinada estrutura desaparece após uma pequena inclinação do transdutor e reaparece quando o ângulo é corrigido. Qual fenômeno explica esse achado?",
    imagemLabel: "Física · Artefato angular",
    alternativas: [
      { letra: "A", texto: "Reverberação." },
      { letra: "B", texto: "Anisotropia." },
      { letra: "C", texto: "Sombra acústica." },
      { letra: "D", texto: "Imagem em espelho." },
      { letra: "E", texto: "Excesso de ganho." },
    ],
    correta: "B",
    explicacao:
      "A anisotropia ocorre quando estruturas altamente organizadas, como tendões e nervos, refletem o feixe ultrassonográfico de forma dependente do ângulo de incidência. Pequenas alterações na inclinação do transdutor podem fazer a estrutura parecer artificialmente hipoecoica ou até desaparecer.",
  },
  {
    id: "fis4",
    regiao: "Física do US",
    nivel: "basico",
    enunciado: "Qual artefato ultrassonográfico produz uma duplicação especular de estruturas anatômicas em relação a uma interface altamente refletora?",
    imagemLabel: "Física · Artefatos",
    alternativas: [
      { letra: "A", texto: "Reforço acústico posterior." },
      { letra: "B", texto: "Sombra de borda." },
      { letra: "C", texto: "Imagem em espelho." },
      { letra: "D", texto: "Reverberação." },
      { letra: "E", texto: "Lóbulo lateral." },
    ],
    correta: "C",
    explicacao:
      "O artefato de imagem em espelho ocorre quando o feixe encontra uma interface lisa e altamente refletora, levando o equipamento a interpretar erroneamente o trajeto do eco e criar uma imagem duplicada da estrutura original.",
  },
  {
    id: "fis5",
    regiao: "Física do US",
    nivel: "basico",
    enunciado: "Qual é o principal efeito da utilização de ganho global excessivo durante a aquisição da imagem ultrassonográfica?",
    imagemLabel: "Física · Ganho",
    alternativas: [
      { letra: "A", texto: "Aumento da potência de transmissão." },
      { letra: "B", texto: "Redução da atenuação do feixe." },
      { letra: "C", texto: "Aumento do ruído da imagem e perda do contraste." },
      { letra: "D", texto: "Aumento da velocidade do som nos tecidos." },
      { letra: "E", texto: "Aumento da penetração do feixe." },
    ],
    correta: "C",
    explicacao:
      "O ganho global amplifica os ecos recebidos, mas seu uso excessivo torna a imagem artificialmente brilhante, reduzindo o contraste entre as estruturas e aumentando o ruído. O ganho não modifica a física do feixe ultrassonográfico, apenas a forma como os ecos são exibidos.",
  },
  {
    id: "gon1",
    regiao: "Cabeça e Pescoço",
    nivel: "basico",
    enunciado: "Durante o bloqueio do nervo occipital maior (GON), qual estrutura anatômica deve ser cuidadosamente identificada para minimizar o risco de complicações vasculares?",
    imagemLabel: "GON · Anatomia vascular",
    alternativas: [
      { letra: "A", texto: "Nervo auricular maior." },
      { letra: "B", texto: "Artéria occipital." },
      { letra: "C", texto: "Artéria vertebral." },
      { letra: "D", texto: "Veia jugular externa." },
      { letra: "E", texto: "Seio sigmoide." },
    ],
    correta: "B",
    explicacao:
      "A artéria occipital acompanha intimamente o trajeto do nervo occipital maior e constitui a principal estrutura de risco durante o bloqueio. O uso do Doppler auxilia na sua identificação e evita punções intravasculares.",
  },
  {
    id: "gon2",
    regiao: "Cabeça e Pescoço",
    nivel: "avancado",
    enunciado: "Qual é uma das regiões anatômicas mais frequentemente associadas ao aprisionamento do nervo occipital maior?",
    imagemLabel: "GON · Sítios de aprisionamento",
    alternativas: [
      { letra: "A", texto: "Entre o trapézio e a pele." },
      { letra: "B", texto: "Entre os músculos oblíquo inferior da cabeça e semiespinhal da cabeça." },
      { letra: "C", texto: "Entre os músculos esplênio da cabeça e semiespinhal cervical." },
      { letra: "D", texto: "No interior do músculo esternocleidomastoideo." },
      { letra: "E", texto: "No canal vertebral." },
    ],
    correta: "C",
    explicacao:
      "Um dos pontos clássicos de compressão do nervo occipital maior ocorre durante sua passagem entre os músculos esplênio da cabeça e semiespinhal cervical. O conhecimento desses locais é importante tanto para o diagnóstico quanto para procedimentos intervencionistas.",
  },
  {
    id: "estr1",
    regiao: "Cervical",
    nivel: "basico",
    enunciado: "No bloqueio simpático cervical anterior guiado por ultrassom, qual músculo é utilizado como principal referência anatômica para a realização segura da técnica?",
    imagemLabel: "Gânglio estrelado · Referência",
    alternativas: [
      { letra: "A", texto: "Escaleno médio." },
      { letra: "B", texto: "Longo do pescoço (Longus colli)." },
      { letra: "C", texto: "Trapézio." },
      { letra: "D", texto: "Levantador da escápula." },
      { letra: "E", texto: "Esplênio da cabeça." },
    ],
    correta: "B",
    explicacao:
      "O músculo longo do pescoço constitui o principal alvo anatômico do bloqueio do gânglio estrelado em C6. A injeção é realizada sobre sua fáscia, evitando estruturas vasculares e neurais adjacentes.",
  },
  {
    id: "estr2",
    regiao: "Cervical",
    nivel: "avancado",
    enunciado: "Durante o bloqueio simpático cervical anterior, qual é a estrutura vascular cuja lesão representa uma das complicações potencialmente mais graves?",
    imagemLabel: "Gânglio estrelado · Complicações",
    alternativas: [
      { letra: "A", texto: "Artéria carótida comum." },
      { letra: "B", texto: "Veia jugular interna." },
      { letra: "C", texto: "Artéria vertebral." },
      { letra: "D", texto: "Artéria tireoidea superior." },
      { letra: "E", texto: "Artéria subclávia." },
    ],
    correta: "C",
    explicacao:
      "A artéria vertebral percorre os forames transversários cervicais e sua punção acidental pode resultar em complicações neurológicas graves. O uso rotineiro do Doppler é fundamental para aumentar a segurança do procedimento.",
  },
  {
    id: "sse1",
    regiao: "Ombro",
    nivel: "basico",
    enunciado: "Na incisura supraescapular, qual é a relação anatômica clássica entre o nervo supraescapular e o ligamento transverso superior da escápula?",
    imagemLabel: "Supraescapular · Incisura",
    alternativas: [
      { letra: "A", texto: "O nervo passa acima do ligamento." },
      { letra: "B", texto: "O nervo passa abaixo do ligamento." },
      { letra: "C", texto: "O nervo localiza-se anteriormente ao acrômio." },
      { letra: "D", texto: "O nervo situa-se entre o deltoide e o bíceps." },
      { letra: "E", texto: "O nervo percorre o sulco bicipital." },
    ],
    correta: "B",
    explicacao:
      "A regra anatômica clássica é: 'Army over Navy'. A artéria supraescapular geralmente passa acima do ligamento transverso superior, enquanto o nervo supraescapular passa abaixo dele, na incisura supraescapular. Esse conhecimento é essencial para bloqueios e procedimentos de radiofrequência.",
  },
  {
    id: "sse2",
    regiao: "Ombro",
    nivel: "basico",
    enunciado: "Na abordagem distal do nervo supraescapular guiada por ultrassom, qual é o principal ponto anatômico de referência?",
    imagemLabel: "Supraescapular · Abordagem distal",
    alternativas: [
      { letra: "A", texto: "Sulco bicipital." },
      { letra: "B", texto: "Incisura espinoglenoidal." },
      { letra: "C", texto: "Espaço quadrangular." },
      { letra: "D", texto: "Túnel do carpo." },
      { letra: "E", texto: "Canal cubital." },
    ],
    correta: "B",
    explicacao:
      "A incisura espinoglenoidal é o principal alvo da abordagem distal do nervo supraescapular. Nesse nível, o nervo já emitiu seus ramos motores para o supraespinal, permanecendo responsável principalmente pela inervação do músculo infraespinal e de parte da cápsula posterior do ombro.",
  },
  {
    id: "ic1",
    regiao: "Tórax",
    nivel: "basico",
    enunciado: "Durante o bloqueio intercostal guiado por ultrassom, em qual plano fascial se localiza o feixe neurovascular intercostal?",
    imagemLabel: "Intercostal · Plano fascial",
    alternativas: [
      { letra: "A", texto: "Entre os músculos intercostal externo e intercostal interno." },
      { letra: "B", texto: "Entre os músculos intercostal interno e intercostal íntimo." },
      { letra: "C", texto: "Diretamente abaixo da pleura." },
      { letra: "D", texto: "No interior da musculatura intercostal." },
      { letra: "E", texto: "Em posição subperiosteal." },
    ],
    correta: "B",
    explicacao:
      "O feixe neurovascular intercostal percorre o plano entre os músculos intercostal interno e intercostal íntimo, junto ao sulco costal. O conhecimento desse plano aumenta a eficácia do bloqueio e reduz o risco de complicações.",
  },
  {
    id: "ic2",
    regiao: "Tórax",
    nivel: "basico",
    enunciado: "Qual é a complicação potencialmente mais grave associada ao bloqueio intercostal?",
    imagemLabel: "Intercostal · Complicações",
    alternativas: [
      { letra: "A", texto: "Hematoma epidural." },
      { letra: "B", texto: "Pneumotórax." },
      { letra: "C", texto: "Bloqueio simpático bilateral." },
      { letra: "D", texto: "Lesão do ducto torácico." },
      { letra: "E", texto: "Hipotensão neuraxial." },
    ],
    correta: "B",
    explicacao:
      "A proximidade da pleura torna o pneumotórax a complicação mais temida do bloqueio intercostal. A visualização contínua da ponta da agulha e a identificação da linha pleural são medidas fundamentais de segurança.",
  },
  {
    id: "iih1",
    regiao: "Abdome e Pelve",
    nivel: "basico",
    enunciado: "Os nervos ilioinguinal e ilio-hipogástrico são habitualmente identificados em qual plano anatômico?",
    imagemLabel: "Ilioinguinal/Ilio-hipogástrico · Plano",
    alternativas: [
      { letra: "A", texto: "Entre os músculos oblíquo externo e oblíquo interno." },
      { letra: "B", texto: "Entre os músculos oblíquo interno e transverso do abdome." },
      { letra: "C", texto: "Entre o transverso do abdome e o peritônio." },
      { letra: "D", texto: "Entre o músculo reto abdominal e o transverso." },
      { letra: "E", texto: "No interior do canal inguinal." },
    ],
    correta: "B",
    explicacao:
      "Os nervos ilioinguinal e ilio-hipogástrico percorrem, na maioria dos indivíduos, o plano entre os músculos oblíquo interno e transverso do abdome, sendo esse o principal alvo dos bloqueios guiados por ultrassom.",
  },
  {
    id: "iih2",
    regiao: "Abdome e Pelve",
    nivel: "avancado",
    enunciado: "Qual variação anatômica dos nervos ilioinguinal e ilio-hipogástrico possui maior relevância clínica para procedimentos intervencionistas?",
    imagemLabel: "Ilioinguinal/Ilio-hipogástrico · Variações",
    alternativas: [
      { letra: "A", texto: "Origem exclusiva em L3." },
      { letra: "B", texto: "Fusão parcial entre os nervos ilioinguinal e ilio-hipogástrico." },
      { letra: "C", texto: "Visualização ultrassonográfica constante." },
      { letra: "D", texto: "Trajeto sempre medial à EIAS." },
      { letra: "E", texto: "Ausência de variações anatômicas." },
    ],
    correta: "B",
    explicacao:
      "A fusão parcial ou a sobreposição funcional entre os nervos ilioinguinal e ilio-hipogástrico é relativamente frequente e pode explicar falhas de bloqueio ou persistência de sintomas após procedimentos seletivos.",
  },
  {
    id: "gf1",
    regiao: "Abdome e Pelve",
    nivel: "basico",
    enunciado: "Qual é a relação anatômica clássica do tronco do nervo genitofemoral antes de sua divisão terminal?",
    imagemLabel: "Genitofemoral · Tronco",
    alternativas: [
      { letra: "A", texto: "No interior do canal inguinal." },
      { letra: "B", texto: "Sobre a face anterior do músculo psoas maior." },
      { letra: "C", texto: "Entre os músculos adutores." },
      { letra: "D", texto: "Medial à veia femoral." },
      { letra: "E", texto: "No forame obturador." },
    ],
    correta: "B",
    explicacao:
      "O nervo genitofemoral emerge sobre a superfície anterior do músculo psoas maior e, posteriormente, divide-se em ramo genital e ramo femoral. Essa relação anatômica é um importante marco ultrassonográfico.",
  },
  {
    id: "gf2",
    regiao: "Abdome e Pelve",
    nivel: "basico",
    enunciado: "Após a divisão do nervo genitofemoral, por qual estrutura anatômica o ramo genital habitualmente percorre seu trajeto?",
    imagemLabel: "Genitofemoral · Ramo genital",
    alternativas: [
      { letra: "A", texto: "Lateralmente à artéria femoral." },
      { letra: "B", texto: "Triângulo femoral." },
      { letra: "C", texto: "Canal inguinal." },
      { letra: "D", texto: "Hiato adutor." },
      { letra: "E", texto: "Túnel do tarso." },
    ],
    correta: "C",
    explicacao:
      "O ramo genital acompanha as estruturas do canal inguinal, fornecendo inervação para o músculo cremáster e para áreas sensitivas da região genital, dependendo do sexo do paciente.",
  },
  {
    id: "gf3",
    regiao: "Abdome e Pelve",
    nivel: "basico",
    enunciado: "Onde o ramo femoral do nervo genitofemoral é habitualmente encontrado após cruzar o ligamento inguinal?",
    imagemLabel: "Genitofemoral · Ramo femoral",
    alternativas: [
      { letra: "A", texto: "Acima do ligamento inguinal." },
      { letra: "B", texto: "Abaixo do ligamento inguinal, na região do triângulo femoral." },
      { letra: "C", texto: "No interior do canal inguinal." },
      { letra: "D", texto: "Dentro do músculo psoas maior." },
      { letra: "E", texto: "No canal de Alcock." },
    ],
    correta: "B",
    explicacao:
      "O ramo femoral atravessa a região abaixo do ligamento inguinal e distribui-se no triângulo femoral, sendo um importante componente da sensibilidade da face anterior proximal da coxa.",
  },
  {
    id: "ciat1",
    regiao: "Quadril",
    nivel: "basico",
    enunciado: "Em sua anatomia mais comum, por onde o nervo ciático emerge da pelve?",
    imagemLabel: "Ciático · Emergência pélvica",
    alternativas: [
      { letra: "A", texto: "Acima do músculo piriforme." },
      { letra: "B", texto: "Através do músculo piriforme." },
      { letra: "C", texto: "Abaixo do músculo piriforme." },
      { letra: "D", texto: "Pelo forame obturador." },
      { letra: "E", texto: "Entre os músculos glúteos." },
    ],
    correta: "C",
    explicacao:
      "Em aproximadamente 85 a 90% dos indivíduos, o nervo ciático emerge abaixo do músculo piriforme. As variações anatômicas são clinicamente importantes e podem estar relacionadas à síndrome do piriforme.",
  },
  {
    id: "pir1",
    regiao: "Quadril",
    nivel: "basico",
    enunciado: "Qual é a origem e inserção anatômica clássica do músculo piriforme?",
    imagemLabel: "Piriforme · Anatomia",
    alternativas: [
      { letra: "A", texto: "Ílio até o colo do fêmur." },
      { letra: "B", texto: "Sacro até o trocânter maior do fêmur." },
      { letra: "C", texto: "Ísquio até o trocânter menor." },
      { letra: "D", texto: "Púbis até o fêmur proximal." },
      { letra: "E", texto: "Sacro até o maléolo medial." },
    ],
    correta: "B",
    explicacao:
      "O músculo piriforme origina-se na face anterior do sacro e insere-se no trocânter maior do fêmur. Sua íntima relação com o nervo ciático explica sua importância na dor glútea profunda e nos procedimentos guiados por ultrassom.",
  },
  {
    id: "pud1",
    regiao: "Abdome e Pelve",
    nivel: "basico",
    enunciado: "Qual é o principal marco anatômico utilizado para a realização do bloqueio do nervo pudendo?",
    imagemLabel: "Pudendo · Referência",
    alternativas: [
      { letra: "A", texto: "Espinha ilíaca ântero-superior." },
      { letra: "B", texto: "Espinha isquiática." },
      { letra: "C", texto: "Trocânter menor." },
      { letra: "D", texto: "Cabeça da fíbula." },
      { letra: "E", texto: "Hiato sacral." },
    ],
    correta: "B",
    explicacao:
      "A espinha isquiática é o principal ponto de referência para o bloqueio do nervo pudendo. Nessa região, o nervo encontra-se próximo ao ligamento sacroespinhoso e à artéria pudenda interna, tornando o Doppler uma ferramenta importante para aumentar a segurança do procedimento.",
  },
  {
    id: "pud2",
    regiao: "Abdome e Pelve",
    nivel: "avancado",
    enunciado: "Ao deixar a pelve em direção ao períneo, qual é a relação anatômica clássica do nervo pudendo com os ligamentos pélvicos?",
    imagemLabel: "Pudendo · Ligamentos",
    alternativas: [
      { letra: "A", texto: "Passa anteriormente aos ligamentos." },
      { letra: "B", texto: "Passa posteriormente aos ligamentos." },
      { letra: "C", texto: "Passa entre os ligamentos sacroespinhoso e sacrotuberoso." },
      { letra: "D", texto: "Passa pelo canal inguinal." },
      { letra: "E", texto: "Passa pelo forame obturador." },
    ],
    correta: "C",
    explicacao:
      "O nervo pudendo atravessa o espaço entre os ligamentos sacroespinhoso e sacrotuberoso antes de penetrar no canal de Alcock. Esse conhecimento anatômico é fundamental para bloqueios, radiofrequência e tratamento das neuralgias pudendas.",
  },
  {
    id: "cfl1",
    regiao: "Quadril",
    nivel: "basico",
    enunciado: "Qual é a localização anatômica mais frequente do nervo cutâneo femoral lateral durante a avaliação ultrassonográfica?",
    imagemLabel: "Cutâneo femoral lateral · Localização",
    alternativas: [
      { letra: "A", texto: "Medial à espinha ilíaca ântero-superior." },
      { letra: "B", texto: "Próximo à espinha ilíaca ântero-superior, passando sob o ligamento inguinal." },
      { letra: "C", texto: "Junto ao maléolo medial." },
      { letra: "D", texto: "Ao redor do colo da fíbula." },
      { letra: "E", texto: "Na fossa poplítea." },
    ],
    correta: "B",
    explicacao:
      "O nervo cutâneo femoral lateral geralmente cruza a região próxima à espinha ilíaca ântero-superior, passando sob ou através do ligamento inguinal. Essa região corresponde ao local mais comum de compressão.",
  },
  {
    id: "cfl2",
    regiao: "Quadril",
    nivel: "basico",
    enunciado: "A meralgia parestésica resulta, na maioria dos casos, da compressão de qual estrutura anatômica?",
    imagemLabel: "Meralgia parestésica",
    alternativas: [
      { letra: "A", texto: "Nervo ulnar no canal cubital." },
      { letra: "B", texto: "Nervo cutâneo femoral lateral sob o ligamento inguinal." },
      { letra: "C", texto: "Nervo pudendo no canal de Alcock." },
      { letra: "D", texto: "Nervo safeno infrapatelar." },
      { letra: "E", texto: "Raiz nervosa de T12." },
    ],
    correta: "B",
    explicacao:
      "A meralgia parestésica é causada pela compressão do nervo cutâneo femoral lateral, geralmente na sua passagem sob o ligamento inguinal. O quadro clínico caracteriza-se por dor, queimação e parestesias na face anterolateral da coxa, sem déficit motor.",
  },
  {
    id: "esp1",
    regiao: "Coluna",
    nivel: "basico",
    enunciado: "No bloqueio do plano do eretor da espinha (ESP Block), qual é o alvo anatômico da injeção?",
    imagemLabel: "ESP Block · Alvo",
    alternativas: [
      { letra: "A", texto: "Espaço epidural." },
      { letra: "B", texto: "Face superficial do músculo eretor da espinha." },
      { letra: "C", texto: "Plano profundo ao músculo eretor da espinha, sobre o processo transverso." },
      { letra: "D", texto: "Cavidade pleural." },
      { letra: "E", texto: "Plano profundo ao trapézio." },
    ],
    correta: "C",
    explicacao:
      "O ESP Block consiste na deposição do anestésico entre o músculo eretor da espinha e o processo transverso vertebral. A disseminação fascial pode atingir ramos dorsais e ventrais dos nervos espinhais.",
  },
  {
    id: "esp2",
    regiao: "Coluna",
    nivel: "avancado",
    enunciado: "Qual das afirmações a respeito do bloqueio do plano do eretor da espinha (ESP Block) é INCORRETA?",
    imagemLabel: "ESP Block · Conceitos",
    alternativas: [
      { letra: "A", texto: "A disseminação fascial desempenha papel importante em sua eficácia." },
      { letra: "B", texto: "Pode atingir ramos neurais adjacentes." },
      { letra: "C", texto: "É sempre equivalente ao bloqueio paravertebral." },
      { letra: "D", texto: "O processo transverso aumenta a segurança da técnica." },
      { letra: "E", texto: "O Doppler pode auxiliar na identificação de estruturas vasculares." },
    ],
    correta: "C",
    explicacao:
      "Embora o ESP Block possa produzir efeitos semelhantes aos do bloqueio paravertebral em alguns pacientes, sua disseminação é variável e ele não deve ser considerado sempre equivalente. Essa é uma das principais armadilhas conceituais sobre a técnica.",
  },
  {
    id: "rcerv1",
    regiao: "Cervical",
    nivel: "basico",
    enunciado: "Na ultrassonografia cervical, onde a raiz nervosa costuma ser identificada em seu corte transversal típico?",
    imagemLabel: "Raízes cervicais · Identificação",
    alternativas: [
      { letra: "A", texto: "No interior do forame intervertebral como estrutura anecoica." },
      { letra: "B", texto: "Entre os tubérculos do processo transverso." },
      { letra: "C", texto: "Entre os músculos trapézio e esplênio." },
      { letra: "D", texto: "No interior do canal vertebral." },
      { letra: "E", texto: "Sobre o esôfago." },
    ],
    correta: "B",
    explicacao:
      "As raízes cervicais localizam-se entre os tubérculos anterior e posterior dos processos transversos, formando o clássico aspecto ultrassonográfico em 'U'. Esse é um importante marco para bloqueios seletivos.",
  },
  {
    id: "rcerv2",
    regiao: "Cervical",
    nivel: "avancado",
    enunciado: "Qual é a complicação potencialmente mais grave durante um bloqueio radicular cervical guiado por ultrassom?",
    imagemLabel: "Bloqueio radicular cervical · Complicações",
    alternativas: [
      { letra: "A", texto: "Pneumotórax." },
      { letra: "B", texto: "Injeção inadvertida na artéria vertebral." },
      { letra: "C", texto: "Lesão do ducto torácico." },
      { letra: "D", texto: "Lesão do nervo ulnar." },
      { letra: "E", texto: "Lesão do nervo tibial." },
    ],
    correta: "B",
    explicacao:
      "A injeção intra-arterial, especialmente na artéria vertebral, pode causar complicações neurológicas catastróficas. O uso cuidadoso do Doppler e a aspiração antes da injeção são medidas fundamentais de segurança.",
  },
  {
    id: "ton1",
    regiao: "Cervical",
    nivel: "avancado",
    enunciado: "O terceiro nervo occipital (Third Occipital Nerve - TON) está anatomicamente relacionado a qual nível cervical?",
    imagemLabel: "TON · Nível anatômico",
    alternativas: [
      { letra: "A", texto: "C1." },
      { letra: "B", texto: "C2." },
      { letra: "C", texto: "C3." },
      { letra: "D", texto: "C4." },
      { letra: "E", texto: "C5." },
    ],
    correta: "C",
    explicacao:
      "O terceiro nervo occipital corresponde ao ramo medial do nervo espinhal C3 e participa da inervação da articulação facetária C2-C3, sendo um alvo frequente em procedimentos de radiofrequência.",
  },
  {
    id: "rmcerv1",
    regiao: "Cervical",
    nivel: "basico",
    enunciado: "Durante o bloqueio do ramo medial cervical guiado por ultrassom, qual é o principal alvo anatômico?",
    imagemLabel: "Ramo medial cervical · Alvo",
    alternativas: [
      { letra: "A", texto: "Interior do forame intervertebral." },
      { letra: "B", texto: "Corpo vertebral." },
      { letra: "C", texto: "Região periarticular das articulações facetárias." },
      { letra: "D", texto: "Canal vertebral central." },
      { letra: "E", texto: "Cavidade pleural." },
    ],
    correta: "C",
    explicacao:
      "Os ramos mediais cervicais percorrem a região adjacente às articulações facetárias, sendo responsáveis pela sua inervação. O posicionamento adequado da agulha nessa área é essencial para bloqueios diagnósticos e procedimentos de radiofrequência.",
  },
  {
    id: "rdl5",
    regiao: "Coluna",
    nivel: "avancado",
    enunciado: "Durante procedimentos intervencionistas na coluna lombossacra, com qual estrutura anatômica o ramo dorsal de L5 apresenta relação mais íntima?",
    imagemLabel: "Ramo dorsal L5 · Anatomia",
    alternativas: [
      { letra: "A", texto: "Asa do sacro." },
      { letra: "B", texto: "Processo transverso de L3." },
      { letra: "C", texto: "Hiato sacral." },
      { letra: "D", texto: "Forame obturador." },
      { letra: "E", texto: "Cabeça da fíbula." },
    ],
    correta: "A",
    explicacao:
      "O ramo dorsal de L5 cruza a asa do sacro e constitui um importante alvo em procedimentos de denervação da articulação sacroilíaca. O reconhecimento dessa relação anatômica aumenta a precisão das técnicas de radiofrequência.",
  },
  {
    id: "ag1",
    regiao: "Física do US",
    nivel: "basico",
    enunciado: "Ao utilizar uma abordagem com ângulo muito inclinado da agulha em relação ao transdutor, qual recurso melhora sua visualização ultrassonográfica?",
    imagemLabel: "Física · Visualização da agulha",
    alternativas: [
      { letra: "A", texto: "Aumentar a PRF." },
      { letra: "B", texto: "Reduzir a profundidade." },
      { letra: "C", texto: "Ajustar o ângulo do feixe (beam steering) ou modificar a inclinação do transdutor." },
      { letra: "D", texto: "Ativar o Doppler colorido." },
      { letra: "E", texto: "Aumentar excessivamente o ganho." },
    ],
    correta: "C",
    explicacao:
      "O beam steering e os ajustes na inclinação do transdutor aumentam a quantidade de ecos refletidos pela agulha em direção ao probe, melhorando significativamente sua visualização.",
  },
  {
    id: "si1",
    regiao: "Coluna",
    nivel: "basico",
    enunciado: "Qual estrutura nervosa é responsável pela maior parte da inervação posterior da articulação sacroilíaca?",
    imagemLabel: "Sacroilíaca · Inervação",
    alternativas: [
      { letra: "A", texto: "Ramos ventrais lombares." },
      { letra: "B", texto: "Ramos laterais sacrais." },
      { letra: "C", texto: "Nervo femoral." },
      { letra: "D", texto: "Nervo obturatório." },
      { letra: "E", texto: "Plexo hipogástrico." },
    ],
    correta: "B",
    explicacao:
      "A porção posterior da articulação sacroilíaca recebe inervação predominantemente dos ramos laterais dos nervos sacrais, tornando-os importantes alvos para bloqueios diagnósticos e radiofrequência.",
  },
  {
    id: "si2",
    regiao: "Coluna",
    nivel: "avancado",
    enunciado: "O padrão de inervação mais aceito para a dor proveniente da articulação sacroilíaca envolve:",
    imagemLabel: "Sacroilíaca · Padrão neural",
    alternativas: [
      { letra: "A", texto: "Apenas a raiz de L5." },
      { letra: "B", texto: "Apenas a raiz de S1." },
      { letra: "C", texto: "Ramos laterais sacrais associados ao ramo dorsal de L5." },
      { letra: "D", texto: "Exclusivamente fibras simpáticas." },
      { letra: "E", texto: "Exclusivamente o nervo pudendo." },
    ],
    correta: "C",
    explicacao:
      "A maioria das técnicas modernas de denervação da articulação sacroilíaca contempla tanto os ramos laterais sacrais quanto o ramo dorsal de L5, devido à participação conjunta dessas estruturas na transmissão dolorosa.",
  },
  {
    id: "si3",
    regiao: "Coluna",
    nivel: "avancado",
    enunciado: "Na radiofrequência para dor da articulação sacroilíaca, qual estratégia técnica apresenta melhor fundamentação anatômica?",
    imagemLabel: "Sacroilíaca · RF estratégia",
    alternativas: [
      { letra: "A", texto: "Lesão única em um ponto." },
      { letra: "B", texto: "Realização de lesões seriadas ao longo do trajeto neural." },
      { letra: "C", texto: "Lesão intraforaminal." },
      { letra: "D", texto: "Lesão exclusivamente intra-articular." },
      { letra: "E", texto: "Lesão do nervo pudendo." },
    ],
    correta: "B",
    explicacao:
      "Devido à distribuição variável dos ramos laterais sacrais, a realização de múltiplas lesões sequenciais aumenta a probabilidade de desnervação efetiva.",
  },
  {
    id: "si4",
    regiao: "Coluna",
    nivel: "avancado",
    enunciado: "Qual é um erro conceitual frequente durante o planejamento da radiofrequência para dor sacroilíaca?",
    imagemLabel: "Sacroilíaca · Erros conceituais",
    alternativas: [
      { letra: "A", texto: "Considerar os ramos laterais sacrais como alvo." },
      { letra: "B", texto: "Incluir o ramo dorsal de L5 no tratamento." },
      { letra: "C", texto: "Considerar o DRG de L5 como alvo primário da denervação sacroilíaca." },
      { letra: "D", texto: "Tratar a região lateral do sacro." },
      { letra: "E", texto: "Utilizar a linha peri-foraminal como referência." },
    ],
    correta: "C",
    explicacao:
      "O DRG de L5 não é o alvo primário das técnicas convencionais de radiofrequência para a articulação sacroilíaca. O foco deve ser o ramo dorsal de L5 e os ramos laterais sacrais.",
  },
  {
    id: "caud1",
    regiao: "Coluna",
    nivel: "basico",
    enunciado: "Qual é a causa técnica mais comum de falha na realização da epidural caudal guiada por ultrassom?",
    imagemLabel: "Epidural caudal · Falha técnica",
    alternativas: [
      { letra: "A", texto: "Punção dural." },
      { letra: "B", texto: "Posicionamento da agulha fora do canal sacral." },
      { letra: "C", texto: "Punção inadvertida da artéria carótida." },
      { letra: "D", texto: "Bloqueio do nervo frênico." },
      { letra: "E", texto: "Lesão do nervo ulnar." },
    ],
    correta: "B",
    explicacao:
      "A principal causa de insucesso é a introdução da agulha fora do hiato ou do canal sacral. A identificação ultrassonográfica dos cornos sacrais e do ligamento sacrococcígeo reduz significativamente essa ocorrência.",
  },
  {
    id: "caud2",
    regiao: "Coluna",
    nivel: "basico",
    enunciado: "Qual achado ultrassonográfico sugere o posicionamento adequado da solução durante uma epidural caudal?",
    imagemLabel: "Epidural caudal · Sinal de sucesso",
    alternativas: [
      { letra: "A", texto: "Saída de líquor." },
      { letra: "B", texto: "Visualização do filum terminale." },
      { letra: "C", texto: "Expansão do espaço epidural com dispersão da solução." },
      { letra: "D", texto: "Visualização das costelas." },
      { letra: "E", texto: "Contração muscular." },
    ],
    correta: "C",
    explicacao:
      "A observação da expansão do espaço epidural durante a injeção é um dos sinais mais confiáveis de posicionamento adequado da ponta da agulha.",
  },
  {
    id: "ani2",
    regiao: "Física do US",
    nivel: "basico",
    enunciado: "Durante o exame ultrassonográfico, um tendão torna-se artificialmente escurecido quando o transdutor é inclinado. Esse fenômeno corresponde a:",
    imagemLabel: "Física · Anisotropia tendínea",
    alternativas: [
      { letra: "A", texto: "Reforço acústico posterior." },
      { letra: "B", texto: "Anisotropia." },
      { letra: "C", texto: "Reverberação." },
      { letra: "D", texto: "Imagem em espelho." },
      { letra: "E", texto: "Sombra acústica." },
    ],
    correta: "B",
    explicacao:
      "A anisotropia é particularmente importante na avaliação dos tendões e pode simular tendinopatias ou rupturas se o operador não mantiver o feixe perpendicular às fibras.",
  },
  {
    id: "tend1",
    regiao: "Física do US",
    nivel: "basico",
    enunciado: "Na avaliação ultrassonográfica musculoesquelética, qual estrutura normalmente apresenta padrão fibrilar hiperecogênico?",
    imagemLabel: "MSK · Padrão tendíneo",
    alternativas: [
      { letra: "A", texto: "Nervo periférico." },
      { letra: "B", texto: "Tendão." },
      { letra: "C", texto: "Veia." },
      { letra: "D", texto: "Linfonodo." },
      { letra: "E", texto: "Tecido adiposo." },
    ],
    correta: "B",
    explicacao:
      "Os tendões apresentam aspecto fibrilar hiperecogênico em eixo longitudinal, refletindo a organização paralela das fibras colágenas. Esse padrão é um dos principais critérios para sua identificação ao ultrassom.",
  },
  {
    id: "stc1",
    regiao: "Punho e Mão",
    nivel: "avancado",
    enunciado: "Em relação aos critérios ultrassonográficos para o diagnóstico da síndrome do túnel do carpo, assinale a alternativa CORRETA:",
    imagemLabel: "Punho · Túnel do carpo",
    alternativas: [
      { letra: "A", texto: "A medida isolada da AST do nervo mediano acima de 9 mm² confirma o diagnóstico, independentemente do local de mensuração." },
      { letra: "B", texto: "A redução da mobilidade longitudinal do nervo mediano é o principal critério diagnóstico, sendo a AST apenas um achado secundário." },
      { letra: "C", texto: "O aumento da AST ao nível do pisiforme, associado a uma relação túnel/antebraço ≥ 1,4 ou diferença significativa entre AST no túnel e no antebraço distal, é um critério aceito." },
      { letra: "D", texto: "O espessamento do ligamento transverso do carpo apresenta maior sensibilidade que a medida da AST do nervo mediano." },
    ],
    correta: "C",
    explicacao:
      "O principal critério ultrassonográfico é o aumento da área de secção transversal do nervo mediano, especialmente ao nível do pisiforme. A comparação com a AST do antebraço distal (delta AST ou relação túnel/antebraço) aumenta a acurácia diagnóstica e reduz erros decorrentes da variabilidade anatômica individual.",
  },
  {
    id: "med1",
    regiao: "Punho e Mão",
    nivel: "avancado",
    enunciado: "Qual das alternativas abaixo NÃO corresponde a um local clássico de aprisionamento do nervo mediano?",
    imagemLabel: "Nervo mediano · Compressões",
    alternativas: [
      { letra: "A", texto: "Ligamento de Struthers." },
      { letra: "B", texto: "Lacertus fibrosus (aponeurose do bíceps)." },
      { letra: "C", texto: "Cabeça profunda do músculo pronador redondo." },
      { letra: "D", texto: "Arcada de Frohse." },
    ],
    correta: "D",
    explicacao:
      "A arcada de Frohse é o principal local de compressão do nervo interósseo posterior (ramo profundo do nervo radial), e não do nervo mediano. As demais alternativas representam pontos clássicos de compressão proximal do nervo mediano.",
  },
  {
    id: "cap1",
    regiao: "Ombro",
    nivel: "avancado",
    enunciado: "Na avaliação ultrassonográfica da capsulite adesiva (ombro congelado), qual conjunto de achados é mais característico?",
    imagemLabel: "Ombro · Capsulite adesiva",
    alternativas: [
      { letra: "A", texto: "Aumento difuso do sinal Doppler na bursa subacromial-subdeltoidea." },
      { letra: "B", texto: "Espessamento do ligamento coracoumeral, geralmente sem alterações ao Doppler." },
      { letra: "C", texto: "Derrame glenoumeral importante como principal achado." },
      { letra: "D", texto: "Espessamento do ligamento coracoumeral e do intervalo dos rotadores, aumento focal do Doppler nessa região e redução da mobilidade dinâmica do manguito rotador." },
    ],
    correta: "D",
    explicacao:
      "Os achados mais reconhecidos incluem espessamento do ligamento coracoumeral, alterações do intervalo dos rotadores, hipervascularização ao Doppler e limitação da mobilidade dinâmica do ombro. O ultrassom complementa, mas não substitui, a avaliação clínica.",
  },
  {
    id: "ax1",
    regiao: "Ombro",
    nivel: "basico",
    enunciado: "Quais músculos são exclusivamente inervados pelo nervo axilar?",
    imagemLabel: "Nervo axilar · Inervação motora",
    alternativas: [
      { letra: "A", texto: "Deltoide, redondo menor e cabeça longa do tríceps." },
      { letra: "B", texto: "Deltoide, redondo menor e supraespinal." },
      { letra: "C", texto: "Deltoide e redondo menor." },
      { letra: "D", texto: "Deltoide, redondo maior e redondo menor." },
    ],
    correta: "C",
    explicacao:
      "O nervo axilar fornece inervação motora apenas para os músculos deltoide e redondo menor. O conhecimento dessa anatomia auxilia na interpretação de déficits neurológicos e no planejamento de bloqueios.",
  },
  {
    id: "qdr1",
    regiao: "Quadril",
    nivel: "avancado",
    enunciado: "Durante a punção intra-articular anterior do quadril guiada por ultrassom, qual estrutura vascular deve ser identificada e evitada?",
    imagemLabel: "Quadril · Punção anterior",
    alternativas: [
      { letra: "A", texto: "Artéria femoral comum." },
      { letra: "B", texto: "Artéria circunflexa femoral lateral." },
      { letra: "C", texto: "Artéria obturatória." },
      { letra: "D", texto: "Ramo ascendente da artéria circunflexa femoral medial." },
    ],
    correta: "B",
    explicacao:
      "A artéria circunflexa femoral lateral, especialmente seu ramo ascendente, cruza a região anterior do colo femoral e pode estar no trajeto da agulha. A avaliação com Doppler aumenta significativamente a segurança do procedimento.",
  },
  {
    id: "kn1",
    regiao: "Punho e Mão",
    nivel: "avancado",
    enunciado: "Durante o teste da pinça (\"OK sign\"), observa-se incapacidade de flexão da falange distal do polegar e do indicador, sem alteração sensitiva. Qual é o diagnóstico mais provável?",
    imagemLabel: "Semiologia · Sinal de Kiloh-Nevin",
    alternativas: [
      { letra: "A", texto: "Sinal de Froment — lesão do nervo ulnar." },
      { letra: "B", texto: "Sinal de Kiloh-Nevin — comprometimento do nervo interósseo anterior." },
      { letra: "C", texto: "Síndrome do túnel do carpo." },
      { letra: "D", texto: "Lesão do nervo radial profundo." },
      { letra: "E", texto: "Lesão do nervo musculocutâneo." },
    ],
    correta: "B",
    explicacao:
      "A síndrome de Kiloh-Nevin corresponde à neuropatia do nervo interósseo anterior, um ramo exclusivamente motor do nervo mediano. A ausência de alterações sensitivas é uma característica importante desse quadro.",
  },
  {
    id: "uln1",
    regiao: "Punho e Mão",
    nivel: "avancado",
    enunciado: "Paciente apresenta sinal de Froment positivo, garra ulnar, fraqueza intrínseca da mão e hipoestesia da borda ulnar, com preservação da sensibilidade do dorso proximal da mão. Qual é o diagnóstico mais provável?",
    imagemLabel: "Semiologia · Nervo ulnar",
    alternativas: [
      { letra: "A", texto: "Lesão do nervo interósseo anterior." },
      { letra: "B", texto: "Lesão do nervo ulnar ao nível do cotovelo." },
      { letra: "C", texto: "Lesão do nervo ulnar no canal de Guyon, com preservação do ramo dorsal e do FDP do quinto dedo." },
      { letra: "D", texto: "Lesão proximal do plexo braquial." },
      { letra: "E", texto: "Lesão do nervo radial profundo." },
    ],
    correta: "C",
    explicacao:
      "A preservação da sensibilidade do dorso proximal da mão sugere que o ramo cutâneo dorsal do nervo ulnar já foi emitido, localizando a lesão distalmente, ao nível do canal de Guyon.",
  },
  {
    id: "iih3",
    regiao: "Abdome e Pelve",
    nivel: "basico",
    enunciado: "Em relação à origem anatômica dos nervos ilio-hipogástrico e ilioinguinal, assinale a alternativa correta.",
    imagemLabel: "Plexo lombar · Origem",
    alternativas: [
      { letra: "A", texto: "Ambos se originam exclusivamente de L2." },
      { letra: "B", texto: "Originam-se de T12-L1 e L2." },
      { letra: "C", texto: "São ramos do plexo lombar, predominantemente de L1, podendo receber contribuição de T12." },
      { letra: "D", texto: "São ramos terminais do nervo genitofemoral." },
      { letra: "E", texto: "Originam-se do plexo sacral." },
    ],
    correta: "C",
    explicacao:
      "Ambos os nervos derivam principalmente da raiz de L1, podendo receber fibras de T12. Essa variação anatômica explica diferenças clínicas e possíveis falhas em bloqueios seletivos.",
  },
  {
    id: "sens1",
    regiao: "Geral",
    nivel: "avancado",
    enunciado: "Quais dos nervos abaixo são considerados essencialmente sensitivos?",
    imagemLabel: "Nervos · Função sensitiva",
    alternativas: [
      { letra: "A", texto: "Sural, safeno, cutâneo femoral lateral e auricular maior." },
      { letra: "B", texto: "Sural, safeno, radial superficial e fibular profundo." },
      { letra: "C", texto: "Cutâneo femoral lateral, intercostobraquial, fibular comum e ilioinguinal." },
      { letra: "D", texto: "Auriculotemporal, cutâneo medial do braço, tibial e sural." },
      { letra: "E", texto: "Safeno, sural, radial superficial e tibial posterior." },
    ],
    correta: "A",
    explicacao:
      "Os nervos sural, safeno, cutâneo femoral lateral e auricular maior possuem função predominantemente sensitiva, tornando-se excelentes alvos para bloqueios destinados ao tratamento da dor sem comprometimento motor.",
  },
  {
    id: "fp1",
    regiao: "Pé e Tornozelo",
    nivel: "avancado",
    enunciado: "Qual achado ultrassonográfico é mais compatível com o diagnóstico de fascite plantar?",
    imagemLabel: "Pé · Fáscia plantar",
    alternativas: [
      { letra: "A", texto: "Espessura de 2,8 mm com padrão fibrilar preservado." },
      { letra: "B", texto: "Espessura de 3,6 mm sem alterações estruturais." },
      { letra: "C", texto: "Espessura de 3,9 mm associada à hipoecogenicidade." },
      { letra: "D", texto: "Espessura de 4,6 mm associada à perda do padrão fibrilar." },
      { letra: "E", texto: "Espessura de 5,0 mm localizada exclusivamente no terço médio." },
    ],
    correta: "D",
    explicacao:
      "Os critérios ultrassonográficos clássicos incluem espessamento da fáscia plantar (geralmente acima de 4 mm), perda do padrão fibrilar normal e hipoecogenicidade. Esses achados, associados ao quadro clínico, sustentam o diagnóstico de fascite plantar.",
  },
  {
    id: "ipack1",
    regiao: "Joelho",
    nivel: "avancado",
    enunciado: "Em relação ao bloqueio IPACK (Infiltration between the Popliteal Artery and Capsule of the Knee), assinale a alternativa CORRETA.",
    imagemLabel: "Joelho · IPACK",
    alternativas: [
      { letra: "A", texto: "Produz bloqueio motor completo do nervo tibial." },
      { letra: "B", texto: "Tem como principal alvo o nervo fibular comum." },
      { letra: "C", texto: "Promove bloqueio dos ramos articulares sensitivos posteriores do joelho, preservando, em grande parte, a função motora." },
      { letra: "D", texto: "É equivalente ao bloqueio poplíteo convencional." },
      { letra: "E", texto: "Seu principal alvo é o nervo safeno." },
    ],
    correta: "C",
    explicacao:
      "O IPACK foi desenvolvido para proporcionar analgesia da cápsula posterior do joelho, bloqueando ramos articulares sensitivos provenientes principalmente dos nervos tibial e obturatório, com mínima interferência na função motora distal.",
  },
  {
    id: "torn1",
    regiao: "Pé e Tornozelo",
    nivel: "basico",
    enunciado: "Após um trauma em inversão do tornozelo, quais estruturas são mais frequentemente lesionadas?",
    imagemLabel: "Tornozelo · Trauma em inversão",
    alternativas: [
      { letra: "A", texto: "Complexo ligamentar deltóide." },
      { letra: "B", texto: "Ligamento talofibular anterior, ligamento calcaneofibular e tendões fibulares." },
      { letra: "C", texto: "Ligamento talofibular posterior e sindesmose tibiofibular." },
      { letra: "D", texto: "Ligamento plantar calcaneonavicular (Spring ligament)." },
      { letra: "E", texto: "Complexo ligamentar medial profundo." },
    ],
    correta: "B",
    explicacao:
      "O mecanismo de inversão acomete preferencialmente o complexo ligamentar lateral do tornozelo, especialmente o ligamento talofibular anterior. Lesões associadas dos tendões fibulares também são relativamente frequentes.",
  },
  {
    id: "rf1",
    regiao: "Coluna",
    nivel: "avancado",
    enunciado: "Sobre as técnicas neuroablativas utilizadas no tratamento da dor, assinale a alternativa INCORRETA.",
    imagemLabel: "Intervencionismo · Neuroablação",
    alternativas: [
      { letra: "A", texto: "A radiofrequência térmica promove lesão neural por calor." },
      { letra: "B", texto: "A crioablação tende a preservar os envoltórios neurais." },
      { letra: "C", texto: "A radiofrequência resfriada produz lesões de maior volume." },
      { letra: "D", texto: "A radiofrequência resfriada representa uma forma híbrida de crioablação." },
      { letra: "E", texto: "A radiofrequência pulsada possui efeito predominantemente neuromodulatório." },
    ],
    correta: "D",
    explicacao:
      "A radiofrequência resfriada não é uma forma de crioablação. O resfriamento interno da cânula apenas permite a formação de lesões térmicas maiores e mais homogêneas. Já a crioablação utiliza um mecanismo físico completamente diferente, baseado em baixas temperaturas.",
  },
  {
    id: "facet1",
    regiao: "Cervical",
    nivel: "avancado",
    enunciado: "Na imagem ultrassonográfica apresentada, as estruturas anatômicas correspondem a:",
    imagemLabel: "Cervical · Facetas",
    alternativas: [
      { letra: "A", texto: "Processos espinhosos cervicais." },
      { letra: "B", texto: "Lâminas cervicais." },
      { letra: "C", texto: "Articulações facetárias cervicais." },
      { letra: "D", texto: "Ligamento amarelo (ligamentum flavum)." },
      { letra: "E", texto: "Raízes nervosas no forame intervertebral." },
    ],
    correta: "C",
    explicacao:
      "As articulações facetárias cervicais apresentam aspecto ultrassonográfico característico e constituem importante referência para bloqueios diagnósticos e procedimentos de radiofrequência dos ramos mediais cervicais.",
  },
  {
    id: "estr1",
    regiao: "Cervical",
    nivel: "avancado",
    enunciado: "Durante o bloqueio do gânglio estrelado guiado por ultrassom ao nível de C6, qual correlação anatômica está CORRETA?",
    imagemLabel: "Cervical · Gânglio estrelado",
    alternativas: [
      { letra: "A", texto: "Traqueia e músculo escaleno anterior representam o principal alvo." },
      { letra: "B", texto: "O esôfago deslocável e o músculo longo do pescoço constituem importantes referências anatômicas, sendo este último o principal alvo da injeção." },
      { letra: "C", texto: "A cadeia simpática cervical é sempre diretamente visível ao ultrassom." },
      { letra: "D", texto: "O nervo laríngeo recorrente é o principal alvo anatômico." },
      { letra: "E", texto: "A tireoide e o músculo longo da cabeça são os principais marcos para a injeção." },
    ],
    correta: "B",
    explicacao:
      "Na técnica moderna guiada por ultrassom, a solução é depositada sobre a fáscia do músculo longo do pescoço (longus colli). O esôfago, especialmente à esquerda, deve ser identificado e evitado. A cadeia simpática nem sempre é visualizada diretamente, tornando os marcos anatômicos fundamentais para a segurança do procedimento.",
  },
  {
    id: "seg1",
    regiao: "Geral",
    nivel: "avancado",
    enunciado: "Qual das alternativas abaixo representa um princípio geral de segurança aplicável à maioria dos procedimentos intervencionistas guiados por ultrassom?",
    imagemLabel: "Intervencionismo · Segurança",
    alternativas: [
      { letra: "A", texto: "O uso do Doppler é dispensável quando a anatomia é conhecida." },
      { letra: "B", texto: "A ponta da agulha pode ser inferida mesmo sem visualização direta." },
      { letra: "C", texto: "A visualização contínua da ponta da agulha e a identificação prévia das estruturas vasculares reduzem significativamente o risco de complicações." },
      { letra: "D", texto: "O ganho elevado melhora a segurança do procedimento." },
      { letra: "E", texto: "A hidrodissecção deve ser evitada em bloqueios periféricos." },
    ],
    correta: "C",
    explicacao:
      "Independentemente da técnica realizada, a visualização contínua da ponta da agulha, a utilização criteriosa do Doppler e o conhecimento anatômico são os pilares da segurança em procedimentos intervencionistas guiados por ultrassom. Esses princípios reduzem o risco de punção vascular, lesão neural e falhas técnicas.",
  },
  {
    id: "q-ulnar-ramo-dorsal-neuroma",
    regiao: "Nervos Periféricos",
    nivel: "avancado",
    enunciado:
      "Paciente com dor neuropática em queimação e sensação de choque na face dorso-ulnar do punho e da mão, irradiando para o dorso do 5º dedo e metade ulnar do 4º dedo, sem qualquer déficit motor e com sensibilidade palmar preservada. Ao US, identifica-se formação fusiforme hipoecogênica no trajeto de um pequeno ramo que emerge do nervo ulnar cerca de 6 cm proximalmente ao estiloide ulnar, perfurando a fáscia em direção dorsal. Qual é o diagnóstico topográfico mais provável?",
    imagemLabel: "Antebraço distal · ramo cutâneo dorsal do nervo ulnar",
    alternativas: [
      { letra: "A", texto: "Neuroma do ramo profundo (motor) do nervo ulnar no canal de Guyon." },
      { letra: "B", texto: "Neuroma do ramo superficial (sensitivo) do nervo ulnar no canal de Guyon." },
      { letra: "C", texto: "Neuroma do ramo cutâneo dorsal do nervo ulnar, no antebraço distal." },
      { letra: "D", texto: "Neuroma do ramo cutâneo palmar do nervo mediano." },
      { letra: "E", texto: "Síndrome do túnel cubital com aprisionamento no ligamento de Osborne." },
    ],
    correta: "C",
    explicacao:
      "O ramo cutâneo dorsal do nervo ulnar é puramente sensitivo e origina-se cerca de 5–8 cm proximalmente ao estiloide ulnar, antes do canal de Guyon. Um neuroma nesse ramo cursa com dor neuropática (queimação, choque, Tinel positivo) restrita ao território dorsal ulnar (dorso da metade ulnar da mão, 5º dedo e metade ulnar do 4º dedo), sem déficit motor (é ramo puramente sensitivo) e com sensibilidade palmar preservada (poupada pelos ramos superficial e profundo, que se originam distalmente, no canal de Guyon). Justamente por sua origem proximal ao canal, esse território é preservado nas lesões do canal de Guyon — inversamente, uma lesão isolada aqui poupa a palma. Alternativas A/B envolveriam sintomas palmares e/ou motores; D refere-se a território palmar radial; E cursa com sintomas motores intrínsecos e sensitivos palmares ulnares.",
  },
  {
    id: "q-ulnar-guyon-zonas",
    regiao: "Nervos Periféricos",
    nivel: "avancado",
    enunciado:
      "Paciente ciclista de longa distância evolui com fraqueza dos músculos interósseos e do adutor do polegar (Froment positivo), SEM alteração sensitiva na palma ou no dorso da mão. Qual é a topografia mais provável da lesão do nervo ulnar?",
    imagemLabel: "Canal de Guyon · zonas",
    alternativas: [
      { letra: "A", texto: "Zona 1 do canal de Guyon (antes da bifurcação) — déficit misto." },
      { letra: "B", texto: "Zona 2 do canal de Guyon (ramo profundo motor) — déficit puramente motor." },
      { letra: "C", texto: "Zona 3 do canal de Guyon (ramo superficial sensitivo)." },
      { letra: "D", texto: "Túnel cubital no cotovelo." },
      { letra: "E", texto: "Ramo cutâneo dorsal do nervo ulnar." },
    ],
    correta: "B",
    explicacao:
      "A 'paralisia do guidão' clássica dos ciclistas corresponde à compressão do ramo profundo (motor) do nervo ulnar na Zona 2 do canal de Guyon — sobre o hâmulo do hamato. O quadro é puramente motor (interósseos, adutor do polegar, Froment positivo), sem alteração sensitiva palmar (ramo superficial poupado) nem dorsal (ramo cutâneo dorsal origina-se proximalmente, no antebraço). Lesões do túnel cubital ou proximais dariam alteração sensitiva dorsal também.",
  },
  {
    id: "q-ulnar-ast-cotovelo",
    regiao: "Nervos Periféricos",
    nivel: "avancado",
    enunciado:
      "Ao avaliar o nervo ulnar no sulco entre o olécrano e o epicôndilo medial, qual valor de área de secção transversal (AST) é considerado altamente sugestivo de síndrome do túnel cubital?",
    imagemLabel: "Nervo ulnar · AST cotovelo",
    alternativas: [
      { letra: "A", texto: "AST > 0,05 cm² (> 5 mm²)." },
      { letra: "B", texto: "AST entre 0,06 e 0,09 cm²." },
      { letra: "C", texto: "AST > 0,10 cm² (> 10 mm²), sendo altamente sugestiva quando > 0,13 cm²." },
      { letra: "D", texto: "AST > 0,20 cm² (> 20 mm²)." },
      { letra: "E", texto: "A AST não tem valor diagnóstico; apenas o padrão fascicular importa." },
    ],
    correta: "C",
    explicacao:
      "O valor de referência para o nervo ulnar no cotovelo é AST < 0,10 cm² (< 10 mm²). Valores entre 0,10 e 0,13 cm² são limítrofes e devem ser correlacionados clinicamente; AST > 0,13 cm² é altamente sugestiva de síndrome do túnel cubital. Além da AST, deve-se avaliar o padrão fascicular, o sinal da ampulheta (hourglass) no eixo longitudinal e a mobilidade dinâmica do nervo (subluxação em flexão).",
  },
  {
    id: "q-ulnar-osborne",
    regiao: "Nervos Periféricos",
    nivel: "avancado",
    enunciado:
      "Sobre o ligamento de Osborne (retináculo do túnel cubital), qual afirmativa é correta?",
    imagemLabel: "Ligamento de Osborne",
    alternativas: [
      { letra: "A", texto: "É um ligamento intra-articular do cotovelo." },
      { letra: "B", texto: "Sua espessura normal em indivíduos saudáveis situa-se entre 0,4 e 0,9 mm; espessamentos maiores sugerem componente compressivo." },
      { letra: "C", texto: "Origina-se no processo coronoide e insere-se no rádio." },
      { letra: "D", texto: "Nunca deve ser avaliado ao ultrassom por ser inacessível." },
      { letra: "E", texto: "É responsável pela compressão do nervo mediano no cotovelo." },
    ],
    correta: "B",
    explicacao:
      "O ligamento de Osborne é o teto fibroso do túnel cubital, unindo o epicôndilo medial ao olécrano sobre o nervo ulnar. Em indivíduos saudáveis, sua espessura mede entre 0,4 e 0,9 mm ao US; espessamento além desses valores é fator compressivo relevante. Não é intra-articular, não envolve o mediano e é bem acessível com transdutores lineares de alta frequência.",
  },
  {
    id: "q-ulnar-subluxacao",
    regiao: "Nervos Periféricos",
    nivel: "avancado",
    enunciado:
      "Qual manobra é indispensável na avaliação ultrassonográfica do nervo ulnar no cotovelo para não perder o diagnóstico de subluxação?",
    imagemLabel: "Nervo ulnar · avaliação dinâmica",
    alternativas: [
      { letra: "A", texto: "Estudo apenas em extensão máxima do cotovelo." },
      { letra: "B", texto: "Compressão sonopalpatória do epicôndilo medial." },
      { letra: "C", texto: "Avaliação dinâmica com flexo-extensão do cotovelo, observando o deslocamento do nervo sobre o epicôndilo medial." },
      { letra: "D", texto: "Uso obrigatório de contraste ecográfico." },
      { letra: "E", texto: "Avaliação apenas em corte longitudinal." },
    ],
    correta: "C",
    explicacao:
      "A subluxação do nervo ulnar sobre o epicôndilo medial só é identificada durante a flexo-extensão ativa do cotovelo (avaliação dinâmica em corte transverso). Estudos estáticos podem ser normais mesmo em pacientes sintomáticos. A manobra dinâmica é decisiva para diferenciar aprisionamento (túnel cubital) de subluxação recorrente — o que altera o planejamento cirúrgico (descompressão simples vs. transposição anterior).",
  },
];

