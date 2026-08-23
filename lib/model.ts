// Modèle du simulateur : construire le mix électrique français de 2050 dans
// les bornes industrielles décrites par RTE.
//
// Les chiffres proviennent de deux documents :
// - « Réactualisation des Futurs énergétiques 2050 », document de consultation
//   publique d'avril 2026 (propositions détaillées, 97 p.) : bornes 2050.
// - « Bilan prévisionnel 2025-2035 » (décembre 2025) : état des lieux 2025.
// Les valeurs 2050 sont donc des propositions soumises à consultation, pas
// encore l'étude finale (publication prévue fin 2026).

export const DOCS = {
  consultation:
    "https://assets.rte-france.com/prod/public/2026-04/RTE-Reactualisation-FE-2050-consultation-publique-2026-propositions-detaillees.pdf",
  synthese:
    "https://assets.rte-france.com/prod/public/2026-04/RTE-Reactualisation-FE-2050-consultation-publique-2026-synthese.pdf",
  bp2025:
    "https://assets.rte-france.com/prod/public/2025-12/2025-12-09-BP2025-resume-executif-synthese.pdf",
  fe2050:
    "https://www.rte-france.com/analyses-tendances-et-prospectives/bilan-previsionnel-2050-futurs-energetiques",
} as const;

export type Source = { label: string; url: string };

const consultationPage = (pages: string): Source => ({
  label: `Consultation FE2050, p. ${pages}`,
  url: `${DOCS.consultation}#page=${pages.split(/\D/)[0]}`,
});

export type FiliereId =
  | "nucleaireExistant"
  | "nucleaireNouveau"
  | "solaire"
  | "eolienTerrestre"
  | "eolienMer"
  | "hydraulique"
  | "bioenergies";

export interface Filiere {
  id: FiliereId;
  nom: string;
  emoji: string;
  /** Capacité installée fin 2025, en GW. */
  actuel: number;
  /** Position initiale du curseur si différente du parc actuel, en GW. */
  defaut?: number;
  /** Bornes du curseur en GW. */
  min: number;
  max: number;
  /** Au-delà de ce seuil, RTE juge la trajectoire hors de portée industrielle. */
  seuilRouge?: number;
  /** Libellé du repère affiché au seuil rouge. */
  seuilRougeLabel?: string;
  /** Facteur de charge retenu par RTE pour 2050 (production = GW x fc x 8760 h). */
  facteurCharge: number;
  /** Rythme d'installation maximal jugé atteignable par RTE, en GW/an. */
  rythmeMax?: number;
  /** Rythme de référence : record ou moyenne historique française, en GW/an. */
  rythmeHistorique?: number;
  rythmeHistoriqueLabel?: string;
  /** Curseur verrouillé (potentiel physique quasi épuisé). */
  fixe?: boolean;
  pilotable: boolean;
  note: string;
  sources: Source[];
}

export const FILIERES: Filiere[] = [
  {
    id: "nucleaireExistant",
    nom: "Nucléaire existant",
    emoji: "⚛️",
    actuel: 63,
    defaut: 40,
    min: 0,
    max: 60,
    seuilRouge: 40,
    seuilRougeLabel: "prolongation au-delà de 70 ans",
    facteurCharge: 0.74,
    pilotable: true,
    note:
      "Le parc actuel (63 GW) devra fermer progressivement. La trajectoire médiane de RTE panache des fermetures à 60, 70 et 80 ans : il en resterait environ 40 GW en 2050. Aller au-delà suppose de prolonger massivement à 80 ans, comme aux États-Unis, sous réserve de l'avis de l'ASNR attendu courant 2026. L'édition 2021 ne supposait que 15,5 GW restants : c'est la révision la plus structurante.",
    sources: [
      consultationPage("33-34"),
      { label: "BP 2025, résumé exécutif", url: DOCS.bp2025 },
    ],
  },
  {
    id: "nucleaireNouveau",
    nom: "Nucléaire nouveau (EPR2 et SMR)",
    emoji: "🏗️",
    actuel: 0,
    min: 0,
    max: 70,
    seuilRouge: 28,
    seuilRougeLabel: "au-delà de 14 EPR2 + 5 GW de SMR",
    facteurCharge: 0.8,
    rythmeMax: 1.7,
    rythmeHistorique: 0,
    rythmeHistoriqueLabel: "premier réacteur vers 2038",
    pilotable: true,
    note:
      "Premier EPR2 vers 2038, puis une paire tous les deux ans au mieux : la trajectoire haute de la filière atteint 14 EPR2 (environ 23 GW) et quelques GW de SMR en 2050. La configuration N4 (40 EPR2, deux paires par an) est jugée par RTE « très nettement supérieure aux trajectoires industrielles actuellement envisagées ».",
    sources: [consultationPage("36")],
  },
  {
    id: "solaire",
    nom: "Solaire",
    emoji: "☀️",
    actuel: 30,
    min: 0,
    max: 275,
    facteurCharge: 0.145,
    rythmeMax: 11.4,
    rythmeHistorique: 5.9,
    rythmeHistoriqueLabel: "record français, 2025",
    pilotable: false,
    note:
      "Environ 30 GW installés fin 2025, après une année record (+5,9 GW, cinq fois la moyenne 2009-2020). Le maximum étudié par RTE (275 GW, configuration M0) exige plus de 11 GW par an pendant 25 ans : un record européen à tenir sans interruption.",
    sources: [consultationPage("41-53"), { label: "BP 2025", url: DOCS.bp2025 }],
  },
  {
    id: "eolienTerrestre",
    nom: "Éolien terrestre",
    emoji: "🌬️",
    actuel: 24,
    min: 0,
    max: 110,
    facteurCharge: 0.27,
    rythmeMax: 3.9,
    rythmeHistorique: 1.3,
    rythmeHistoriqueLabel: "moyenne française 2019-2024",
    pilotable: false,
    note:
      "Environ 24 GW installés fin 2025, au rythme historique de 1,3 GW par an. Le facteur de charge monte de 23,5 % aujourd'hui à 26-28 % en 2050 grâce au renouvellement des machines (repowering).",
    sources: [consultationPage("41-53")],
  },
  {
    id: "eolienMer",
    nom: "Éolien en mer",
    emoji: "🌊",
    actuel: 2,
    min: 0,
    max: 60,
    seuilRouge: 45,
    seuilRougeLabel: "au-delà de la cible publique 2050",
    facteurCharge: 0.41,
    rythmeMax: 2.9,
    rythmeHistorique: 0.5,
    rythmeHistoriqueLabel: "rythme français actuel",
    pilotable: false,
    note:
      "Environ 2 GW en service fin 2025. La planification maritime vise 26 GW en 2040 et 45 GW en 2050 ; RTE étudie jusqu'à 60 GW dans la configuration M0. C'est la filière au meilleur facteur de charge parmi les renouvelables variables (40-42 %).",
    sources: [consultationPage("41-53")],
  },
  {
    id: "hydraulique",
    nom: "Hydraulique",
    emoji: "💧",
    actuel: 22,
    min: 22,
    max: 23,
    facteurCharge: 0.31,
    fixe: true,
    pilotable: true,
    note:
      "Le potentiel français est presque entièrement équipé : environ 22 GW hors pompage, pour près de 60 TWh par an, et au plus 1 GW supplémentaire d'ici 2035. Le curseur est donc verrouillé. S'y ajoutent les stations de pompage (STEP), qui stockent mais ne produisent pas d'énergie nette.",
    sources: [consultationPage("41-53")],
  },
  {
    id: "bioenergies",
    nom: "Bioénergies",
    emoji: "🌱",
    actuel: 2,
    min: 1.3,
    max: 1.3,
    facteurCharge: 0.6,
    fixe: true,
    pilotable: true,
    note:
      "RTE réduit le socle des bioénergies électriques de 2,3 GW (édition 2021) à 1,3 GW en 2050 : la biomasse disponible est plus rare qu'espéré et prioritairement dirigée vers d'autres usages que l'électricité.",
    sources: [consultationPage("41-53")],
  },
];

/** Demande d'électricité 2050, en TWh. */
export const DEMANDE = {
  min: 650,
  max: 1000,
  defaut: 850,
  presets: [
    {
      id: "sobriete",
      nom: "Sobriété",
      valeur: 650,
      description:
        "Forte évolution des modes de vie : -150 à -200 TWh par rapport au cas de base.",
    },
    {
      id: "base",
      nom: "Cas de base",
      valeur: 850,
      description:
        "Trajectoire médiane de la consultation 2026, « sans révolution des modes de vie ».",
    },
    {
      id: "reindustrialisation",
      nom: "Réindustrialisation",
      valeur: 1000,
      description:
        "Croissance et réindustrialisation fortes, ou production en France de tout l'hydrogène : environ +150 TWh.",
    },
  ],
  sources: [consultationPage("27-29")],
} as const;

/**
 * Marge entre demande et besoin de production : pertes réseau et marge
 * exportatrice (~20 TWh) intégrées au dimensionnement des mix RTE.
 */
export const MARGE_PRODUCTION = 1.05;

/**
 * 1 kWh d'électricité bas-carbone remplace environ 2 kWh d'énergie fossile :
 * un moteur électrique convertit ~90 % de l'énergie (25-35 % pour un moteur
 * thermique), une pompe à chaleur restitue ~3 kWh de chaleur par kWh consommé.
 * Ordre de grandeur issu des Futurs énergétiques 2050 (édition 2021).
 */
export const FACTEUR_SUBSTITUTION_FOSSILE = 2;

/** Contenu carbone moyen des énergies fossiles substituées, en MtCO2 par TWh. */
export const CO2_PAR_TWH_FOSSILE = 0.25;

/** Configurations de mix soumises à la consultation d'avril 2026 (850 TWh). */
export interface Scenario {
  id: string;
  nom: string;
  description: string;
  capacites: Record<FiliereId, number>;
  avertissement?: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "M0",
    nom: "M0",
    description:
      "100 % renouvelable en 2050, fermeture anticipée du parc nucléaire.",
    capacites: {
      nucleaireExistant: 0,
      nucleaireNouveau: 0,
      solaire: 275,
      eolienTerrestre: 110,
      eolienMer: 60,
      hydraulique: 22,
      bioenergies: 1.3,
    },
  },
  {
    id: "M2",
    nom: "M2",
    description:
      "Renouvelables soutenus, parc nucléaire existant prolongé jusqu'à sa limite de sûreté, sans nouveau réacteur.",
    capacites: {
      nucleaireExistant: 40,
      nucleaireNouveau: 0,
      solaire: 175,
      eolienTerrestre: 80,
      eolienMer: 45,
      hydraulique: 22,
      bioenergies: 1.3,
    },
  },
  {
    id: "N1",
    nom: "N1",
    description: "8 EPR2 en 2050 (une paire tous les 3-4 ans dès 2038), renouvelables soutenus.",
    capacites: {
      nucleaireExistant: 40,
      nucleaireNouveau: 13,
      solaire: 145,
      eolienTerrestre: 65,
      eolienMer: 40,
      hydraulique: 22,
      bioenergies: 1.3,
    },
  },
  {
    id: "N3",
    nom: "N3",
    description:
      "14 EPR2 et 2 GW de SMR en 2050 (une paire tous les deux ans) : la trajectoire nucléaire haute jugée atteignable.",
    capacites: {
      nucleaireExistant: 40,
      nucleaireNouveau: 25,
      solaire: 110,
      eolienTerrestre: 55,
      eolienMer: 35,
      hydraulique: 22,
      bioenergies: 1.3,
    },
  },
  {
    id: "N4",
    nom: "N4",
    description:
      "Relance nucléaire maximale et arrêt du développement éolien et solaire.",
    avertissement:
      "RTE juge ce rythme de construction (40 EPR2, deux paires par an dès 2044) « très nettement supérieur aux trajectoires industrielles actuellement envisagées ».",
    capacites: {
      nucleaireExistant: 40,
      nucleaireNouveau: 70,
      solaire: 50,
      eolienTerrestre: 0,
      eolienMer: 7,
      hydraulique: 22,
      bioenergies: 1.3,
    },
  },
];

export const ANNEES_RESTANTES = 2050 - 2026;

export type Capacites = Record<FiliereId, number>;

export const capacitesInitiales: Capacites = Object.fromEntries(
  FILIERES.map((f) => [
    f.id,
    Math.min(Math.max(f.defaut ?? f.actuel, f.min), f.max),
  ])
) as Capacites;

export interface Resultat {
  /** Production par filière, en TWh. */
  productions: { filiere: Filiere; twh: number }[];
  totalTwh: number;
  besoinTwh: number;
  /** Positif en cas de déficit, en TWh d'électricité. */
  deficitTwh: number;
  surplusTwh: number;
  /** Énergie fossile conservée faute d'électricité bas-carbone, en TWh. */
  fossilesResiduelsTwh: number;
  emissionsMtCo2: number;
  partVariable: number;
  partPilotable: number;
}

export function simuler(capacites: Capacites, demandeTwh: number): Resultat {
  const productions = FILIERES.map((filiere) => ({
    filiere,
    twh: (capacites[filiere.id] * filiere.facteurCharge * 8760) / 1000,
  }));
  const totalTwh = productions.reduce((somme, p) => somme + p.twh, 0);
  const besoinTwh = demandeTwh * MARGE_PRODUCTION;
  const deficitTwh = Math.max(0, besoinTwh - totalTwh);
  const surplusTwh = Math.max(0, totalTwh - besoinTwh);
  const fossilesResiduelsTwh = deficitTwh * FACTEUR_SUBSTITUTION_FOSSILE;
  const variable = productions
    .filter((p) => !p.filiere.pilotable)
    .reduce((somme, p) => somme + p.twh, 0);
  return {
    productions,
    totalTwh,
    besoinTwh,
    deficitTwh,
    surplusTwh,
    fossilesResiduelsTwh,
    emissionsMtCo2: fossilesResiduelsTwh * CO2_PAR_TWH_FOSSILE,
    partVariable: totalTwh > 0 ? variable / totalTwh : 0,
    partPilotable: totalTwh > 0 ? 1 - variable / totalTwh : 0,
  };
}

export type StatutRythme = "acquis" | "historique" | "record" | "horsBornes";

export interface Rythme {
  gwParAn: number;
  statut: StatutRythme;
}

/** Rythme d'installation annuel qu'implique la capacité visée. */
export function rythmeRequis(filiere: Filiere, capacite: number): Rythme | null {
  if (filiere.fixe) return null;
  const delta = capacite - filiere.actuel;
  const gwParAn = Math.max(0, delta) / ANNEES_RESTANTES;
  if (filiere.seuilRouge !== undefined && capacite > filiere.seuilRouge) {
    return { gwParAn, statut: "horsBornes" };
  }
  if (delta <= 0) return { gwParAn: 0, statut: "acquis" };
  if (filiere.rythmeMax !== undefined && gwParAn > filiere.rythmeMax) {
    return { gwParAn, statut: "horsBornes" };
  }
  if (
    filiere.rythmeHistorique !== undefined &&
    gwParAn > filiere.rythmeHistorique
  ) {
    return { gwParAn, statut: "record" };
  }
  return { gwParAn, statut: "historique" };
}
