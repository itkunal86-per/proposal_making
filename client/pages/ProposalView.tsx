import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProposalByToken, valueTotal, type Proposal } from "@/services/proposalsService";

export default function ProposalView() {
  const { token = "" } = useParams();
  const [printSoon, setPrintSoon] = useState(false);
  const [p, setP] = useState<Proposal | null>(null);

  useEffect(() => {
    (async () => setP((await getProposalByToken(token)) ?? null))();
  }, [token]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("print") === "1") {
      setPrintSoon(true);
      setTimeout(() => window.print(), 500);
    }
  }, []);

  if (!p)
    return (
      <section className="container py-16">
        <Card className="mx-auto max-w-2xl p-8 text-center">
          <h1 className="text-2xl font-bold">Invalid link</h1>
          <p className="mt-2 text-muted-foreground">This proposal link is not valid.</p>
        </Card>
      </section>
    );

  return (
    <section className="container py-8 print:py-0">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold">{p.title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            Print / PDF
          </Button>
        </div>
      </div>

      <Card className="mt-4 p-6">
        <div className="text-sm text-muted-foreground">Client: {p.client || "—"} • Status: {p.status}</div>
        <div className="mt-4 space-y-6">
          {p.sections.map((s) => (
            <div key={s.id}>
              <h2 className="text-lg font-semibold">{s.title}</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{s.content}</p>
              {s.media && s.media.length > 0 && (
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {s.media.map((m, i) => (
                    <div key={i} className="rounded border p-2">
                      {m.type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.url} alt="media" className="h-48 w-full rounded object-cover" />
                      ) : (
                        <video src={m.url} controls className="h-48 w-full rounded object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 rounded bg-muted p-4 text-sm">
          <div className="font-medium">Pricing</div>
          <ul className="mt-2 space-y-1">
            {p.pricing.items.map((i) => (
              <li key={i.id} className="flex justify-between"><span>{i.label} × {i.qty}</span> <span>${(i.qty * i.price).toLocaleString()}</span></li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t pt-2">
            <span>Total</span>
            <span className="font-semibold">${valueTotal(p).toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </section>
  );
}
