/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Le site n'affiche qu'un emoji de logo et celui du badge, déjà `unoptimized`.
    // Le `remotePatterns` ne servait qu'à laisser transformer n'importe quelle image
    // d'em-content.zobj.net (des milliers d'emojis × 15 largeurs) sur le quota Hobby
    // de 5 000 par mois. Tout servi tel quel : zéro transformation, plus de /_next/image.
    unoptimized: true,
  },
};

module.exports = nextConfig;
