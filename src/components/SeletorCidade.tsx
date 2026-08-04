import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { MUNICIPIOS, UFS } from "@/content/municipios";

/**
 * Estado + cidade, em vez de um campo de texto livre.
 *
 * Texto livre virava "BH", "Belo Horizonte MG", "belo horizonte/mg" — três
 * grafias da mesma cidade, impossíveis de agrupar depois. Com a lista do IBGE,
 * o dado nasce padronizado.
 *
 * A cidade só habilita depois da UF: são 5.570 municípios no país, e mostrar
 * todos de uma vez não ajudaria ninguém. Escolhida a UF, sobram algumas
 * centenas — aí a busca dá conta.
 *
 * O valor guardado continua sendo uma string "Cidade / UF", igual ao que o
 * campo antigo produzia: os perfis já cadastrados seguem válidos e as telas do
 * admin não mudam.
 */
export function SeletorCidade({
  valor,
  onChange,
}: {
  valor: string;
  onChange: (v: string) => void;
}) {
  // Reconstrói a seleção a partir do texto salvo, para quem volta a editar.
  const [uf, cidadeSalva] = useMemo(() => {
    const partes = valor.split("/").map((p) => p.trim());
    if (partes.length === 2 && MUNICIPIOS[partes[1]]) return [partes[1], partes[0]];
    return ["", ""];
  }, [valor]);

  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");

  const cidades = uf ? (MUNICIPIOS[uf] ?? []) : [];

  const filtradas = useMemo(() => {
    const termo = normalizar(busca);
    if (!termo) return cidades;
    // Prioriza quem começa com o termo: quem digita "são" quer "São Paulo"
    // antes de "Encruzilhada do Sul".
    const comeca: string[] = [];
    const contem: string[] = [];
    for (const c of cidades) {
      const n = normalizar(c);
      if (n.startsWith(termo)) comeca.push(c);
      else if (n.includes(termo)) contem.push(c);
    }
    return [...comeca, ...contem];
  }, [cidades, busca]);

  function escolherUF(novaUF: string) {
    // Trocar de estado zera a cidade: manter "Divinópolis / SP" seria pior do
    // que exigir a escolha de novo.
    onChange(novaUF ? ` / ${novaUF}` : "");
    setBusca("");
  }

  function escolherCidade(cidade: string) {
    onChange(`${cidade} / ${uf}`);
    setAberto(false);
    setBusca("");
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="uf">Estado</Label>
        <Select value={uf} onValueChange={escolherUF}>
          <SelectTrigger id="uf">
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {UFS.map((u) => (
              <SelectItem key={u.sigla} value={u.sigla}>
                {u.nome} ({u.sigla})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cidade">Cidade</Label>
        <Popover open={aberto} onOpenChange={setAberto}>
          <PopoverTrigger asChild>
            <Button
              id="cidade"
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={aberto}
              disabled={!uf}
              className={cn(
                "w-full justify-between font-normal",
                !cidadeSalva && "text-muted-foreground",
              )}
            >
              {cidadeSalva || (uf ? "Selecione a cidade" : "Escolha o estado primeiro")}
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0"
            align="start"
            // Sem isto o teclado do celular fecha o popover ao abrir.
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-2 border-b px-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <Input
                autoFocus
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder={`Buscar entre ${cidades.length} cidades...`}
                className="h-11 border-0 px-0 shadow-none focus-visible:ring-0"
              />
            </div>

            <div className="max-h-64 overflow-y-auto overscroll-contain p-1">
              {filtradas.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Nenhuma cidade encontrada.
                </p>
              ) : (
                filtradas.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => escolherCidade(c)}
                    className="flex w-full items-center gap-2 rounded-sm px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <Check
                      className={cn(
                        "size-4 shrink-0",
                        c === cidadeSalva ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {c}
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

/** Sem acento e em minúscula: quem digita "sao paulo" acha "São Paulo". */
function normalizar(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
