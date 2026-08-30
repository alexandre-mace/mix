# mix

Simulateur du mix électrique 2050, dans les bornes des scénarios RTE.

## Commandes

- `pnpm dev` développement
- `pnpm build` build de production, et c'est le contrôle : il type-check et échoue sur une erreur de compilation
- `pnpm lint`

## Stack

Next 16 en App Router, React 19, TypeScript strict, Tailwind 4, shadcn sur base Base UI.

Conventions de la stack : `docs/next-guidelines.md` et `docs/react-guidelines.md`, liens vers [dev-standards](https://github.com/alexandre-mace/dev-standards).

## Doctrine

Le principe : jouer avec les proportions du mix électrique 2050 **dans les contraintes industrielles
annoncées par RTE**, pas dans le vide. Sources de référence : la consultation publique d'avril 2026
sur la réactualisation des Futurs énergétiques 2050, et le Bilan prévisionnel 2025.

- **Le lien avec les fossiles est central** : chaque TWh d'électricité bas carbone manquant conserve
  environ 2 TWh de fossiles dans les usages, par les rendements. Un scénario ne se juge pas sur son
  seul mix électrique.
- **Modèle annualisé** : GW x facteur de charge x 8760 h, besoin = demande x 1,05. Les configurations
  M0, M2, N1, N3 et N4 sont chargées en presets.
- **Seuils rouges** explicites (prolongation au-delà de 70 ans, plus de 14 EPR2 et SMR) et badges de
  rythme d'installation comparés aux records historiques : la contrainte doit se voir.
- **Sources partout**, avec ancres `#page=N` vers les PDF RTE. Un chiffre sans source ne s'affiche pas.

À intégrer quand l'étude finale paraît (fin 2026) : la comparaison des coûts complets RTE, pas encore
réactualisée.
