"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ANNEES_RESTANTES,
  Capacites,
  capacitesInitiales,
  DEMANDE,
  FACTEUR_SUBSTITUTION_FOSSILE,
  Filiere,
  FILIERES,
  rythmeRequis,
  SCENARIOS,
  simuler,
} from "@/lib/model";
import { cn } from "@/lib/utils";

const COULEURS: Record<string, string> = {
  nucleaireExistant: "bg-indigo-400",
  nucleaireNouveau: "bg-indigo-600",
  solaire: "bg-amber-400",
  eolienTerrestre: "bg-sky-400",
  eolienMer: "bg-sky-600",
  hydraulique: "bg-cyan-500",
  bioenergies: "bg-lime-500",
};

const fr = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const fr1 = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

function RythmeBadge({ filiere, capacite }: { filiere: Filiere; capacite: number }) {
  const rythme = rythmeRequis(filiere, capacite);
  if (!rythme) return null;
  if (filiere.id === "nucleaireExistant") {
    // Pour le parc existant, l'enjeu est la prolongation, pas la construction.
    if (rythme.statut === "horsBornes") {
      return (
        <Badge className="border-amber-200 bg-amber-50 text-amber-700">
          pari : prolongations à 80 ans, avis ASNR attendu
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        {capacite >= (filiere.seuilRouge ?? 0)
          ? "trajectoire médiane RTE"
          : "fermetures anticipées du parc"}
      </Badge>
    );
  }
  if (rythme.statut === "acquis") {
    if (capacite === 0 && filiere.actuel === 0) return null;
    return (
      <Badge variant="secondary">
        {capacite < filiere.actuel ? "parc réduit, non renouvelé" : "déjà installé"}
      </Badge>
    );
  }
  const label = `${fr1.format(rythme.gwParAn)} GW/an`;
  if (rythme.statut === "horsBornes") {
    return (
      <Badge className="border-red-200 bg-red-50 text-red-700">
        {label} : hors bornes RTE
      </Badge>
    );
  }
  if (rythme.statut === "record") {
    return (
      <Badge className="border-amber-200 bg-amber-50 text-amber-700">
        {label} : au-delà du rythme historique
      </Badge>
    );
  }
  return <Badge variant="secondary">{label}</Badge>;
}

function FiliereCard({
  filiere,
  capacite,
  onChange,
}: {
  filiere: Filiere;
  capacite: number;
  onChange: (valeur: number) => void;
}) {
  const twh = (capacite * filiere.facteurCharge * 8760) / 1000;
  return (
    <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium">
          <span className="mr-1.5">{filiere.emoji}</span>
          {filiere.nom}
        </p>
        <p className="font-mono text-sm text-muted-foreground">
          {fr1.format(capacite)} GW, soit {fr.format(twh)} TWh
        </p>
      </div>
      {filiere.fixe ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Curseur verrouillé : potentiel physique quasi épuisé.
        </p>
      ) : (
        <div className="relative mt-4">
          {filiere.seuilRouge !== undefined && (
            <div
              className="pointer-events-none absolute top-1/2 z-10 h-3.5 w-px -translate-y-1/2 bg-red-400"
              style={{
                left: `${((filiere.seuilRouge - filiere.min) / (filiere.max - filiere.min)) * 100}%`,
              }}
              title={filiere.seuilRougeLabel}
            />
          )}
          <Slider
            aria-label={`Capacité ${filiere.nom}`}
            minValue={filiere.min}
            maxValue={filiere.max}
            step={1}
            value={capacite}
            onChange={(valeur) => onChange(valeur as number)}
          />
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RythmeBadge filiere={filiere} capacite={capacite} />
        {filiere.rythmeHistorique !== undefined &&
          filiere.rythmeHistorique > 0 && (
            <span className="text-xs text-muted-foreground">
              repère : {fr1.format(filiere.rythmeHistorique)} GW/an (
              {filiere.rythmeHistoriqueLabel})
            </span>
          )}
      </div>
      <details className="mt-3 text-sm text-muted-foreground">
        <summary className="cursor-pointer select-none font-medium text-foreground/80">
          Pourquoi ces bornes ?
        </summary>
        <p className="mt-2 text-pretty">{filiere.note}</p>
        <p className="mt-2">
          {filiere.sources.map((source, i) => (
            <a
              key={i}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mr-3 text-primary underline-offset-2 hover:underline"
            >
              {source.label}
            </a>
          ))}
        </p>
      </details>
    </div>
  );
}

export function Simulator() {
  const [demande, setDemande] = useState<number>(DEMANDE.defaut);
  const [capacites, setCapacites] = useState<Capacites>(capacitesInitiales);
  const [scenarioActif, setScenarioActif] = useState<string | null>(null);

  const resultat = simuler(capacites, demande);
  const couverture = resultat.totalTwh / resultat.besoinTwh;
  // Le modèle annualisé n'est pas précis au TWh près : un écart inférieur à
  // 1 % du besoin se lit comme un équilibre, pas comme un déficit.
  const deficitSignificatif = resultat.deficitTwh > resultat.besoinTwh * 0.01;
  const equilibre = couverture >= 0.99 && couverture <= 1.1;
  const scenario = SCENARIOS.find((s) => s.id === scenarioActif);

  const setCapacite = (id: string, valeur: number) => {
    setScenarioActif(null);
    setCapacites((prev) => ({ ...prev, [id]: valeur }));
  };

  const chargerScenario = (id: string) => {
    const s = SCENARIOS.find((sc) => sc.id === id);
    if (!s) return;
    setCapacites({ ...s.capacites });
    setDemande(850);
    setScenarioActif(id);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="flex min-w-0 flex-col gap-8">
        {/* Demande */}
        <section className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-medium">🎯 Quelle France en 2050 ?</h2>
            <p className="font-mono text-sm text-muted-foreground">
              {fr.format(demande)} TWh de demande
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEMANDE.presets.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                data-selected={demande === preset.valeur || undefined}
                className="data-selected:border-primary data-selected:bg-primary/5 data-selected:text-primary"
                onPress={() => {
                  setDemande(preset.valeur);
                  setScenarioActif(null);
                }}
              >
                {preset.nom}
              </Button>
            ))}
          </div>
          <div className="mt-4">
            <Slider
              aria-label="Demande d'électricité en 2050"
              minValue={DEMANDE.min}
              maxValue={DEMANDE.max}
              step={10}
              value={demande}
              onChange={(valeur) => {
                setDemande(valeur as number);
                setScenarioActif(null);
              }}
            />
          </div>
          <p className="mt-3 text-sm text-pretty text-muted-foreground">
            {DEMANDE.presets.find((p) => p.valeur === demande)?.description ??
              "Trajectoire personnalisée entre sobriété et réindustrialisation."}{" "}
            <a
              href={DEMANDE.sources[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 hover:underline"
            >
              {DEMANDE.sources[0].label}
            </a>
          </p>
        </section>

        {/* Scénarios RTE */}
        <section>
          <h2 className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            Charger une configuration RTE (consultation 2026, demande 850 TWh)
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {SCENARIOS.map((s) => (
              <Button
                key={s.id}
                variant="outline"
                size="sm"
                data-selected={scenarioActif === s.id || undefined}
                className="data-selected:border-primary data-selected:bg-primary/5 data-selected:text-primary"
                onPress={() => chargerScenario(s.id)}
              >
                {s.nom}
              </Button>
            ))}
          </div>
          {scenario && (
            <p className="mt-3 text-sm text-pretty text-muted-foreground">
              <span className="font-medium text-foreground">
                {scenario.nom} :
              </span>{" "}
              {scenario.description}
              {scenario.avertissement && (
                <span className="mt-1 block text-red-700">
                  ⚠️ {scenario.avertissement}
                </span>
              )}
            </p>
          )}
        </section>

        {/* Filières */}
        <section className="flex flex-col gap-4">
          <h2 className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            Votre parc de production
          </h2>
          {FILIERES.map((filiere) => (
            <FiliereCard
              key={filiere.id}
              filiere={filiere}
              capacite={capacites[filiere.id]}
              onChange={(valeur) => setCapacite(filiere.id, valeur)}
            />
          ))}
        </section>
      </div>

      {/* Résultat */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <h2 className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            Votre système en 2050
          </h2>

          <p className="mt-4 text-3xl font-semibold tracking-tight">
            {fr.format(resultat.totalTwh)}{" "}
            <span className="text-base font-normal text-muted-foreground">
              / {fr.format(resultat.besoinTwh)} TWh
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            production bas-carbone / besoin (demande + pertes et marge
            d&apos;export)
          </p>

          {/* Barre empilée */}
          <div className="mt-4 flex h-5 w-full overflow-hidden rounded-full bg-secondary">
            {resultat.productions
              .filter((p) => p.twh > 0)
              .map((p) => (
                <div
                  key={p.filiere.id}
                  className={cn("h-full", COULEURS[p.filiere.id])}
                  style={{
                    width: `${Math.min(100, (p.twh / Math.max(resultat.besoinTwh, resultat.totalTwh)) * 100)}%`,
                  }}
                  title={`${p.filiere.nom} : ${fr.format(p.twh)} TWh`}
                />
              ))}
            {resultat.deficitTwh > 0 && (
              <div
                className="h-full bg-red-200"
                style={{
                  width: `${(resultat.deficitTwh / resultat.besoinTwh) * 100}%`,
                }}
                title={`Manque : ${fr.format(resultat.deficitTwh)} TWh`}
              />
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {resultat.productions
              .filter((p) => p.twh > 0)
              .map((p) => (
                <span
                  key={p.filiere.id}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span
                    className={cn(
                      "inline-block size-2 rounded-full",
                      COULEURS[p.filiere.id]
                    )}
                  />
                  {p.filiere.nom} {fr.format(p.twh)}
                </span>
              ))}
          </div>

          {/* Verdict */}
          {deficitSignificatif ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="font-medium text-red-800">
                Il manque {fr.format(resultat.deficitTwh)} TWh d&apos;électricité
                bas-carbone.
              </p>
              <p className="mt-2 text-sm text-pretty text-red-700">
                Ces usages ne disparaissent pas : ils restent aux énergies
                fossiles. Comme 1 kWh d&apos;électricité en remplace environ{" "}
                {FACTEUR_SUBSTITUTION_FOSSILE} d&apos;origine fossile (rendement
                des moteurs électriques et des pompes à chaleur), ce sont{" "}
                <span className="font-medium">
                  ~{fr.format(resultat.fossilesResiduelsTwh)} TWh de pétrole et
                  de gaz conservés
                </span>
                , soit environ{" "}
                <span className="font-medium">
                  {fr.format(resultat.emissionsMtCo2)} MtCO2 par an
                </span>{" "}
                (le transport routier français en émet ~120).
              </p>
            </div>
          ) : resultat.surplusTwh > resultat.besoinTwh * 0.1 ? (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-medium text-amber-800">
                Surcapacité : {fr.format(resultat.surplusTwh)} TWh au-delà du
                besoin.
              </p>
              <p className="mt-2 text-sm text-pretty text-amber-700">
                Sans nouveaux débouchés (exports, électrolyse), une partie de
                cette production serait écrêtée ou modulée : c&apos;est le
                risque de « surcapacité durable » décrit par le Bilan
                prévisionnel 2025.
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="font-medium text-primary">
                ✓ Le besoin est couvert{equilibre ? "" : ", avec de la marge"}.
              </p>
              <p className="mt-2 text-sm text-pretty text-muted-foreground">
                La neutralité carbone suppose de tenir ce niveau de production :
                chaque TWh bas-carbone produit en remplace environ{" "}
                {FACTEUR_SUBSTITUTION_FOSSILE} d&apos;origine fossile.
              </p>
            </div>
          )}

          {/* Part variable */}
          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium">Production variable</p>
              <p className="font-mono text-sm text-muted-foreground">
                {fr.format(resultat.partVariable * 100)} %
              </p>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${resultat.partVariable * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-pretty text-muted-foreground">
              {resultat.partVariable > 0.5
                ? "Plus de la moitié de la production dépend de la météo : le système exige des flexibilités massives (batteries, hydrogène, pilotage de la demande, interconnexions) et des paris technologiques encore ouverts."
                : "Le socle pilotable limite les besoins de stockage et de centrales d'appoint : les flexibilités restent dans le prolongement de l'existant."}
            </p>
          </div>

          <p className="mt-5 border-t pt-4 text-xs text-pretty text-muted-foreground">
            Rythmes calculés sur {ANNEES_RESTANTES} ans (2026-2050). Chiffres
            issus de la consultation publique RTE d&apos;avril 2026 : ce sont
            des propositions, l&apos;étude actualisée paraît fin 2026.
          </p>
        </div>
      </aside>
    </div>
  );
}
