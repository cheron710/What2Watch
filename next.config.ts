import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // TMDb is the only trusted remote image source. The hero/prototype pages
    // reference a few editorial stills from other hosts via plain <img>, which
    // are intentionally left un-optimised.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
};

export default nextConfig;
