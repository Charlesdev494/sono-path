import fascitePlantarUs from "@/assets/fascite-plantar-us.png.asset.json";
import stcMedianoUs from "@/assets/stc-mediano-us.png.asset.json";
import hansenUlnarMedidas from "@/assets/hansen-ulnar-medidas.png.asset.json";
import hansenUlnarAst from "@/assets/hansen-ulnar-ast.png.asset.json";
import hansenMancha from "@/assets/hansen-mancha-hipocromica.png.asset.json";
import rizartrosePuncao from "@/assets/caso-rizartrose-puncao.png.asset.json";
import medianoRatioPosicao from "@/assets/mediano-tc-ratio-posicao.png.asset.json";
import medianoRatioDistal from "@/assets/mediano-tc-ratio-distal.png.asset.json";
import medianoRatioProximal from "@/assets/mediano-tc-ratio-proximal.png.asset.json";
import medianoRatioComparativo from "@/assets/mediano-tc-ratio-comparativo.png.asset.json";



export type CasoQuestao = {
  id: string;
  pergunta: string;
  alternativas: { letra: "A" | "B" | "C" | "D"; texto: string }[];
  correta: "A" | "B" | "C" | "D";
  comentario: string;
  imagemUrl?: string;
  imagemLabel?: string;
};


export type CasoClinico = {
  id: string;
  semana: number;
  titulo: string;
  regiao: string;
  imagemUrl?: string;
  imagemLabel?: string;
  apresentacao: string;
  examesFisicos: string;
  questoes: CasoQuestao[];
  resolucao: string;
};

export const CASOS: CasoClinico[] = [
  {
    id: "caso-fascite",
    semana: 0,
    titulo: "Dor plantar matinal em mulher de 38 anos",
    regiao: "Tornozelo/Pé",
    imagemUrl: fascitePlantarUs.url,
    imagemLabel: "Pé · Longitudinal plantar — inserção calcânea",
    apresentacao:
      "Mulher, 38 anos, queixa de dor plantar há 3 meses, pior ao levantar da cadeira e nos primeiros passos pela manhã. Melhora parcial após alguns minutos de marcha. Sem trauma. Trabalha em pé.",
    examesFisicos:
      "Dor à palpação do tubérculo medial do calcâneo. Windlass test positivo. Encurtamento do tríceps sural. Sem alterações neurológicas.",
    questoes: [
      {
        id: "fp1",
        pergunta:
          "Qual estrutura está sendo medida no corte longitudinal sobre o calcâneo?",
        alternativas: [
          { letra: "A", texto: "Tendão calcâneo (Aquiles)" },
          { letra: "B", texto: "Fáscia plantar — inserção no calcâneo" },
          { letra: "C", texto: "Ligamento calcaneonavicular (spring)" },
          { letra: "D", texto: "Músculo flexor curto dos dedos" },
        ],
        correta: "B",
        comentario:
          "A imagem mostra a fáscia plantar na inserção calcânea, em corte longitudinal. A medida (0,43 cm) corresponde à espessura logo após a origem no tubérculo medial.",
      },
      {
        id: "fp2",
        pergunta:
          "Qual o limite superior de normalidade para a espessura da fáscia plantar à US?",
        alternativas: [
          { letra: "A", texto: "20 mm" },
          { letra: "B", texto: "40 mm" },
          { letra: "C", texto: "60 mm" },
          { letra: "D", texto: "100 mm" },
        ],
        correta: "B",
        comentario:
          "O limite aceito é 40 mm. Acima disso, associado a hipoecogenicidade e perda do padrão fibrilar, caracteriza fascite plantar.",
      },
      {
        id: "fp3",
        pergunta:
          "Qual achado ultrassonográfico adicional reforça o diagnóstico de fascite plantar?",
        alternativas: [
          { letra: "A", texto: "Hipoecogenicidade focal com perda do padrão fibrilar" },
          { letra: "B", texto: "Calcificação no corpo do tendão calcâneo" },
          { letra: "C", texto: "Bursa retrocalcânea distendida" },
          { letra: "D", texto: "Coleção anecóica no túnel do tarso" },
        ],
        correta: "A",
        comentario:
          "Além do espessamento, espera-se hipoecogenicidade focal, perda do padrão fibrilar e, em alguns casos, hiperemia ao Doppler. Esporão calcâneo pode estar associado, mas não é critério diagnóstico.",
      },
      {
        id: "fp4",
        pergunta:
          "Qual conduta NÃO está indicada como tratamento inicial?",
        alternativas: [
          { letra: "A", texto: "Alongamento da fáscia plantar e do tríceps sural" },
          { letra: "B", texto: "Palmilha com suporte de arco e amortecimento calcâneo" },
          { letra: "C", texto: "Fasciotomia plantar cirúrgica" },
          { letra: "D", texto: "AINE por curto período + crioterapia local" },
        ],
        correta: "C",
        comentario:
          "Fasciotomia é reservada a casos refratários após 6–12 meses de conservador bem conduzido. Primeira linha: alongamento, palmilhas, controle de carga, AINE e crioterapia. Intermediários: ondas de choque, PRP, infiltração guiada por US (corticoide com cautela).",
      },
      {
        id: "fp5",
        pergunta:
          "Após falha do tratamento conservador, qual procedimento guiado por US é opção intermediária mais segura?",
        alternativas: [
          { letra: "A", texto: "Infiltração intrafascial profunda com corticoide em alta dose" },
          { letra: "B", texto: "Ondas de choque extracorpóreas (ESWT) ou PRP perifascial guiado" },
          { letra: "C", texto: "Bloqueio do nervo tibial em altas doses repetidas" },
          { letra: "D", texto: "Neurólise química do plantar medial" },
        ],
        correta: "B",
        comentario:
          "ESWT e PRP perifascial guiado por US têm melhor perfil de segurança que corticoide repetido — que aumenta risco de atrofia do coxim adiposo e ruptura fascial.",
      },
    ],
    resolucao:
      "Fascite plantar confirmada por clínica (dor protokinética, Windlass +) e US (fáscia 4,3 mm com hipoecogenicidade focal). Conduta: alongamento dirigido, palmilha, controle de carga, AINE por 10 dias. Reavaliação em 6 semanas; se refratário, considerar ESWT ou PRP guiado por US antes de qualquer cirurgia.",
  },
  {
    id: "caso-stc",
    semana: 1,
    titulo: "Parestesia noturna em manicure de 37 anos",
    regiao: "Punho e Mão",
    imagemUrl: stcMedianoUs.url,
    imagemLabel: "Punho · Transverso ao nível do pisiforme — nervo mediano",
    apresentacao:
      "Mulher, 37 anos, manicure há 18 anos, destra. Dor e formigamento na mão direita há ~10 meses, inicialmente intermitentes e, nos últimos 3 meses, diários. Parestesias no polegar, indicador e dedo médio, com piora no trabalho e à noite (acorda várias vezes). Refere flick sign (sacudir a mão alivia) e dificuldade para segurar objetos pequenos (esmaltes, alicates). Nega trauma, diabetes ou doenças reumatológicas.",
    examesFisicos:
      "Hipoestesia em polpa do polegar, indicador e médio. Tinel positivo sobre o túnel do carpo. Phalen positivo em 25 s. Sem atrofia tenar evidente. Força de pinça discretamente reduzida. Após 4 semanas de órtese noturna e orientação ergonômica sem melhora, realizou US: AST do mediano no pisiforme = 11 mm²; AST no antebraço distal = 7,5 mm²; relação túnel/antebraço = 1,47; discreto achatamento distal.",
    questoes: [
      {
        id: "stc-c1",
        pergunta: "Qual é o diagnóstico clínico mais provável?",
        alternativas: [
          { letra: "A", texto: "Síndrome do túnel do carpo" },
          { letra: "B", texto: "Síndrome do canal de Guyon" },
          { letra: "C", texto: "Radiculopatia cervical C8" },
          { letra: "D", texto: "Síndrome do pronador redondo" },
        ],
        correta: "A",
        comentario:
          "Parestesias no território do nervo mediano, piora noturna, flick sign, Tinel e Phalen positivos, somados à atividade ocupacional repetitiva, tornam o diagnóstico de STC altamente provável.",
      },
      {
        id: "stc-c2",
        pergunta:
          "A área de secção transversal (AST) do mediano de 11 mm² confirma isoladamente o diagnóstico?",
        alternativas: [
          { letra: "A", texto: "Sim — qualquer valor > 9 mm² é diagnóstico" },
          { letra: "B", texto: "Não — a medida deve ser interpretada com o quadro clínico" },
          { letra: "C", texto: "Só se houver Doppler positivo associado" },
          { letra: "D", texto: "Não, pois o ponto de corte é > 15 mm²" },
        ],
        correta: "B",
        comentario:
          "Embora valores acima de 9–10 mm² sejam usados como ponto de corte, a medida isolada não deve ser interpretada fora do contexto clínico. A US é complementar à história e ao exame físico.",
      },
      {
        id: "stc-c3",
        pergunta:
          "Qual a importância da relação entre a AST do mediano no túnel do carpo e no antebraço distal?",
        alternativas: [
          { letra: "A", texto: "Não tem valor diagnóstico" },
          { letra: "B", texto: "Substitui completamente a medida absoluta da AST" },
          { letra: "C", texto: "Relação ≥ 1,4 aumenta a precisão diagnóstica, reduzindo a variabilidade anatômica" },
          { letra: "D", texto: "Só é útil em pacientes diabéticos" },
        ],
        correta: "C",
        comentario:
          "A relação túnel/antebraço distal ≥ 1,4 é critério ultrassonográfico robusto para STC, pois minimiza a influência da variabilidade anatômica individual. Neste caso, 11 ÷ 7,5 = 1,47, reforçando o diagnóstico.",
      },
      {
        id: "stc-c4",
        pergunta:
          "Qual exame permanece o padrão-ouro para confirmação diagnóstica e graduação da gravidade?",
        alternativas: [
          { letra: "A", texto: "Ressonância magnética do punho" },
          { letra: "B", texto: "Ultrassonografia de alta resolução" },
          { letra: "C", texto: "Eletroneuromiografia (ENMG)" },
          { letra: "D", texto: "Radiografia em incidência do túnel do carpo" },
        ],
        correta: "C",
        comentario:
          "A ENMG continua sendo o gold standard, especialmente para confirmar o comprometimento funcional, graduar a gravidade, excluir neuropatias associadas e auxiliar na decisão terapêutica. US e ENMG são complementares.",
      },
      {
        id: "stc-c5",
        pergunta:
          "Em paciente com clínica típica e US compatível, a ENMG ainda é necessária?",
        alternativas: [
          { letra: "A", texto: "Nunca — a US substitui a ENMG" },
          { letra: "B", texto: "Frequentemente sim, sobretudo antes de cirurgia, em casos duvidosos ou com déficit motor" },
          { letra: "C", texto: "Apenas se houver suspeita de radiculopatia cervical" },
          { letra: "D", texto: "Só em pacientes com mais de 60 anos" },
        ],
        correta: "B",
        comentario:
          "A ENMG é especialmente recomendada antes de procedimentos cirúrgicos, em casos duvidosos, sintomas graves, déficit motor, suspeita de dupla compressão ou para documentação objetiva da neuropatia.",
      },
      {
        id: "stc-c6",
        pergunta: "Qual é a conduta inicial mais adequada para esta paciente?",
        alternativas: [
          { letra: "A", texto: "Liberação cirúrgica imediata do retináculo flexor" },
          { letra: "B", texto: "Tratamento conservador: órtese noturna, ergonomia, fisioterapia e infiltração guiada por US em casos selecionados" },
          { letra: "C", texto: "Imobilização gessada por 6 semanas" },
          { letra: "D", texto: "Corticoterapia oral prolongada" },
        ],
        correta: "B",
        comentario:
          "Sem déficit motor relevante ou atrofia tenar, a abordagem inicial inclui órtese noturna, adequação ergonômica, redução de movimentos repetitivos, analgesia, fisioterapia/TO e, em casos selecionados, infiltração guiada por US do túnel do carpo.",
      },
      {
        id: "stc-c7",
        pergunta:
          "Em quais situações o tratamento cirúrgico deve ser considerado?",
        alternativas: [
          { letra: "A", texto: "Apenas em pacientes acima de 60 anos" },
          { letra: "B", texto: "Sempre que a AST for > 10 mm², independentemente da clínica" },
          { letra: "C", texto: "Falha do tratamento conservador, sintomas progressivos, déficit motor, atrofia tenar ou ENMG com neuropatia moderada a grave" },
          { letra: "D", texto: "Apenas quando houver dor irradiada para o ombro" },
        ],
        correta: "C",
        comentario:
          "A indicação cirúrgica clássica inclui falha do tratamento conservador, sintomas persistentes/progressivos, déficit motor, atrofia da musculatura tenar e ENMG demonstrando neuropatia moderada a grave.",
      },
    ],
    resolucao:
      "Síndrome do túnel do carpo é diagnóstico essencialmente clínico. A US acrescenta informação anatômica relevante — AST do mediano aumentada (11 mm²) e relação túnel/antebraço ≥ 1,4 (1,47) — reforçando o diagnóstico. A ENMG permanece o método de referência para confirmação funcional e estratificação da gravidade. Nesta paciente, mantém-se conduta conservadora otimizada (órtese, ergonomia, fisioterapia) e, persistindo os sintomas, considerar infiltração guiada por US e/ou ENMG para avaliar gravidade e indicação cirúrgica.",
  },
  {
    id: "caso-hansen-ulnar",
    semana: 2,
    titulo: "Espessamento do nervo ulnar em mulher de 42 anos",
    regiao: "Nervos Periféricos",
    imagemUrl: hansenUlnarMedidas.url,
    imagemLabel: "Cotovelo · Longitudinal do nervo ulnar — medidas do diâmetro",
    apresentacao:
      "Mulher, 42 anos, natural do Maranhão, agricultora. Há cerca de 8 meses percebeu formigamento e diminuição da sensibilidade no 4º e 5º dedos da mão direita, com piora progressiva. Refere também mancha hipocrômica no punho com redução da sensibilidade térmica local. Nega trauma, diabetes, uso de álcool ou atividade repetitiva. Familiar com diagnóstico prévio de doença de Hansen tratada há 10 anos.",
    examesFisicos:
      "Placa hipocrômica de ~4 cm no punho direito com hipoestesia térmica e dolorosa. Nervo ulnar palpável, espessado e doloroso no sulco entre o olécrano e o epicôndilo medial. Hipoestesia em território ulnar da mão. Discreta hipotrofia dos interósseos. Froment positivo à direita. US de alto padrão foi solicitada para avaliação do nervo ulnar bilateral.",
    questoes: [
      {
        id: "hu1",
        pergunta:
          "Na imagem longitudinal, o diâmetro do nervo ulnar foi medido em três pontos (4,8 / 5,5 / 4,7 mm). Como interpretar esse achado?",
        alternativas: [
          { letra: "A", texto: "Espessamento fusiforme do nervo, com maior calibre no ponto intermediário" },
          { letra: "B", texto: "Nervo de calibre normal — variação esperada de até 6 mm" },
          { letra: "C", texto: "Artefato de anisotropia por inclinação do transdutor" },
          { letra: "D", texto: "Achado incidental sem valor clínico" },
        ],
        correta: "A",
        comentario:
          "Há espessamento significativo e fusiforme do nervo (pico de 5,5 mm), padrão típico de neuropatia hansênica — diferente da compressão focal do túnel cubital, que costuma ter aumento mais localizado.",
        imagemUrl: hansenUlnarMedidas.url,
        imagemLabel: "Longitudinal — diâmetros do nervo ulnar",
      },
      {
        id: "hu2",
        pergunta:
          "Qual o limite superior de normalidade da área de secção transversal (AST) do nervo ulnar no sulco epitrócleo-olecraniano em adultos?",
        alternativas: [
          { letra: "A", texto: "Até 0,05 cm² (5 mm²)" },
          { letra: "B", texto: "Até 0,10 cm² (10 mm²)" },
          { letra: "C", texto: "Até 0,25 cm² (25 mm²)" },
          { letra: "D", texto: "Até 0,50 cm² (50 mm²)" },
        ],
        correta: "B",
        comentario:
          "A AST normal do nervo ulnar no cotovelo é ≤ 0,08–0,10 cm² (8–10 mm²). Valores entre 0,10 e 0,15 cm² são limítrofes; acima disso, sugerem neuropatia.",
      },
      {
        id: "hu3",
        pergunta:
          "A imagem transversa mostra AST de 0,45 cm² (45 mm²). Como classificar esse achado?",
        alternativas: [
          { letra: "A", texto: "Dentro da normalidade" },
          { letra: "B", texto: "Aumento discreto, compatível com compressão inicial" },
          { letra: "C", texto: "Espessamento grosseiro (≈ 4–5× o valor normal), sugestivo de neuropatia infiltrativa/inflamatória" },
          { letra: "D", texto: "Provável cisto sinovial adjacente ao nervo" },
        ],
        correta: "C",
        comentario:
          "AST de 45 mm² representa aumento marcante (4–5× o normal). Esse grau de espessamento é incomum em compressões mecânicas simples e deve levantar suspeita de neuropatia hansênica, amiloidose, CIDP ou tumor de bainha nervosa.",
        imagemUrl: hansenUlnarAst.url,
        imagemLabel: "Transverso — AST do nervo ulnar = 0,45 cm²",
      },
      {
        id: "hu4",
        pergunta:
          "Considerando quadro clínico (mancha hipocrômica com hipoestesia + espessamento neural) e achados de US, qual a hipótese diagnóstica mais provável?",
        alternativas: [
          { letra: "A", texto: "Síndrome do túnel cubital idiopática" },
          { letra: "B", texto: "Neuropatia hansênica (doença de Hansen)" },
          { letra: "C", texto: "Schwannoma do nervo ulnar" },
          { letra: "D", texto: "Neuropatia diabética" },
        ],
        correta: "B",
        comentario:
          "A tríade lesão cutânea com alteração de sensibilidade + espessamento de nervo periférico + área endêmica é altamente sugestiva de hanseníase. O nervo ulnar é o mais frequentemente acometido.",
        imagemUrl: hansenMancha.url,
        imagemLabel: "Mancha hipocrômica no punho — hipoestesia térmica e dolorosa local",
      },
      {
        id: "hu5",
        pergunta:
          "Qual característica ultrassonográfica é típica da neuropatia hansênica e ajuda a diferenciá-la das compressões mecânicas?",
        alternativas: [
          { letra: "A", texto: "Espessamento focal restrito ao ponto de compressão" },
          { letra: "B", texto: "Espessamento multifocal/segmentar, assimétrico, com perda do padrão fascicular e por vezes hipervascularização" },
          { letra: "C", texto: "Redução difusa do calibre nervoso" },
          { letra: "D", texto: "Calcificações intraneurais grosseiras" },
        ],
        correta: "B",
        comentario:
          "A neuropatia hansênica cursa com espessamento multifocal e assimétrico, frequentemente com perda do padrão fascicular e hipervascularização ao Doppler — diferente do aumento focal e simétrico visto em compressões mecânicas.",
      },
      {
        id: "hu6",
        pergunta: "Quais outros nervos periféricos devem ser sistematicamente avaliados pela US na suspeita de hanseníase?",
        alternativas: [
          { letra: "A", texto: "Apenas o nervo ulnar acometido" },
          { letra: "B", texto: "Ulnar, mediano, radial, fibular comum, tibial posterior e grande auricular — bilateralmente" },
          { letra: "C", texto: "Apenas nervos cranianos" },
          { letra: "D", texto: "Apenas os nervos do membro sintomático" },
        ],
        correta: "B",
        comentario:
          "A avaliação deve ser sistemática e bilateral nos principais nervos acometidos pela hanseníase: ulnar (cotovelo), mediano (punho), radial (goteira umeral), fibular comum (cabeça da fíbula), tibial posterior (retromaleolar) e grande auricular (cervical).",
      },
      {
        id: "hu7",
        pergunta: "Qual a conduta correta diante da suspeita clínica e ultrassonográfica de neuropatia hansênica?",
        alternativas: [
          { letra: "A", texto: "Descompressão cirúrgica imediata do túnel cubital" },
          { letra: "B", texto: "Infiltração local com corticoide como tratamento definitivo" },
          { letra: "C", texto: "Notificação compulsória, biópsia de pele/nervo quando indicada e início da poliquimioterapia (PQT) conforme MS/OMS, com corticoide sistêmico nos surtos reacionais" },
          { letra: "D", texto: "Observação clínica sem tratamento específico" },
        ],
        correta: "C",
        comentario:
          "Hanseníase é doença de notificação compulsória. O tratamento é a poliquimioterapia (rifampicina, dapsona ± clofazimina) conforme classificação operacional. Nas neurites/reações, associa-se corticoide sistêmico. A US é ferramenta valiosa para monitorar espessamento neural e resposta terapêutica.",
      },
    ],
    resolucao:
      "Neuropatia hansênica do nervo ulnar. A US demonstrou espessamento fusiforme longitudinal (pico 5,5 mm) e AST de 45 mm² — muito acima do limite superior de 10 mm² para o cotovelo —, com padrão multifocal típico. Associado a lesão cutânea com hipoestesia e contexto epidemiológico, o diagnóstico é altamente provável. Conduta: notificação compulsória, avaliação sistemática bilateral dos principais nervos, baciloscopia/biópsia quando indicada, início de PQT segundo classificação operacional (MB/PB) e manejo de eventual neurite com corticoide sistêmico. A US serve como método objetivo para acompanhar redução do espessamento neural ao longo do tratamento.",
  },
  {
    id: "caso-rizartrose",
    semana: 3,
    titulo: "Dor na base do polegar em mulher de 58 anos",
    regiao: "Mão",
    imagemUrl: rizartrosePuncao.url,
    imagemLabel: "Punho/Polegar · Longitudinal dorso-radial — infiltração guiada por US",
    apresentacao:
      "Mulher, 58 anos, costureira, destra. Dor há cerca de 14 meses na base do polegar direito, insidiosa e progressiva, com piora ao abrir potes, girar chaves e usar tesoura. Refere perda de força de pinça e crepitação local. Já usou AINE, órtese de imobilização do polegar e fisioterapia por 3 meses, com melhora apenas parcial. Nega trauma. Menopausa aos 50 anos.",
    examesFisicos:
      "Dor à palpação da base do 1º metacarpo com discreto abaulamento dorso-radial. Grind test (compressão axial + rotação do polegar) positivo, com dor e crepitação. Redução da força de pinça polpa-polpa e chave. Sem sinais inflamatórios agudos. Radiografia mostra redução do espaço articular trapézio-metacarpal, osteófitos e esclerose subcondral (Eaton-Littler II–III). Optado por infiltração guiada por US.",
    questoes: [
      {
        id: "riz1",
        pergunta: "Qual o diagnóstico clínico mais provável?",
        alternativas: [
          { letra: "A", texto: "Tenossinovite de De Quervain" },
          { letra: "B", texto: "Rizartrose (osteoartrose da articulação trapézio-metacarpal)" },
          { letra: "C", texto: "Síndrome do túnel do carpo" },
          { letra: "D", texto: "Artrite séptica da 1ª MCF" },
        ],
        correta: "B",
        comentario:
          "Dor crônica na base do polegar, piora com pinça/preensão, grind test positivo e alterações radiográficas na TMC caracterizam rizartrose. De Quervain acomete o 1º compartimento extensor (dor mais proximal e no estiloide radial, Finkelstein +).",
      },
      {
        id: "riz2",
        pergunta: "Qual estrutura articular está sendo abordada na imagem ultrassonográfica?",
        alternativas: [
          { letra: "A", texto: "Articulação escafo-trapézio-trapezoide (STT)" },
          { letra: "B", texto: "Articulação metacarpofalângica do polegar" },
          { letra: "C", texto: "Articulação trapézio-metacarpal (base do 1º metacarpo com o trapézio)" },
          { letra: "D", texto: "Articulação radiocarpal" },
        ],
        correta: "C",
        comentario:
          "O corte longitudinal dorso-radial mostra o 1º metacarpo à esquerda e o trapézio à direita, com a interlinha TMC entre eles — sítio da rizartrose e alvo da infiltração.",
        imagemUrl: rizartrosePuncao.url,
        imagemLabel: "Infiltração da TMC guiada por US — punção fora de plano",
      },
      {
        id: "riz3",
        pergunta: "Qual estrutura vascular deve ser obrigatoriamente mapeada com Doppler antes da punção?",
        alternativas: [
          { letra: "A", texto: "Artéria ulnar no canal de Guyon" },
          { letra: "B", texto: "Artéria radial na tabaqueira anatômica" },
          { letra: "C", texto: "Arco palmar profundo" },
          { letra: "D", texto: "Veia cefálica" },
        ],
        correta: "B",
        comentario:
          "A artéria radial cruza a tabaqueira anatômica muito próxima ao acesso dorso-radial da TMC. Sempre mapear com Doppler antes da punção para evitar lesão vascular.",
      },
      {
        id: "riz4",
        pergunta: "Qual a técnica de punção mais utilizada para infiltração da articulação TMC?",
        alternativas: [
          { letra: "A", texto: "Em plano por acesso palmar profundo" },
          { letra: "B", texto: "Fora de plano por acesso dorso-radial, dirigida à interlinha articular" },
          { letra: "C", texto: "Intramuscular no adutor do polegar" },
          { letra: "D", texto: "Perineural do nervo mediano" },
        ],
        correta: "B",
        comentario:
          "O acesso mais utilizado é dorso-radial, com agulha fora de plano dirigida à interlinha articular sob visão direta, evitando a artéria radial. Em plano também é possível quando a janela permite.",
      },
      {
        id: "riz5",
        pergunta: "Qual o volume habitual e que fármacos podem ser injetados na TMC?",
        alternativas: [
          { letra: "A", texto: "5–10 mL de anestésico local puro" },
          { letra: "B", texto: "0,5–1,0 mL de corticoide + anestésico local, ou ácido hialurônico" },
          { letra: "C", texto: "3 mL de solução hipertônica" },
          { letra: "D", texto: "10 mL de PRP" },
        ],
        correta: "B",
        comentario:
          "A TMC é articulação pequena; volumes de 0,5–1,0 mL são suficientes. As opções mais usadas são corticoide + anestésico local ou viscossuplementação com ácido hialurônico. PRP é alternativa emergente, também em pequeno volume.",
      },
      {
        id: "riz6",
        pergunta: "Quais achados ultrassonográficos apoiam o diagnóstico de rizartrose?",
        alternativas: [
          { letra: "A", texto: "Espessamento do retináculo dos extensores no 1º compartimento" },
          { letra: "B", texto: "Osteófitos marginais, irregularidade cortical, redução do espaço articular, derrame/sinovite com hiperemia ao Doppler" },
          { letra: "C", texto: "Aumento do nervo mediano no pisiforme" },
          { letra: "D", texto: "Cisto sinovial no canal de Guyon" },
        ],
        correta: "B",
        comentario:
          "Os achados típicos da rizartrose à US são osteófitos marginais hiperecogênicos com sombra, irregularidade cortical, redução do espaço TMC, distensão capsular, derrame hipoanecoico e sinovite com hiperemia ao Doppler.",
      },
      {
        id: "riz7",
        pergunta: "Quando indicar tratamento cirúrgico (trapeziectomia com ou sem interposição/suspensão)?",
        alternativas: [
          { letra: "A", texto: "Sempre no primeiro atendimento" },
          { letra: "B", texto: "Apenas em pacientes com menos de 40 anos" },
          { letra: "C", texto: "Falha do tratamento conservador otimizado (órtese, fisioterapia, AINE, infiltrações) com dor incapacitante, perda funcional e alterações radiográficas avançadas (Eaton III–IV)" },
          { letra: "D", texto: "Sempre que houver osteófitos na radiografia" },
        ],
        correta: "C",
        comentario:
          "Cirurgia (trapeziectomia isolada, com interposição tendínea ou suspensoplastia) é reservada a casos refratários ao tratamento conservador bem conduzido, com dor incapacitante, perda funcional importante e estágios radiográficos avançados.",
      },
    ],
    resolucao:
      "Rizartrose sintomática Eaton-Littler II–III refratária a medidas conservadoras iniciais. Realizada infiltração guiada por US da articulação trapézio-metacarpal por acesso dorso-radial (agulha fora de plano), com 0,8 mL de mistura de corticoide + anestésico local após mapeamento Doppler da artéria radial. Orientada manutenção de órtese de repouso, fortalecimento da musculatura tenar e adequação ergonômica no trabalho. Reavaliação em 6–8 semanas; em caso de nova falha, considerar viscossuplementação, PRP ou avaliação cirúrgica (trapeziectomia com suspensoplastia).",
  },
  {
    id: "caso-stc-ratio",
    semana: 4,
    titulo: "Dor e parestesia noturna em digitadora de 45 anos — cálculo da razão AST",
    regiao: "Punho e Mão",
    imagemUrl: medianoRatioPosicao.url,
    imagemLabel: "Punho · Posicionamento do transdutor para avaliação do nervo mediano",
    apresentacao:
      "Mulher, 45 anos, digitadora há 20 anos. Refere dor no punho direito e parestesia nos três primeiros dedos há 6 meses, com piora noturna e ao dirigir. Sacode a mão para aliviar (flick sign). Sem trauma, sem diabetes, sem hipotireoidismo. Uso prolongado de teclado e mouse sem apoio ergonômico.",
    examesFisicos:
      "Hipoestesia em polpa do polegar, indicador e médio à direita. Tinel e Phalen positivos. Sem atrofia tenar. Força de pinça preservada. Solicitado US do punho para avaliação do nervo mediano com medida da AST no túnel do carpo (distal) e no antebraço distal (proximal) para cálculo da razão.",
    questoes: [
      {
        id: "stcr-1",
        pergunta:
          "Qual é o posicionamento correto do transdutor para iniciar a avaliação do nervo mediano no túnel do carpo?",
        alternativas: [
          { letra: "A", texto: "Longitudinal na face dorsal do punho" },
          { letra: "B", texto: "Transversal sobre a prega distal do punho (nível do pisiforme), com paciente sentado e antebraço supinado" },
          { letra: "C", texto: "Oblíquo sobre a tabaqueira anatômica" },
          { letra: "D", texto: "Transversal sobre o cotovelo" },
        ],
        correta: "B",
        comentario:
          "O estudo do nervo mediano no túnel do carpo inicia com transdutor linear de alta frequência em corte transversal ao nível do pisiforme, com o paciente sentado, antebraço supinado e punho em posição neutra.",
        imagemUrl: medianoRatioPosicao.url,
        imagemLabel: "Passo 1 — Posicionamento do transdutor",
      },
      {
        id: "stcr-2",
        pergunta:
          "A imagem mostra a medida da AST do nervo mediano DENTRO do túnel do carpo = 0,14 cm² (14 mm²). Como interpretar isoladamente esse valor?",
        alternativas: [
          { letra: "A", texto: "Valor normal — nenhuma alteração" },
          { letra: "B", texto: "Valor limítrofe, sem qualquer significado clínico" },
          { letra: "C", texto: "Valor claramente acima do limite superior da normalidade (>9–10 mm²), altamente sugestivo de STC — mas deve ser interpretado com a clínica" },
          { letra: "D", texto: "Compatível apenas com neuropatia hansênica" },
        ],
        correta: "C",
        comentario:
          "AST > 9–10 mm² é limítrofe/aumentada e > 13 mm² é fortemente sugestiva de STC. Valores como 14 mm² reforçam o diagnóstico, mas a interpretação sempre deve ser feita em conjunto com o quadro clínico.",
        imagemUrl: medianoRatioDistal.url,
        imagemLabel: "Passo 2 — AST distal = 0,14 cm² (dentro do túnel)",
      },
      {
        id: "stcr-3",
        pergunta:
          "Onde deve ser medida a AST PROXIMAL do nervo mediano para o cálculo da razão distal/proximal?",
        alternativas: [
          { letra: "A", texto: "No braço, próximo à axila" },
          { letra: "B", texto: "No antebraço distal, entre os flexores superficiais e o flexor profundo dos dedos (plano interfascial)" },
          { letra: "C", texto: "Na mão, ao nível dos metacarpos" },
          { letra: "D", texto: "No cotovelo, na fossa cubital" },
        ],
        correta: "B",
        comentario:
          "A referência proximal é o antebraço distal, com o nervo mediano identificado no plano entre os flexores superficiais (FDS) e o flexor profundo dos dedos (FDP) — janela sonográfica habitual, longe de compressões locais.",
        imagemUrl: medianoRatioProximal.url,
        imagemLabel: "Passo 3 — AST proximal = 0,05 cm² (antebraço distal)",
      },
      {
        id: "stcr-4",
        pergunta:
          "Com AST distal = 0,14 cm² e AST proximal = 0,05 cm², qual é a razão calculada e o que ela sugere?",
        alternativas: [
          { letra: "A", texto: "Razão 0,4 — nervo normal" },
          { letra: "B", texto: "Razão 1,0 — sem alteração" },
          { letra: "C", texto: "Razão 2,8 — >1,4, altamente sugestiva de compressão do mediano no túnel do carpo" },
          { letra: "D", texto: "Razão 2,8 — dentro da normalidade" },
        ],
        correta: "C",
        comentario:
          "0,14 / 0,05 = 2,8. O ponto de corte é 1,4: razões acima desse valor são altamente sugestivas de STC. Neste caso, 2,8 é claramente patológico.",
        imagemUrl: medianoRatioComparativo.url,
        imagemLabel: "Passo 4 — Razão AST distal/proximal = 2,8",
      },
      {
        id: "stcr-5",
        pergunta:
          "Qual a principal vantagem de usar a razão AST distal/proximal em vez de apenas a AST absoluta no túnel?",
        alternativas: [
          { letra: "A", texto: "É mais rápida de medir" },
          { letra: "B", texto: "Reduz a influência da variabilidade anatômica individual (calibre basal do nervo), aumentando a acurácia diagnóstica sobretudo em valores limítrofes" },
          { letra: "C", texto: "Substitui a necessidade de exame clínico" },
          { letra: "D", texto: "Elimina a necessidade de ENMG em todos os casos" },
        ],
        correta: "B",
        comentario:
          "A razão distal/proximal ajusta a medida ao calibre individual do nervo. É especialmente útil quando a AST absoluta está limítrofe (9–12 mm²), reduzindo falsos positivos e falsos negativos.",
      },
      {
        id: "stcr-6",
        pergunta:
          "Além do aumento da AST e da razão >1,4, quais outros achados sonográficos apoiam o diagnóstico de STC?",
        alternativas: [
          { letra: "A", texto: "Apenas hiperemia ao Doppler" },
          { letra: "B", texto: "Achatamento do nervo distalmente, abaulamento volar do retináculo dos flexores (notch sign), hipoecogenicidade do nervo e redução da mobilidade dinâmica" },
          { letra: "C", texto: "Presença de osteófitos no rádio distal" },
          { letra: "D", texto: "Espessamento do tendão flexor radial do carpo" },
        ],
        correta: "B",
        comentario:
          "Outros achados úteis: achatamento distal do nervo (flattening ratio), notch sign (abaulamento do retináculo), perda do padrão fascicular, hipoecogenicidade, hiperemia ao Doppler e redução da mobilidade do nervo à flexo-extensão dos dedos.",
      },
      {
        id: "stcr-7",
        pergunta:
          "Considerando clínica típica + AST 14 mm² + razão 2,8, qual a conduta inicial mais adequada?",
        alternativas: [
          { letra: "A", texto: "Cirurgia imediata de liberação do retináculo" },
          { letra: "B", texto: "Tratamento conservador (órtese noturna, ergonomia, fisioterapia) e, se falha, infiltração guiada por US ± ENMG para estadiar" },
          { letra: "C", texto: "Corticoterapia oral prolongada" },
          { letra: "D", texto: "Apenas observação sem tratamento" },
        ],
        correta: "B",
        comentario:
          "Sem déficit motor ou atrofia tenar, inicia-se conservador (órtese noturna, adequação ergonômica, fisioterapia). Falha do conservador → infiltração guiada por US do túnel do carpo e/ou ENMG para graduar gravidade e definir indicação cirúrgica.",
      },
    ],
    resolucao:
      "Síndrome do túnel do carpo com forte suporte ultrassonográfico: AST distal 14 mm² (>13 mm² = critério forte) e razão distal/proximal 2,8 (>1,4). A sequência de imagens ilustra a metodologia correta: (1) posicionamento do transdutor, (2) medida distal no túnel, (3) medida proximal no antebraço e (4) cálculo da razão. Conduta inicial conservadora (órtese noturna, ergonomia, fisioterapia); persistindo sintomas, infiltração guiada por US do túnel do carpo e ENMG para estadiamento antes de indicar cirurgia.",
  },
];




export function casoDaSemana(): CasoClinico {
  const semana = Math.floor((Date.now() / (1000 * 60 * 60 * 24 * 7)) % CASOS.length);
  return CASOS[semana];
}
