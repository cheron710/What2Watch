"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { tmdbImageUrl } from "@/lib/tmdb/client";
import "./watch.css";

// ─── Data ────────────────────────────────────────────────────────────────────
const MOVIES = {
  summer: [
    { id: 398818, t: "Call Me by Your Name", y: 2017, tags: ["date-night","solo-viewing"], note: "A slow-burn Italian summer that lingers in the chest." },
    { id: 313369, t: "La La Land", y: 2016, tags: ["date-night","friends-gathering"], note: "Golden-hour romance built for porch dancing afterward." },
    { id: 11631, t: "Mamma Mia!", y: 2008, tags: ["friends-gathering","family-movie"], note: "ABBA, an island, and absolutely no chill." },
    { id: 578, t: "Jaws", y: 1975, tags: ["family-movie","friends-gathering"], note: "The reason nobody trusts the ocean anymore." },
    { id: 11528, t: "The Sandlot", y: 1993, tags: ["family-movie"], note: "Endless summer, in the best possible way." },
    { id: 235, t: "Stand By Me", y: 1986, tags: ["friends-gathering","solo-viewing"], note: "Walking the tracks with the people who knew you first." },
    { id: 88, t: "Dirty Dancing", y: 1987, tags: ["date-night","friends-gathering"], note: "Nobody puts this one in the corner." },
    { id: 8321, t: "Moonrise Kingdom", y: 2012, tags: ["family-movie","solo-viewing"], note: "Runaway love, told like a storybook." },
    { id: 786, t: "Almost Famous", y: 2000, tags: ["friends-gathering","solo-viewing"], note: "A tour bus, a band, and the feeling of being almost there." },
    { id: 587792, t: "Palm Springs", y: 2020, tags: ["date-night","friends-gathering"], note: "A wedding day stuck on repeat, in the funniest way." },
    { id: 19404, t: "Dazed and Confused", y: 1993, tags: ["friends-gathering","solo-viewing"], note: "The last day of school in 1976." },
    { id: 118, t: "Before Sunrise", y: 1995, tags: ["date-night","solo-viewing"], note: "A nocturnal walking tour of Vienna and instant chemistry." },
    { id: 10515, t: "Ferris Bueller's Day Off", y: 1986, tags: ["family-movie","friends-gathering"], note: "Playing hooky in Chicago on a perfect day." },
    { id: 37165, t: "The Truman Show", y: 1998, tags: ["family-movie","solo-viewing"], note: "Bright blue skies hiding an extraordinary truth." },
    { id: 914, t: "The Great Gatsby", y: 2013, tags: ["date-night","friends-gathering"], note: "Extravagant summer parties on Long Island." },
    { id: 82690, t: "Wreck-It Ralph", y: 2012, tags: ["family-movie"], note: "Arcade fun and sweet Sugar Rush speedway races." },
    { id: 12153, t: "National Lampoon's Vacation", y: 1983, tags: ["family-movie","friends-gathering"], note: "The Griswold family cross-country road trip." },
    { id: 508442, t: "Soul", y: 2020, tags: ["family-movie","solo-viewing"], note: "Finding purpose in the small moments of living." },
    { id: 10625, t: "Mean Girls", y: 2004, tags: ["friends-gathering"], note: "Pink on Wednesdays and high school social hierarchy." },
    { id: 284052, t: "Doctor Strange", y: 2016, tags: ["friends-gathering"], note: "Mind-bending visual spectacles and mystic arts." },
    { id: 299536, t: "Avengers: Infinity War", y: 2018, tags: ["friends-gathering"], note: "The ultimate superhero spectacle built for crowds." },
    { id: 414906, t: "The Batman", y: 2022, tags: ["solo-viewing","friends-gathering"], note: "Gotham City noir and rain-soaked detective work." },
    { id: 438631, t: "Dune", y: 2021, tags: ["solo-viewing","friends-gathering"], note: "Sweeping desert sands and epic cinematic worldbuilding." },
    { id: 671039, t: "Bronx Tale", y: 1993, tags: ["family-movie","solo-viewing"], note: "Growing up in New York with street wisdom and heart." },
    { id: 329, t: "Jurassic Park", y: 1993, tags: ["family-movie","friends-gathering"], note: "Welcome to Jurassic Park — Spielberg's summer masterpiece." },
    { id: 181808, t: "Star Wars: The Force Awakens", y: 2015, tags: ["family-movie","friends-gathering"], note: "Returning to a galaxy far, far away." },
    { id: 361743, t: "Top Gun: Maverick", y: 2022, tags: ["family-movie","friends-gathering","date-night"], note: "Adrenaline, supersonic jets, and pure big-screen magic." },
    { id: 335984, t: "Blade Runner 2049", y: 2017, tags: ["solo-viewing"], note: "Visually breathtaking sci-fi masterpiece." },
    { id: 157336, t: "Interstellar", y: 2014, tags: ["solo-viewing","date-night"], note: "Love transcending time, space, and gravity." },
    { id: 420818, t: "The Lion King", y: 2019, tags: ["family-movie"], note: "The circle of life in stunning animation." }
  ],
  fall: [
    // ── FALL: Cozy Autumn to Horror ──
    { id: 10439, t: "Hocus Pocus", y: 1993, tags: ["family-movie","friends-gathering"], note: "Three Salem witches, one black flame candle, infinite autumn vibes." },
    { id: 4011, t: "Beetlejuice", y: 1988, tags: ["friends-gathering","family-movie"], note: "Say his name three times — the ultimate spooky season comedy." },
    { id: 917496, t: "Beetlejuice Beetlejuice", y: 2024, tags: ["friends-gathering","family-movie"], note: "The ghost with the most is back for more Halloween mischief." },
    { id: 546554, t: "Knives Out", y: 2019, tags: ["friends-gathering","family-movie","date-night"], note: "Cozy sweater-weather whodunit with an autumn New England backdrop." },
    { id: 948, t: "Halloween", y: 1978, tags: ["friends-gathering","solo-viewing"], note: "The night HE came home — John Carpenter's slasher masterpiece." },
    { id: 694, t: "The Shining", y: 1980, tags: ["solo-viewing","date-night"], note: "Here's Johnny! Creepy isolation in the Overlook Hotel." },
    { id: 4232, t: "Scream", y: 1996, tags: ["friends-gathering","date-night"], note: "What's your favorite scary movie? Meta horror perfection." },
    { id: 12162, t: "Practical Magic", y: 1998, tags: ["date-night","friends-gathering"], note: "Witchy sisters, autumn leaves, and midnight margaritas." },
    { id: 207, t: "Dead Poets Society", y: 1989, tags: ["solo-viewing","family-movie"], note: "Crisp New England prep school, autumn trees, and Carpe Diem." },
    { id: 639, t: "When Harry Met Sally...", y: 1989, tags: ["date-night","friends-gathering"], note: "Walking through Central Park in peak autumn foliage." },
    { id: 14836, t: "Coraline", y: 2009, tags: ["family-movie","solo-viewing"], note: "Button eyes, rainy afternoons, and creepy stop-motion wonders." },
    { id: 10315, t: "Fantastic Mr. Fox", y: 2009, tags: ["family-movie","friends-gathering"], note: "Golden corduroy, cider, autumn light, and a grand heist." },
    { id: 947, t: "Sleepy Hollow", y: 1999, tags: ["date-night","solo-viewing"], note: "Tim Burton's foggy, gothic autumn mystery of the Headless Horseman." },
    { id: 13380, t: "Trick 'r Treat", y: 2007, tags: ["friends-gathering"], note: "Four intertwined tales of Halloween rules and autumn horror." },
    { id: 377, t: "A Nightmare on Elm Street", y: 1984, tags: ["friends-gathering"], note: "One, two, Freddy's coming for you..." },
    { id: 2907, t: "The Addams Family", y: 1991, tags: ["family-movie","friends-gathering"], note: "They're creepy and they're kooky, mysterious and spooky!" },
    { id: 270303, t: "What We Do in the Shadows", y: 2014, tags: ["friends-gathering","date-night"], note: "Vampire roommates doing dishes and hosting scary night out." },
    { id: 141, t: "Donnie Darko", y: 2001, tags: ["solo-viewing","friends-gathering"], note: "A giant rabbit warning of the end of the world in October." },
    { id: 942, t: "The Blair Witch Project", y: 1999, tags: ["solo-viewing","friends-gathering"], note: "Lost in the creepy autumn woods of Maryland..." },
    { id: 620, t: "Ghostbusters", y: 1984, tags: ["family-movie","friends-gathering"], note: "Who ya gonna call? NYC spooky paranormal comedy classic." },
    { id: 489, t: "Good Will Hunting", y: 1997, tags: ["solo-viewing","date-night"], note: "Harvard autumn, bench talks, and deep emotional healing." },
    { id: 9489, t: "You've Got Mail", y: 1998, tags: ["date-night"], note: "Bouquets of newly sharpened pencils and crisp fall walks." },
    { id: 530385, t: "Midsommar", y: 2019, tags: ["solo-viewing"], note: "Sunlit folk horror that breaks every genre convention." },
    { id: 419430, t: "Get Out", y: 2017, tags: ["date-night","friends-gathering","solo-viewing"], note: "Jordan Peele's gripping, psychological horror masterclass." },
    { id: 493922, t: "Hereditary", y: 2018, tags: ["solo-viewing"], note: "Dark family secrets and relentless, dread-inducing horror." },
    { id: 348, t: "Alien", y: 1979, tags: ["solo-viewing","friends-gathering"], note: "In space, no one can hear you scream." },
    { id: 447332, t: "A Quiet Place", y: 2018, tags: ["date-night","family-movie","friends-gathering"], note: "If they hear you, they hunt you. Silent horror tension." },
    { id: 138843, t: "The Conjuring", y: 2013, tags: ["date-night","friends-gathering"], note: "Ed and Lorraine Warren facing a dark presence in a haunted house." },
    { id: 565, t: "The Ring", y: 2002, tags: ["friends-gathering","solo-viewing"], note: "Seven days... the ultimate rainy autumn horror tape." },
    { id: 162, t: "Edward Scissorhands", y: 1990, tags: ["family-movie","date-night"], note: "Gothic fairytale with dark, tender autumn vibes." },
    { id: 8834, t: "Casper", y: 1995, tags: ["family-movie"], note: "The friendly ghost in a grand Halloween mansion." },
    { id: 9297, t: "Monster House", y: 2006, tags: ["family-movie"], note: "The house on the block is alive and very angry!" },
    { id: 1091, t: "The Thing", y: 1982, tags: ["solo-viewing","friends-gathering"], note: "John Carpenter's shape-shifting horror masterpiece." },
    { id: 539, t: "Psycho", y: 1960, tags: ["solo-viewing"], note: "Hitchcock's iconic shower scene and Bates Motel horror." },
    { id: 22970, t: "The Cabin in the Woods", y: 2011, tags: ["friends-gathering"], note: "A satirical horror masterpiece with every monster imaginable." },
    { id: 49018, t: "Insidious", y: 2010, tags: ["friends-gathering","date-night"], note: "The Further, red-faced demon, and terrifying jump scares." },
    { id: 310131, t: "The Witch", y: 2015, tags: ["solo-viewing"], note: "1630s New England wilderness folk horror." }
  ],
  winter: [
    // ── WINTER: Christmas & Festive Holiday Movies ──
    { id: 10719, t: "Elf", y: 2003, tags: ["family-movie","friends-gathering","date-night"], note: "Son of a nutcracker! Pure festive Christmas joy." },
    { id: 771, t: "Home Alone", y: 1990, tags: ["family-movie","friends-gathering"], note: "Booby traps as a holiday love language." },
    { id: 772, t: "Home Alone 2: Lost in New York", y: 1992, tags: ["family-movie","friends-gathering"], note: "Kevin vs. the Sticky Bandits in festive NYC." },
    { id: 1585, t: "It's a Wonderful Life", y: 1946, tags: ["family-movie","solo-viewing"], note: "The ultimate Christmas classic that warms every soul." },
    { id: 5255, t: "The Polar Express", y: 2004, tags: ["family-movie"], note: "All aboard for magic, silver bells, and hot chocolate." },
    { id: 508965, t: "Klaus", y: 2019, tags: ["family-movie","date-night"], note: "A gorgeous Christmas origin story that earns every tear." },
    { id: 1581, t: "The Holiday", y: 2006, tags: ["date-night","friends-gathering"], note: "Snowy English cottage vs. sunny LA mansion Christmas house swap." },
    { id: 508, t: "Love Actually", y: 2003, tags: ["date-night","friends-gathering"], note: "Nine intertwined Christmas stories, one airport, all the feelings." },
    { id: 11881, t: "National Lampoon's Christmas Vacation", y: 1989, tags: ["family-movie","friends-gathering"], note: "25,000 lights and complete holiday family chaos." },
    { id: 8871, t: "How the Grinch Stole Christmas", y: 2000, tags: ["family-movie","friends-gathering"], note: "Jim Carrey bringing Whoville Christmas to life." },
    { id: 850, t: "A Christmas Story", y: 1983, tags: ["family-movie","friends-gathering"], note: "You'll shoot your eye out, kid!" },
    { id: 9479, t: "The Nightmare Before Christmas", y: 1993, tags: ["family-movie","friends-gathering"], note: "Jack Skellington taking over Christmas Town." },
    { id: 11395, t: "The Santa Clause", y: 1994, tags: ["family-movie"], note: "Tim Allen accidentally putting on Santa's suit." },
    { id: 43593, t: "Arthur Christmas", y: 2011, tags: ["family-movie"], note: "How 2 billion presents get delivered in one night." },
    { id: 10437, t: "The Muppet Christmas Carol", y: 1992, tags: ["family-movie","friends-gathering"], note: "Dickens, but with Michael Caine and felt." },
    { id: 11529, t: "Scrooged", y: 1988, tags: ["friends-gathering","family-movie"], note: "Bill Murray in a hilarious modern Christmas Carol." },
    { id: 11886, t: "Miracle on 34th Street", y: 1994, tags: ["family-movie"], note: "Proving Kris Kringle is the real deal." },
    { id: 562, t: "Die Hard", y: 1988, tags: ["friends-gathering","solo-viewing"], note: "Welcome to the party, pal — the ultimate Christmas action film." },
    { id: 12113, t: "Four Christmases", y: 2008, tags: ["date-night","friends-gathering"], note: "Surviving four family gatherings in one day." },
    { id: 10140, t: "Bad Santa", y: 2003, tags: ["friends-gathering"], note: "A hilariously profane, dark holiday comedy." },
    { id: 360920, t: "The Grinch", y: 2018, tags: ["family-movie"], note: "Illumination's colorful, heartwarming Christmas animation." },
    { id: 899112, t: "Violent Night", y: 2022, tags: ["friends-gathering"], note: "Santa fighting mercenaries with holiday spirit." },
    { id: 9279, t: "Jingle All the Way", y: 1996, tags: ["family-movie","friends-gathering"], note: "Arnold Schwarzenegger's desperate search for Turbo-Man." },
    { id: 641501, t: "A Boy Called Christmas", y: 2021, tags: ["family-movie"], note: "A magical Nordic quest to find the village of elves." },
    { id: 331482, t: "Little Women", y: 2019, tags: ["family-movie","date-night"], note: "A crackling fire, snow-dusted Concord, and sisterly love." },
    { id: 258480, t: "Carol", y: 2015, tags: ["date-night","solo-viewing"], note: "Longing, shot in the hush of a department-store winter." },
    { id: 162, t: "Edward Scissorhands", y: 1990, tags: ["date-night","family-movie"], note: "Snowfall made of ice sculptures and gothic romance." },
    { id: 671, t: "Harry Potter and the Sorcerer's Stone", y: 2001, tags: ["family-movie"], note: "The Great Hall decorated for Christmas magic." },
    { id: 411, t: "The Chronicles of Narnia", y: 2005, tags: ["family-movie"], note: "Always winter and never Christmas, until Aslan returns." },
    { id: 81188, t: "Rise of the Guardians", y: 2012, tags: ["family-movie"], note: "Jack Frost and Santa defending childhood wonder." },
    { id: 615777, t: "Spirited", y: 2022, tags: ["family-movie","friends-gathering"], note: "Will Ferrell and Ryan Reynolds in a musical Christmas Carol." },
    { id: 546121, t: "Last Christmas", y: 2019, tags: ["date-night"], note: "Emilia Clarke working as a Christmas elf in London." },
    { id: 9655, t: "The Family Stone", y: 2005, tags: ["family-movie","date-night"], note: "Meeting the eccentric family for Christmas." },
    { id: 9969, t: "Deck the Halls", y: 2006, tags: ["family-movie"], note: "Battle of the brightest Christmas light displays." },
    { id: 11013, t: "Jack Frost", y: 1998, tags: ["family-movie"], note: "A father returning as a magical snowman." },
    { id: 400617, t: "Phantom Thread", y: 2017, tags: ["date-night","solo-viewing"], note: "Obsession, tailored within an inch of its life." }
  ],
  spring: [
    { id: 116745, t: "The Secret Life of Walter Mitty", y: 2013, tags: ["solo-viewing","date-night"], note: "Daydreams that finally pack a bag." },
    { id: 129, t: "Spirited Away", y: 2001, tags: ["family-movie","solo-viewing"], note: "A bathhouse full of spirits and one brave kid." },
    { id: 346648, t: "Paddington 2", y: 2017, tags: ["family-movie","friends-gathering"], note: "Kindness as a genuine plot device. Still flawless." },
    { id: 4348, t: "Pride & Prejudice", y: 2005, tags: ["date-night","family-movie"], note: "A hand-flex across a field that ruined other romances." },
    { id: 455207, t: "Crazy Rich Asians", y: 2018, tags: ["date-night","friends-gathering"], note: "A wedding, a fortune, and one unforgettable mahjong scene." },
    { id: 505600, t: "Booksmart", y: 2019, tags: ["friends-gathering","solo-viewing"], note: "One wild night before everything changes." },
    { id: 120467, t: "The Grand Budapest Hotel", y: 2014, tags: ["friends-gathering","family-movie"], note: "Pastry boxes, prison breaks, and Wes Anderson's pinkest film." },
    { id: 8392, t: "My Neighbor Totoro", y: 1988, tags: ["family-movie","solo-viewing"], note: "Soft, slow, and gently magical." },
    { id: 122906, t: "About Time", y: 2013, tags: ["date-night","family-movie"], note: "A love story that's secretly about fathers and time." },
    { id: 366692, t: "Sing Street", y: 2016, tags: ["friends-gathering","date-night"], note: "Falling in love by starting a band for the wrong reasons." },
    { id: 155, t: "The Dark Knight", y: 2008, tags: ["friends-gathering","solo-viewing"], note: "Unmatched tension and legendary villain performance." },
    { id: 27205, t: "Inception", y: 2010, tags: ["solo-viewing","friends-gathering"], note: "Dreams within dreams and infinite possibilities." },
    { id: 98, t: "Gladiator", y: 2000, tags: ["family-movie","solo-viewing"], note: "Are you not entertained? Epic Roman glory." },
    { id: 13, t: "Forrest Gump", y: 1994, tags: ["family-movie","date-night"], note: "Life is like a box of chocolates." },
    { id: 680, t: "Pulp Fiction", y: 1994, tags: ["friends-gathering"], note: "Non-linear storytelling and unforgettable dialogue." },
    { id: 550, t: "Fight Club", y: 1999, tags: ["solo-viewing"], note: "First rule of fight club..." },
    { id: 278, t: "The Shawshank Redemption", y: 1994, tags: ["family-movie","solo-viewing"], note: "Hope is a good thing, maybe the best of things." },
    { id: 238, t: "The Godfather", y: 1972, tags: ["solo-viewing","friends-gathering"], note: "An offer you can't refuse." },
    { id: 496243, t: "Parasite", y: 2019, tags: ["friends-gathering","date-night"], note: "Masterful class thriller that won the Palme d'Or and Oscars." },
    { id: 120, t: "The Lord of the Rings: The Fellowship of the Ring", y: 2001, tags: ["family-movie","friends-gathering"], note: "One ring to rule them all." },
    { id: 603, t: "The Matrix", y: 1999, tags: ["friends-gathering","solo-viewing"], note: "Take the red pill and see how deep the rabbit hole goes." },
    { id: 11, t: "Star Wars", y: 1977, tags: ["family-movie","friends-gathering"], note: "The space opera that defined generations." },
    { id: 857, t: "Saving Private Ryan", y: 1998, tags: ["solo-viewing"], note: "Raw, gripping Normandy invasion and brotherhood." },
    { id: 597, t: "Titanic", y: 1997, tags: ["date-night"], note: "Every night in my dreams I see you..." },
    { id: 497, t: "The Green Mile", y: 1999, tags: ["family-movie","solo-viewing"], note: "Miracles happen in unexpected places." },
    { id: 24428, t: "The Avengers", y: 2012, tags: ["family-movie","friends-gathering"], note: "Earth's mightiest heroes assembling for the first time." }
  ],
} as const;

type Season = keyof typeof MOVIES;
type WithKey = "date-night" | "family-movie" | "friends-gathering" | "solo-viewing";

const SEASON_LABEL: Record<Season, string> = { summer: "Summer", fall: "Fall", winter: "Winter", spring: "Spring" };
const WITH_LABEL: Record<WithKey, string> = {
  "date-night": "Date Night",
  "family-movie": "Family Movie Night",
  "friends-gathering": "Friends Gathering",
  "solo-viewing": "Solo Viewing",
};
const CONTEXT_DESC: Record<Season, Record<WithKey, string>> = {
  summer: { "date-night": "Summer romance, tension under stars.", "family-movie": "Outdoor cinema vibes, adventure.", "friends-gathering": "Blockbuster energy, fun rewatches.", "solo-viewing": "Escapism, road-trip energy." },
  fall: { "date-night": "Cozy, intimate, crisp-weather romance.", "family-movie": "Gratitude-focused, warmth & autumn mystery.", "friends-gathering": "Spooky Halloween fun, horror & thrillers.", "solo-viewing": "Gothic atmosphere & introspective chills." },
  winter: { "date-night": "Snowed-in intimacy, festive Christmas romance.", "family-movie": "Holiday traditions, Christmas classics & magic.", "friends-gathering": "Festive holiday chaos, Christmas comedies.", "solo-viewing": "Fireplace Christmas cinema & reflection." },
  spring: { "date-night": "Renewal, fresh starts, hope.", "family-movie": "Rebirth, adventure, growth.", "friends-gathering": "Outdoor hangouts, lighter tone.", "solo-viewing": "Personal transformation films." },
};

// ─── Season SVG icons ────────────────────────────────────────────────────────
const SeasonIcon = ({ season }: { season: Season }) => {
  if (season === "summer") return (
    <svg className="season-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>
    </svg>
  );
  if (season === "fall") return (
    <svg className="season-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 2c4 2 6 6 5 10-1 4-5 6-9 5C5 16 3 11 6 7c1.5-2 3.5-3.5 6-5z"/><path d="M12 8v13"/>
    </svg>
  );
  if (season === "winter") return (
    <svg className="season-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 2v20M4 7l16 10M20 7L4 17M3 12h18M6 4.5l2 2M16 17.5l2 2M18 4.5l-2 2M8 17.5l-2 2"/>
    </svg>
  );
  return (
    <svg className="season-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 12c0-3-2-5-5-5 0 3 2 5 5 5z"/><path d="M12 12c0-3 2-5 5-5 0 3-2 5-5 5z"/>
      <path d="M12 12c-3 0-5 2-5 5 3 0 5-2 5-5z"/><path d="M12 12c3 0 5 2 5 5-3 0-5-2-5-5z"/>
      <circle cx="12" cy="12" r="1.6"/>
    </svg>
  );
};

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);

// ─── Weather FX ──────────────────────────────────────────────────────────────
const FX_CONFIG = {
  winter: { cls: "fx-snow", count: 64, size: [6, 15], dur: [8, 15] },
  fall:   { cls: "fx-leaf", count: 40, size: [16, 28], dur: [9, 16] },
  spring: { cls: "fx-petal", count: 34, size: [13, 22], dur: [10, 17] },
  summer: { cls: "fx-mote", count: 44, size: [5, 11], dur: [6, 11] },
};
const LEAF_COLORS = ["#a0714f","#c9622e","#d4a537","#8b4a2b","#b5651d"];
const PETAL_COLORS = ["#f0a8c0","#f6c9d8","#ffffff","#eb95b3"];

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── Movie Card ───────────────────────────────────────────────────────────────
interface MovieEntry { id?: number; t: string; y: number; tags: readonly string[]; note: string; poster?: string | null; }

function MovieCardW({ movie, delay }: { movie: MovieEntry; delay: number }) {
  const [imgSrc, setImgSrc] = useState<string | null>(movie.poster ? (movie.poster.startsWith("http") ? movie.poster : tmdbImageUrl(movie.poster, "w500")) : null);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(movie.poster ? "loaded" : "loading");
  const [targetId, setTargetId] = useState<number | undefined>(movie.id);

  React.useEffect(() => {
    if (movie.poster) {
      setImgSrc(movie.poster.startsWith("http") ? movie.poster : tmdbImageUrl(movie.poster, "w500"));
      setStatus("loaded");
      return;
    }

    const q = encodeURIComponent(movie.t);
    fetch(`/api/admin/tmdb?action=search&query=${q}`)
      .then((r) => r.json())
      .then((results) => {
        if (Array.isArray(results) && results.length > 0) {
          const match = results.find((m: any) => m.poster_path) || results[0];
          if (match) {
            if (match.id) setTargetId(match.id);
            if (match.poster_path) {
              setImgSrc(tmdbImageUrl(match.poster_path, "w500"));
              setStatus("loaded");
              return;
            }
          }
        }
        setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [movie.t, movie.y, movie.poster]);

  const href = targetId ? `/movie/${targetId}` : `/search?q=${encodeURIComponent(movie.t)}`;

  return (
    <Link href={href} className="movie-card-w" style={{ animationDelay: `${delay}ms`, textDecoration: 'none', color: 'inherit' }}>
      <div className="movie-poster-wrap">
        {status === "loading" && <div className="poster-skeleton" />}
        {status === "loaded" && imgSrc && (
          <img className="movie-poster-img" src={imgSrc} alt={`${movie.t} poster`} />
        )}
        {status === "error" && (
          <div className="poster-fallback">
            <span>{movie.t}</span>
          </div>
        )}
        <div className="movie-card-overlay">
          <p className="movie-card-note">{movie.note}</p>
        </div>
      </div>
      <div className="movie-card-static-meta">
        <span className="mctitle">{movie.t}</span>
        <span className="mcyear">{movie.y}</span>
      </div>
    </Link>
  );
}

// Helper to check if curated season name matches a selection key
const matchCategory = (catName: string, w: WithKey) => {
  const name = catName.toLowerCase();
  if (w === "date-night") return name.includes("date") || name.includes("partner");
  if (w === "family-movie") return name.includes("family") || name.includes("child") || name.includes("parent");
  if (w === "friends-gathering") return name.includes("friend") || name.includes("group");
  if (w === "solo-viewing") return name.includes("solo") || name.includes("alone");
  return false;
};

interface WatchWithSomeoneProps {
  initialSeasons: any[];
  allMovies: any[];
}

const MOVIES_PER_PAGE = 20;

function getPaginationRange(current: number, total: number) {
  const delta = 2;
  const range: (number | string)[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    } else if (range[range.length - 1] !== "...") {
      range.push("...");
    }
  }
  return range;
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function WatchWithSomeonePage({ initialSeasons = [], allMovies = [] }: WatchWithSomeoneProps) {
  const [season, setSeason] = useState<Season | null>(null);
  const [withKey, setWithKey] = useState<WithKey | null>(null);
  const [picks, setPicks] = useState<MovieEntry[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [fxParticles, setFxParticles] = useState<React.ReactNode[]>([]);
  const [customLede, setCustomLede] = useState("");

  const withStepRef = useRef<HTMLDivElement>(null);
  const resultsStepRef = useRef<HTMLDivElement>(null);

  const spawnFx = useCallback((s: Season) => {
    const cfg = FX_CONFIG[s];
    const particles: React.ReactNode[] = [];
    for (let i = 0; i < cfg.count; i++) {
      const size = rand(cfg.size[0], cfg.size[1]);
      const dur = rand(cfg.dur[0], cfg.dur[1]);
      const style: React.CSSProperties = {
        width: size, height: size,
        left: `${rand(0, 100)}%`,
        animationDuration: `${dur}s`,
        animationDelay: `${-rand(0, dur)}s`,
      };
      if (s === "fall") style.background = pick(LEAF_COLORS);
      if (s === "spring") style.background = pick(PETAL_COLORS);
      if (s === "summer" || s === "spring") {
        style.top = "auto";
        if (s === "summer") style.bottom = `${rand(-10, 100)}%`;
      }
      particles.push(<span key={i} className={`fx-particle ${cfg.cls}`} style={style} />);
    }
    if (s === "spring") {
      for (let i = 0; i < 5; i++) {
        const bStyle: React.CSSProperties = {
          width: rand(120, 260),
          top: `${rand(8, 92)}%`,
          animationDuration: `${rand(7, 12)}s`,
          animationDelay: `${-rand(0, 10)}s`,
        };
        particles.push(<span key={`b${i}`} className="fx-particle fx-breeze" style={bStyle} />);
      }
    }
    setFxParticles(particles);
  }, []);

  const fetchPageResults = useCallback(async (s: Season, w: WithKey, pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/watch-with-someone?season=${s}&with=${w}&page=${pageNum}`);
      const data = await res.json();
      const apiMovies: MovieEntry[] = data.results || [];
      setTotalPages(data.total_pages || 50);

      const seasonName = s === "fall" ? "autumn" : s;
      const matchedCat = (initialSeasons || []).find(
        (cat) =>
          (cat.season.toLowerCase() === seasonName || cat.season.toLowerCase() === s) &&
          cat.is_published !== false &&
          matchCategory(cat.name, w)
      );

      let customDescription = matchedCat?.description || "";
      setCustomLede(customDescription);

      if (pageNum === 1) {
        // Merge top curated seasonal list with API discover results for Page 1
        const seasonPool = [...MOVIES[s]];
        const matching = seasonPool.filter((m: any) => (m.tags as readonly string[]).includes(w));
        const rest = seasonPool.filter((m: any) => !(m.tags as readonly string[]).includes(w));
        const curatedPool = [...matching, ...rest];

        const titleSet = new Set(curatedPool.map((m) => m.t.toLowerCase()));
        const filteredApi = apiMovies.filter((m) => !titleSet.has(m.t.toLowerCase()));
        const combined = [...curatedPool, ...filteredApi].slice(0, MOVIES_PER_PAGE);
        setPicks(combined);
      } else {
        // Page 2..50: use API discover items directly
        if (apiMovies.length > 0) {
          setPicks(apiMovies.slice(0, MOVIES_PER_PAGE));
        } else {
          // Fallback slice
          const seasonPool = [...MOVIES[s]];
          const matching = seasonPool.filter((m: any) => (m.tags as readonly string[]).includes(w));
          const rest = seasonPool.filter((m: any) => !(m.tags as readonly string[]).includes(w));
          const pool = [...matching, ...rest];
          const start = ((pageNum - 1) * MOVIES_PER_PAGE) % pool.length;
          setPicks(pool.slice(start, start + MOVIES_PER_PAGE));
        }
      }
    } catch (err) {
      console.error("Error fetching watch-with-someone page:", err);
      const seasonPool = [...MOVIES[s]];
      const matching = seasonPool.filter((m: any) => (m.tags as readonly string[]).includes(w));
      const rest = seasonPool.filter((m: any) => !(m.tags as readonly string[]).includes(w));
      const pool = [...matching, ...rest];
      setPicks(pool.slice(0, MOVIES_PER_PAGE));
    } finally {
      setLoading(false);
    }
  }, [initialSeasons]);

  const selectSeason = (s: Season) => {
    setSeason(s);
    setCurrentPage(1); // Reset to Page 1 when changing season
    if (withKey) {
      fetchPageResults(s, withKey, 1);
      spawnFx(s);
      setTimeout(() => resultsStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } else {
      setTimeout(() => withStepRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    }
  };

  const selectWith = (w: WithKey) => {
    setWithKey(w);
    setCurrentPage(1); // Reset to Page 1 when changing "Who Are You Watching With?" companion
    if (season) {
      fetchPageResults(season, w, 1);
      spawnFx(season);
      setTimeout(() => resultsStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    }
  };

  const resetPicker = () => {
    setSeason(null);
    setWithKey(null);
    setPicks([]);
    setCurrentPage(1);
    setTotalPages(50);
    setFxParticles([]);
    setCustomLede("");
    document.getElementById("seasonGrid")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (season && withKey) {
      fetchPageResults(season, withKey, newPage);
    }
    resultsStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const showWithStep = season !== null;
  const showResults = picks.length > 0 || loading;

  const paginationRange = getPaginationRange(currentPage, totalPages);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="page-hero">
        <div className="page-hero-content">
          <span className="page-hero-label">Curated Cinema</span>
          <h1 className="page-hero-h">Watch with Someone</h1>
          <p className="page-hero-sub">Films that matter most are the ones we watch together. They become part of our shared memory.</p>
          <div className="hero-byline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hero-byline-avatar" src="https://i.pinimg.com/1200x/99/42/d9/9942d948a2d1e25152dd7a132760e2ac.jpg" alt="Greta Gerwig" />
            <span className="hero-byline-text">Curated by <strong>Greta Gerwig</strong> — Director &amp; Screenwriter</span>
          </div>
        </div>
      </section>

      {/* ── Watch Categories ─────────────────────────────────── */}
      <section className="watch-categories-section" id="watch">
        <div className="watch-categories-container">
          <div className="watch-intro">
            <span className="watch-intro-label">Five Ways to Connect</span>
            <h2 className="watch-intro-h">Viewing Experiences</h2>
            <p className="watch-intro-sub">Every film, every moment with someone else becomes part of your shared story.</p>
          </div>
          <div className="watch-categories">
            {[
              { title: "Date Night", desc: "Romantic but not saccharine — equal focus, real conversation.", examples: "Before Sunrise · In the Mood for Love · Phantom Thread" },
              { title: "Family Movie Night", desc: "Nothing explicit, nothing dumbed down — works for every age in the room.", examples: "Spirited Away · Paddington 2 · The Incredibles" },
              { title: "Friends Gathering", desc: "Endlessly rewatchable, quote-worthy, built for a crowd.", examples: "Ocean's Eleven · Knives Out · Tarantino Films" },
              { title: "Solo Viewing", desc: "Demands your full attention — introspective, one POV.", examples: "Moonlight · Manchester by the Sea · Her" },
              { title: "Parallel Viewing", desc: "Minimal dialogue, internal worlds — shared silence as intimacy.", examples: "Lost in Translation · The Lighthouse · There Will Be Blood" },
            ].map((c) => (
              <div className="watch-card" key={c.title}>
                <h3 className="watch-card-title">{c.title}</h3>
                <p className="watch-card-desc">{c.desc}</p>
                <div className="watch-examples">{c.examples}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Seasonal Picker ──────────────────────────────────── */}
      <section className="seasonal-section" id="seasonal">
        <div className="seasonal-container">
          <div className="seasonal-intro">
            <span className="seasonal-intro-label">Seasonal Cinema</span>
            <h2 className="seasonal-intro-h">Watch by the Season</h2>
            <p className="seasonal-intro-sub">Pick a season, then who you&apos;re watching with — we&apos;ll set the mood and bring films to match.</p>
          </div>

          {/* Step 1: Season grid */}
          <div className="seasons-grid" id="seasonGrid">
            {(["summer","fall","winter","spring"] as Season[]).map((s) => (
              <div
                key={s}
                className={`season-card${season === s ? " is-selected" : ""}`}
                data-season={s}
                onClick={() => selectSeason(s)}
              >
                <div>
                  <div className="season-card-top">
                    <h3 className="season-title">{SEASON_LABEL[s]}</h3>
                    <SeasonIcon season={s} />
                  </div>
                  <p className="season-tagline">
                    {s === "summer" && "Sun-warmed nights, open windows, and films that taste like the last day of school."}
                    {s === "fall" && "Sweaters, candlelight, cozy mysteries, and spooky horror movies for crisp autumn nights."}
                    {s === "winter" && "Fogged-up windows, crackling fireplaces, and warm festive Christmas classics."}
                    {s === "spring" && "New light, open air, and films that feel like exhaling for the first time."}
                  </p>
                </div>
                <div className="season-pick-hint">
                  Choose {SEASON_LABEL[s]} <ArrowIcon />
                </div>
              </div>
            ))}
          </div>

          {/* Step 2: Who are you watching with? */}
          <div ref={withStepRef} className={`with-step${showWithStep ? " is-active" : ""}`} id="withStep">
            <span className="with-step-eyebrow">For Your {season ? SEASON_LABEL[season] : "Season"}</span>
            <h3 className="with-step-h">Who Are You Watching With?</h3>
            <div className="with-pills">
              {(["date-night","family-movie","friends-gathering","solo-viewing"] as WithKey[]).map((w) => (
                <button
                  key={w}
                  className={`with-pill${withKey === w ? " is-active" : ""}`}
                  data-with={w}
                  onClick={() => selectWith(w)}
                >
                  {WITH_LABEL[w]}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div ref={resultsStepRef} className={`results-step${showResults ? " is-active" : ""}`} id="resultsStep">
            <div className="results-panel" id="resultsPanel" data-season={season || "summer"}>
              <div className="results-fx">{fxParticles}</div>
              <div className="results-header">
                <span className="results-eyebrow">
                  {season ? SEASON_LABEL[season] : ""}{season && withKey ? " · " : ""}{withKey ? WITH_LABEL[withKey] : ""}
                </span>
                <p className="results-sub">
                  {customLede || (season && withKey ? CONTEXT_DESC[season][withKey] : "")}
                </p>
              </div>

              {loading ? (
                <div className="movie-grid-loading" style={{ textAlign: "center", padding: "60px 0", color: "#a0a0a0" }}>
                  <div className="spinner" style={{ fontSize: "1.2rem", fontWeight: 500 }}>Loading movies for Page {currentPage}...</div>
                </div>
              ) : (
                <div className="movie-grid">
                  {picks.map((movie, i) => (
                    <MovieCardW key={`${movie.t}-${i}`} movie={movie} delay={i * 25} />
                  ))}
                </div>
              )}

              {/* Pagination Controls supporting up to 50 pages */}
              {totalPages > 1 && (
                <div className="watch-pagination">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="watch-page-btn"
                  >
                    ← Previous Page
                  </button>

                  <div className="watch-page-numbers">
                    {paginationRange.map((item, idx) =>
                      item === "..." ? (
                        <span key={`ellipsis-${idx}`} className="watch-page-ellipsis" style={{ padding: "0 6px", color: "rgba(255,255,255,0.4)", alignSelf: "center" }}>
                          ...
                        </span>
                      ) : (
                        <button
                          key={`page-${item}`}
                          type="button"
                          onClick={() => handlePageChange(item as number)}
                          disabled={loading}
                          className={`watch-page-num ${currentPage === item ? "is-active" : ""}`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="watch-page-btn"
                  >
                    Next Page →
                  </button>
                </div>
              )}
            </div>

            <button className="start-over-btn" onClick={resetPicker}>Start Over</button>
          </div>
        </div>
      </section>
    </>
  );
}

