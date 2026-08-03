import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { useAuth } from "@/lib/auth";

// Rota de topo, fora do /_app: a Apple exige que a política abra sem login e
// sem o app instalado (Guideline 5.1.1). É esta URL que vai no campo
// "Política de privacidade" do App Store Connect e da Google Play.
export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade · US360" },
      {
        name: "description",
        content: "Como o US360 coleta, usa, compartilha e apaga os dados de quem usa o aplicativo.",
      },
    ],
  }),
  component: Privacidade,
});

// TROQUE por uma caixa de e-mail que exista de verdade e seja lida. A Apple e a
// LGPD exigem um canal de contato funcional — e a Apple testa.
const EMAIL_CONTATO = "contato@us360.app";
const CONTROLADOR = "Charles Amaral de Oliveira";
const ATUALIZADO_EM = "3 de agosto de 2026";

function Privacidade() {
  const { user } = useAuth();

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-5 py-10 pt-[calc(env(safe-area-inset-top)+2.5rem)]">
      <header className="flex flex-col gap-3">
        <Link
          to={user ? "/home" : "/login"}
          className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {user ? "Voltar ao app" : "Entrar"}
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Política de Privacidade</h1>
            <p className="text-sm text-muted-foreground">US360 · Atualizada em {ATUALIZADO_EM}</p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 text-sm leading-relaxed">
        <Bloco titulo="Em resumo">
          <p>
            O US360 é um aplicativo de estudo de ultrassonografia musculoesquelética. Coletamos
            apenas o necessário para a sua conta funcionar e para registrar o seu progresso de
            estudo. <strong>Não coletamos dados de saúde seus</strong>, não exibimos publicidade,
            não rastreamos você em outros aplicativos ou sites e não vendemos nem alugamos seus
            dados para ninguém.
          </p>
        </Bloco>

        <Bloco titulo="1. Quem é responsável pelos seus dados">
          <p>
            O controlador dos dados, nos termos da Lei Geral de Proteção de Dados (Lei nº
            13.709/2018), é {CONTROLADOR}, responsável pelo aplicativo US360.
          </p>
          <p>
            Contato para assuntos de privacidade:{" "}
            <a href={`mailto:${EMAIL_CONTATO}`} className="text-primary underline">
              {EMAIL_CONTATO}
            </a>{" "}
            ou pela{" "}
            <Link to="/suporte" className="text-primary underline">
              página de suporte
            </Link>
            .
          </p>
        </Bloco>

        <Bloco titulo="2. Quais dados coletamos e como">
          <p>
            Todos os dados abaixo são fornecidos por você ou gerados pelo seu uso do aplicativo.{" "}
            <strong>
              Não coletamos dados de sensores do aparelho, não acessamos sua localização por GPS,
              sua câmera, seu microfone, suas fotos nem sua lista de contatos.
            </strong>
          </p>

          <Tabela
            linhas={[
              [
                "Nome e e-mail",
                "Você informa ao criar a conta e no formulário de suporte",
                "Identificar sua conta, permitir o login e responder você",
              ],
              [
                "Senha",
                "Você define ao criar a conta",
                "Autenticação. É guardada de forma criptografada (hash) e nem nós conseguimos lê-la",
              ],
              [
                "Perfil profissional: especialidade, cidade, tempo de formado, se já usa ultrassom e se atua com dor",
                "Você informa no cadastro inicial",
                "Adaptar o conteúdo e entender o público do aplicativo",
              ],
              [
                "Progresso de estudo: pontos, nível, sequência de dias, missões, conquistas e histórico de respostas",
                "Gerado automaticamente quando você usa o app",
                "Mostrar sua evolução, calcular o ranking e conceder conquistas",
              ],
              [
                "Amizades e posição no ranking",
                "Gerado quando você adiciona amigos ou pontua",
                "Funcionalidade social do aplicativo",
              ],
              [
                "Identificador de notificações do seu aparelho e o modelo do navegador/sistema",
                "Registrado apenas se você autorizar as notificações",
                "Entregar as notificações que você pediu para receber",
              ],
              [
                "Conteúdo das mensagens que você envia ao suporte",
                "Você escreve no formulário de suporte",
                "Atender e resolver o seu chamado",
              ],
            ]}
          />

          <p>
            A cidade que você informa é um texto digitado por você no cadastro:{" "}
            <strong>o aplicativo nunca solicita permissão de localização nem lê seu GPS.</strong>
          </p>
        </Bloco>

        <Bloco titulo="3. Para que usamos os seus dados">
          <ul className="list-disc space-y-1 pl-5">
            <li>Criar, manter e proteger a sua conta.</li>
            <li>Guardar o seu progresso para que você não o perca ao trocar de aparelho.</li>
            <li>Calcular pontos, níveis, sequência de dias, conquistas e ranking.</li>
            <li>Enviar as notificações que você autorizou, e apenas essas.</li>
            <li>Responder aos seus pedidos de suporte.</li>
            <li>
              Entender de forma agregada como o conteúdo é usado, para melhorar as questões e o
              material de estudo.
            </li>
          </ul>
          <p>
            <strong>Não usamos seus dados</strong> para publicidade, marketing de terceiros, criação
            de perfis publicitários ou qualquer forma de rastreamento entre aplicativos e sites.
          </p>
        </Bloco>

        <Bloco titulo="4. Com base em quê tratamos seus dados">
          <p>
            Conforme a LGPD, tratamos seus dados para a execução do contrato de uso do aplicativo
            (art. 7º, V) — sem eles a conta não funciona — e, no caso das notificações, mediante o
            seu consentimento (art. 7º, I), que você pode retirar a qualquer momento.
          </p>
        </Bloco>

        <Bloco titulo="5. Com quem compartilhamos">
          <p>
            Não vendemos, alugamos nem cedemos seus dados. Nós os compartilhamos apenas com os
            prestadores de serviço necessários para o aplicativo funcionar:
          </p>
          <Tabela
            cabecalho={["Empresa", "Para quê", "Onde ficam os dados"]}
            linhas={[
              [
                "Supabase",
                "Banco de dados, autenticação e armazenamento de imagens",
                "Servidores na América do Sul",
              ],
              ["Vercel", "Hospedagem do aplicativo", "Servidores nos Estados Unidos"],
              [
                "Apple e serviços de notificação do navegador",
                "Entrega técnica das notificações que você autorizou",
                "Conforme a política do fornecedor",
              ],
            ]}
          />
          <p>
            <strong>
              Exigimos contratualmente que cada um desses prestadores ofereça proteção aos seus
              dados equivalente à descrita nesta política e compatível com as Diretrizes de Revisão
              da App Store.
            </strong>{" "}
            Eles atuam como operadores: tratam os dados apenas conforme nossas instruções e não
            podem usá-los para finalidades próprias.
          </p>
          <p>
            O aplicativo usa inteligência artificial apenas como ferramenta interna de redação, para
            ajudar a equipe a escrever questões e material didático.{" "}
            <strong>Nenhum dado seu é enviado a provedores de inteligência artificial.</strong>
          </p>
          <p>
            Também poderemos divulgar dados quando houver obrigação legal, ordem judicial ou
            requisição de autoridade competente.
          </p>
        </Bloco>

        <Bloco titulo="6. Por quanto tempo guardamos">
          <p>
            Mantemos seus dados enquanto a sua conta existir. Se você ficar sem acessar por muito
            tempo, os dados permanecem — é o que permite retomar de onde parou.
          </p>
          <p>
            Após a exclusão da conta, os registros de atendimento ao suporte são mantidos por até 5
            anos, desvinculados da sua conta, para comprovação de atendimento e defesa em eventual
            processo. Cópias podem persistir em backups por até 30 dias antes de serem sobrescritas.
          </p>
        </Bloco>

        <Bloco titulo="7. Como retirar o consentimento e apagar seus dados">
          <p>
            <strong>Notificações:</strong> desligue-as a qualquer momento em Perfil, dentro do
            aplicativo, ou retirando a permissão nos ajustes do seu aparelho. Ao desligar, o
            identificador do seu aparelho é apagado dos nossos registros.
          </p>
          <p>
            <strong>Ranking:</strong> em Perfil você pode optar por não aparecer no ranking público,
            sem perder o seu progresso.
          </p>
          <p>
            <strong>Exclusão da conta:</strong> abra o aplicativo, vá em{" "}
            <strong>Perfil → Excluir minha conta</strong> e confirme. A exclusão é imediata e
            definitiva: sua conta, seu perfil, seus pontos, sua sequência, suas conquistas, seu
            histórico de respostas, suas amizades e suas inscrições de notificação são apagados e
            não há como recuperá-los.
          </p>
          <p>
            Se você não conseguir acessar o aplicativo, peça a exclusão por{" "}
            <a href={`mailto:${EMAIL_CONTATO}`} className="text-primary underline">
              {EMAIL_CONTATO}
            </a>{" "}
            e nós a executaremos em até 15 dias.
          </p>
        </Bloco>

        <Bloco titulo="8. Seus direitos">
          <p>A LGPD garante a você, a qualquer momento e sem custo, o direito de:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Confirmar que tratamos seus dados e acessar uma cópia deles.</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li>Solicitar a anonimização, o bloqueio ou a eliminação de dados desnecessários.</li>
            <li>Pedir a portabilidade dos seus dados a outro fornecedor.</li>
            <li>Revogar o consentimento e se opor a um tratamento.</li>
            <li>Saber com quais entidades compartilhamos seus dados.</li>
          </ul>
          <p>
            A maior parte disso você resolve sozinho dentro do app, em Perfil. Para o restante,
            escreva para{" "}
            <a href={`mailto:${EMAIL_CONTATO}`} className="text-primary underline">
              {EMAIL_CONTATO}
            </a>
            . Respondemos em até 15 dias.
          </p>
        </Bloco>

        <Bloco titulo="9. Segurança">
          <p>
            O tráfego é criptografado ponta a ponta (HTTPS). As senhas são guardadas apenas como
            hash. O acesso ao banco de dados é restrito por regras de segurança em nível de linha,
            que garantem que cada pessoa só alcance os próprios dados. Nenhum sistema é infalível —
            se ocorrer um incidente que traga risco relevante a você, avisaremos você e a Autoridade
            Nacional de Proteção de Dados.
          </p>
        </Bloco>

        <Bloco titulo="10. Crianças e adolescentes">
          <p>
            O US360 destina-se a profissionais e estudantes da área da saúde e não é direcionado a
            menores de 18 anos. Não coletamos intencionalmente dados de crianças ou adolescentes. Se
            identificarmos um cadastro nessa condição, a conta será excluída.
          </p>
        </Bloco>

        <Bloco titulo="11. Alterações nesta política">
          <p>
            Podemos atualizar este texto. Quando a mudança for relevante, avisaremos dentro do
            aplicativo antes de ela passar a valer. A data no topo indica a versão vigente.
          </p>
        </Bloco>

        <Bloco titulo="12. Aviso sobre o conteúdo">
          <p>
            O US360 é uma ferramenta de estudo. Não realiza diagnóstico, não substitui avaliação
            médica presencial, não se destina ao uso por pacientes e não deve servir como base única
            para qualquer decisão clínica.
          </p>
        </Bloco>
      </div>

      <footer className="border-t pt-4 text-xs text-muted-foreground">
        <Link to="/suporte" className="underline underline-offset-4">
          Central de suporte
        </Link>
      </footer>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-display text-base font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}

function Tabela({ cabecalho, linhas }: { cabecalho?: string[]; linhas: string[][] }) {
  const head = cabecalho ?? ["Dado", "Como coletamos", "Para quê"];
  return (
    // Tabela larga em tela de celular: rola dentro da própria caixa em vez de
    // empurrar a página inteira para o lado.
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[34rem] border-collapse text-left text-xs">
        <thead className="bg-muted/50">
          <tr>
            {head.map((h) => (
              <th key={h} className="p-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l, i) => (
            <tr key={i} className="border-t align-top">
              {l.map((c, j) => (
                <td key={j} className="p-2.5">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
