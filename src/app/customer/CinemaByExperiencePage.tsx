import CinemaByExperienceClient, { CraftCategory, CraftMovieItem } from "./CinemaByExperienceClient";
import { searchMovies, getMovieDetail } from "@/lib/tmdb/client";

export const revalidate = 86400; // Cache TMDB resolved data for 24 hours

// Direct TMDB mapping table for maximum precision & speed
const DIRECT_TMDB_MAP: Record<string, number> = {
  "blade runner 2049": 335984,
  "in the mood for love": 843,
  "the revenant": 281957,
  "the grand budapest hotel": 120467,
  "roma": 426426,
  "dune: part two": 693134,
  "black narcissus": 25330,
  "the zone of interest": 467244,
  "sound of metal": 502033,
  "a quiet place": 447332,
  "dunkirk": 374720,
  "there will be blood": 7345,
  "no country for old men": 6977,
  "under the skin": 97370,
  "whiplash": 244786,
  "gravity": 81005,
  "hamnet": 1024345,
  "the master": 68722,
  "marriage story": 492188,
  "anatomy of a fall": 915935,
  "manchester by the sea": 334543,
  "uncut gems": 473033,
  "portrait of a lady on fire": 531428,
  "aftersun": 965150,
  "children of men": 9693,
  "1917": 530915,
  "russian ark": 15998,
  "boyhood": 85350,
  "parasite": 496243,
  "mad max: fury road": 76341,
  "drive my car": 739405,
  "jeanne dielman": 30872,
  "birdman": 194662,
  "memento": 77,
  "the sixth sense": 745,
  "the usual suspects": 629,
  "oldboy": 670,
  "gone girl": 210577,
  "knives out": 546554,
  "shutter island": 11324,
  "fight club": 550,
  "coherence": 220289,
};

const CRAFT_CATEGORIES_RAW = [
  { id: "visual", label: "Visual Craft" },
  { id: "sound", label: "Sound" },
  { id: "performance", label: "Performance" },
  { id: "direction", label: "Direction" },
  { id: "twist", label: "Story Twists" }
];

const CRAFT_META_RAW: Record<string, { title: string; sub: string; look: string }> = {
  visual: {
    title: "Shot to be looked at, not just watched.",
    sub: "Cinematography, format and production design carrying the scene on their own.",
    look: "Watch for: where the light is coming from, and how much of the frame is left empty."
  },
  sound: {
    title: "Heard before it's understood.",
    sub: "Score, silence and mixing doing narrative work most films hand to dialogue.",
    look: "Watch for: what you can hear that you are never shown."
  },
  performance: {
    title: "The work happens between the lines.",
    sub: "Films built around what an actor does with a face, a pause, or a room they can't leave.",
    look: "Watch for: what the actor is doing while someone else is talking."
  },
  direction: {
    title: "Somebody decided where you stand.",
    sub: "Blocking, duration and camera placement used as argument rather than coverage.",
    look: "Watch for: how long a shot runs before it cuts, and why it cuts when it does."
  },
  twist: {
    title: "You'll want to watch it again immediately.",
    sub: "Structure and reveals built to change what everything before them meant.",
    look: "Watch for: the detail the film shows you early and trusts you to misread."
  }
};

const CRAFT_DATA_RAW: Record<string, { t: string; d: string; w: string }[]> = {
  visual: [
    { t: "Sinners", d: "Ryan Coogler · 2025", w: "The first feature shot on both IMAX 65mm and Ultra Panavision 70 — the tallest frame in cinema cutting against the widest. Autumn Durald Arkapaw became the first woman to win the cinematography Oscar for it." },
    { t: "One Battle After Another", d: "Paul Thomas Anderson · 2025", w: "Roughly 80% shot on VistaVision, a 1950s format that runs 35mm film sideways through the camera for a negative twice the usual size. Anderson wanted the texture of The French Connection." },
    { t: "Blade Runner 2049", d: "Denis Villeneuve · 2017", w: "Roger Deakins lights Los Angeles like it's already a memory of itself. His first Oscar, after more than a dozen nominations." },
    { t: "In the Mood for Love", d: "Wong Kar-wai · 2000", w: "Longing shot through doorways, mirrors and rain, with the two leads almost never sharing a frame cleanly." },
    { t: "The Revenant", d: "Alejandro G. Iñárritu · 2015", w: "Natural light only, which meant a shooting day of roughly ninety usable minutes and a schedule dictated entirely by the sun." },
    { t: "The Grand Budapest Hotel", d: "Wes Anderson · 2014", w: "Three aspect ratios for three time periods — the frame itself tells you which decade you're in before anyone speaks." },
    { t: "Roma", d: "Alfonso Cuarón · 2018", w: "Black and white, deep focus, and a camera that pans rather than cuts — so nothing is ever emphasised for you." },
    { t: "Dune: Part Two", d: "Denis Villeneuve · 2024", w: "A desert scaled so vast the camera can barely contain it, with the Giedi Prime sequences shot in infrared for a sun that reads as black." },
    { t: "Black Narcissus", d: "Powell & Pressburger · 1947", w: "A Himalayan convent built entirely on a Pinewood soundstage, with painted glass for mountains. It still looks vast." }
  ],
  sound: [
    { t: "The Zone of Interest", d: "Jonathan Glazer · 2023", w: "Johnnie Burn spent a year researching and recording before the shoot, then built the camp entirely out of off-screen sound. The atrocity is heard and never shown — it won Best Sound." },
    { t: "Sound of Metal", d: "Darius Marder · 2019", w: "The mix itself goes deaf along with its drummer, dropping you inside the hearing loss instead of describing it." },
    { t: "A Quiet Place", d: "John Krasinski · 2018", w: "A monster movie where sound design is the monster, and silence is the only safe place in the film." },
    { t: "Dunkirk", d: "Christopher Nolan · 2017", w: "A ticking watch built directly into Hans Zimmer's score, layered over a Shepard tone that seems to rise forever without ever getting higher." },
    { t: "There Will Be Blood", d: "Paul Thomas Anderson · 2007", w: "Jonny Greenwood's strings scrape the dread into place before a word of dialogue arrives — the first fifteen minutes have none." },
    { t: "No Country for Old Men", d: "Coen Brothers · 2007", w: "Almost no score at all. Wind, boots, a motel air conditioner and a cattle gun do the whole job." },
    { t: "Under the Skin", d: "Jonathan Glazer · 2013", w: "Mica Levi's score sounds composed by something that has studied human music without understanding it." },
    { t: "Whiplash", d: "Damien Chazelle · 2014", w: "The edit is cut to the drumming rather than the other way around, which is why the last ten minutes play like a fight." },
    { t: "Gravity", d: "Alfonso Cuarón · 2013", w: "True silence in vacuum — impacts arrive through the suit as vibration, because sound has nothing to travel through." }
  ],
  performance: [
    { t: "Hamnet", d: "Chloé Zhao · 2025", w: "Zhao shoots grief in extreme close-up and largely in available light, leaving Jessie Buckley nowhere to hide. She became the first Irish performer to win Best Actress." },
    { t: "There Will Be Blood", d: "Paul Thomas Anderson · 2007", w: "Daniel Day-Lewis builds a voice from old recordings of John Huston and then spends two hours slowly letting the man behind it rot." },
    { t: "The Master", d: "Paul Thomas Anderson · 2012", w: "The processing scene: two actors, one table, no blinking. Most of the acting is happening in the pauses." },
    { t: "Marriage Story", d: "Noah Baumbach · 2019", w: "One apartment, one argument, and a camera that stays put while two people say the unforgivable thing." },
    { t: "Anatomy of a Fall", d: "Justine Triet · 2023", w: "Sandra Hüller defends herself in a second language, and the strain of arguing in French is written into the performance." },
    { t: "Manchester by the Sea", d: "Kenneth Lonergan · 2016", w: "A performance built entirely on refusal — the film's most famous scene is a man failing to finish a sentence." },
    { t: "Uncut Gems", d: "Safdie Brothers · 2019", w: "Adam Sandler inside overlapping dialogue that never lets him finish a thought. It plays as anxiety rather than acting." },
    { t: "Portrait of a Lady on Fire", d: "Céline Sciamma · 2019", w: "A film about being looked at, performed almost entirely through looking. The final shot runs long enough to become unbearable." },
    { t: "Aftersun", d: "Charlotte Wells · 2022", w: "Paul Mescal plays a man performing fine for his daughter, and the film only lets you see the gap in reflections and camcorder footage." }
  ],
  direction: [
    { t: "Children of Men", d: "Alfonso Cuarón · 2006", w: "Long takes that put you in the car and refuse to cut away — the ambush sequence runs unbroken while the world falls apart around it." },
    { t: "1917", d: "Sam Mendes · 2019", w: "Built to look like one continuous shot, which forces the geography of the trench to be real and the running to be earned." },
    { t: "Russian Ark", d: "Aleksandr Sokurov · 2002", w: "Ninety-six minutes, one take, three hundred years of Russian history and two thousand extras. No second chances." },
    { t: "Boyhood", d: "Richard Linklater · 2014", w: "Shot in short bursts over twelve years with the same cast, so the ageing is real and the plot is mostly weather." },
    { t: "Parasite", d: "Bong Joon-ho · 2019", w: "Staircases as argument — every move between the two families is staged as going up or going down." },
    { t: "Mad Max: Fury Road", d: "George Miller · 2015", w: "Miller centre-framed the action so your eye never has to hunt, which is why two hours of chaos stays legible." },
    { t: "Drive My Car", d: "Ryusuke Hamaguchi · 2021", w: "Rehearsal as method: the actors read flat and toneless for weeks inside the film, and the feeling arrives only when the staging is right." },
    { t: "Jeanne Dielman", d: "Chantal Akerman · 1975", w: "Fixed camera, real time, three days of housework. The duration is the argument, and the smallest deviation lands like a gunshot." },
    { t: "Birdman", d: "Alejandro G. Iñárritu · 2014", w: "Stitched into an apparent single take so the theatre never releases its hold on anyone in it." }
  ],
  twist: [
    { t: "Memento", d: "Christopher Nolan · 2000", w: "Told backwards, so the audience forgets what the hero just did exactly as he does." },
    { t: "The Sixth Sense", d: "M. Night Shyamalan · 1999", w: "One reveal that rewrites every scene before it — and a colour scheme that has been telling you the whole time." },
    { t: "The Usual Suspects", d: "Bryan Singer · 1995", w: "An unreliable narrator hiding in the most obvious possible place, reading the room off a noticeboard." },
    { t: "Oldboy", d: "Park Chan-wook · 2003", w: "A revenge story that eventually turns the revenge back on the avenger, and makes the ending worse than the imprisonment." },
    { t: "Gone Girl", d: "David Fincher · 2014", w: "The narrator you trust most turns out to be the twist, delivered mid-film in a voice-over that resets the genre." },
    { t: "Knives Out", d: "Rian Johnson · 2019", w: "Shows you the how in the first act, then spends the rest complicating the why." },
    { t: "Shutter Island", d: "Martin Scorsese · 2010", w: "A detective story in which the detective is the mystery — the continuity errors are deliberate." },
    { t: "Fight Club", d: "David Fincher · 1999", w: "A narrator lying to the audience and to himself in equal measure, with the answer spliced into single frames." },
    { t: "Coherence", d: "James Ward Byrkit · 2013", w: "A dinner party that splinters into parallel versions of itself, shot in one house with a largely improvised cast." }
  ]
};

async function resolveCraftItem(item: { t: string; d: string; w: string }): Promise<CraftMovieItem> {
  const cleanKey = item.t.toLowerCase().trim();
  let movieId: number | null = DIRECT_TMDB_MAP[cleanKey] || null;
  let posterPath: string | null = null;
  let voteAverage: number | null = null;

  try {
    if (movieId) {
      const detail = await getMovieDetail(movieId);
      posterPath = detail.poster_path;
      voteAverage = detail.vote_average;
    } else {
      const searchRes = await searchMovies(item.t);
      if (searchRes.results && searchRes.results.length > 0) {
        const topHit = searchRes.results[0];
        movieId = topHit.id;
        posterPath = topHit.poster_path;
        voteAverage = topHit.vote_average;
      }
    }
  } catch (err) {
    console.warn(`TMDB resolve warning for craft item "${item.t}":`, err);
  }

  return {
    ...item,
    movieId,
    posterPath,
    voteAverage,
  };
}

export default async function CinemaByExperiencePage() {
  const categories: CraftCategory[] = await Promise.all(
    CRAFT_CATEGORIES_RAW.map(async (cat) => {
      const itemsRaw = CRAFT_DATA_RAW[cat.id] || [];
      const items = await Promise.all(itemsRaw.map((item) => resolveCraftItem(item)));
      return {
        id: cat.id,
        label: cat.label,
        meta: CRAFT_META_RAW[cat.id] || { title: cat.label, sub: "", look: "" },
        items,
      };
    })
  );

  return <CinemaByExperienceClient categories={categories} />;
}
