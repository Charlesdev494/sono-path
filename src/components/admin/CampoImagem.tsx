import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { useEnviarImagem } from "@/lib/data/admin";
import { Button } from "@/components/ui/button";

// Campo de imagem: arraste o arquivo ou clique para escolher. Sobe direto para
// o Storage e devolve a URL pública — quem usa não precisa saber que existe
// "Storage", "bucket" ou "URL".
export function CampoImagem({
  url,
  onChange,
  label = "Imagem",
}: {
  url: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const enviar = useEnviarImagem();
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function processar(arquivo: File | undefined) {
    if (!arquivo) return;
    setErro(null);
    try {
      const novaUrl = await enviar.mutateAsync(arquivo);
      onChange(novaUrl);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar a imagem.");
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>

      {url ? (
        <div className="relative overflow-hidden rounded-lg border bg-slate-900">
          <img src={url} alt="" className="mx-auto max-h-56 w-auto object-contain" />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 gap-1"
          >
            <X className="size-3.5" />
            Remover
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastando(false);
            processar(e.dataTransfer.files[0]);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed p-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            arrastando ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
          }`}
        >
          {enviar.isPending ? (
            <>
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Enviando...</p>
            </>
          ) : (
            <>
              <ImagePlus className="size-5 text-muted-foreground" />
              <p className="text-sm font-medium">Arraste a imagem aqui ou clique para escolher</p>
              <p className="text-xs text-muted-foreground">PNG, JPG ou WebP · até 10 MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => processar(e.target.files?.[0])}
      />

      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
