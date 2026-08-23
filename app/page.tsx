import { Brand } from "@/components/brand";
import { ClimateLabBadge } from "@/components/climatelab-badge";
import { MadeWithLove } from "@/components/made-with-love";
import { Simulator } from "@/components/Simulator";
import { TextLink } from "@/components/ui/text-link";
import { DOCS } from "@/lib/model";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-4 sm:px-6">
        <Brand
          name="Mix"
          logo="https://em-content.zobj.net/source/apple/354/high-voltage_26a1.png"
        />
        <ClimateLabBadge />
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
        <section className="mt-10 mb-10 max-w-2xl sm:mt-14">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Construisez le mix électrique de 2050
          </h1>
          <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
            Pour sortir des énergies fossiles, la France doit produire beaucoup
            plus d&apos;électricité bas-carbone. Choisissez une demande, poussez
            les curseurs de chaque filière dans les{" "}
            <span className="font-medium text-foreground">
              bornes industrielles décrites par RTE
            </span>
            , et voyez ce que votre mix implique : équilibre, paris
            technologiques, ou pétrole et gaz conservés faute de mieux.
          </p>
        </section>

        <Simulator />

        <section className="mt-16 max-w-2xl border-t pt-8 pb-4">
          <h2 className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            Méthode et sources
          </h2>
          <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-pretty text-muted-foreground">
            <p>
              La production annuelle de chaque filière vaut capacité (GW) x
              facteur de charge x 8 760 heures. Les facteurs de charge, bornes
              de capacité et rythmes maximaux sont ceux de la consultation
              publique d&apos;avril 2026 sur la réactualisation des « Futurs
              énergétiques 2050 » : ce sont des propositions soumises à
              concertation, l&apos;étude complète paraît fin 2026. Le besoin de
              production ajoute 5 % à la demande (pertes réseau et marge
              exportatrice d&apos;environ 20 TWh, intégrées par RTE au
              dimensionnement des mix).
            </p>
            <p>
              Ce simulateur annualise l&apos;équilibre : il ne modélise ni les
              heures sans vent ni les pointes de froid, que RTE simule heure par
              heure sur 35 pays. Un mix « équilibré » ici peut donc rester
              infaisable sans les flexibilités décrites dans le rapport : le
              curseur de production variable en donne un premier signal.
            </p>
            <p>
              Chaque TWh d&apos;électricité bas-carbone manquant conserve
              environ 2 TWh d&apos;énergies fossiles dans les transports, le
              chauffage ou l&apos;industrie : un moteur électrique convertit
              ~90 % de son énergie contre 25-35 % pour un moteur thermique, une
              pompe à chaleur restitue ~3 kWh de chaleur par kWh consommé
              (Futurs énergétiques 2050, édition 2021). Les émissions associées
              retiennent 0,25 MtCO2 par TWh fossile.
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              <TextLink href={DOCS.consultation} target="_blank" rel="noopener noreferrer">
                Consultation FE2050 (avril 2026, PDF)
              </TextLink>
              <TextLink href={DOCS.synthese} target="_blank" rel="noopener noreferrer">
                Synthèse de la consultation (PDF)
              </TextLink>
              <TextLink href={DOCS.bp2025} target="_blank" rel="noopener noreferrer">
                Bilan prévisionnel 2025 (PDF)
              </TextLink>
              <TextLink href={DOCS.fe2050} target="_blank" rel="noopener noreferrer">
                Futurs énergétiques 2050 (RTE)
              </TextLink>
            </p>
          </div>
        </section>
      </main>

      <MadeWithLove className="pb-8" />
    </div>
  );
}
