import FestivalSeasonClient, { AwardBodyData, FestivalRowData } from "./FestivalSeasonClient";
import { searchMovies, getMovieDetail } from "@/lib/tmdb/client";
import { getFestivals } from "@/services/adminService";

export const revalidate = 86400; // Cache for 24h

// Direct TMDB ID mapping for high precision & speed
const DIRECT_TMDB_MAP: Record<string, number> = {
  "anora": 1064213,
  "oppenheimer": 872585,
  "everything everywhere all at once": 545611,
  "coda": 600354,
  "nomadland": 581734,
  "parasite": 496243,
  "green book": 490132,
  "the shape of water": 399055,
  "moonlight": 376867,
  "anatomy of a fall": 915935,
  "triangle of sadness": 497828,
  "titane": 630240,
  "shoplifters": 502033,
  "the square": 395990,
  "the room next door": 1088514,
  "poor things": 792307,
  "all the beauty and the bloodshed": 984521,
  "happening": 760161,
  "joker": 475557,
  "roma": 426426,
  "dahomey": 1221151,
  "on the adamant": 1076295,
  "alcarràs": 885671,
  "bad luck banging or loony porn": 775983,
  "there is no evil": 660994,
  "synonyms": 554371,
  "touch me not": 494553,
  "on body and soul": 432616,
  "conclave": 1043905,
  "all quiet on the western front": 49046,
  "the power of the dog": 600583,
  "1917": 530915,
  "three billboards outside ebbing, missouri": 359940,
  "la la land": 313369,
  "the brutalist": 1000837,
  "the fabelmans": 804095,
  "bohemian rhapsody": 424694,
};

const AWARDS_RAW = [
  {
    id: "oscars",
    tab: "Academy Awards",
    prize: "Best Picture",
    body: "Academy of Motion Picture Arts and Sciences",
    city: "Los Angeles",
    since: "Since 1929",
    blurb: "The industry judging itself — roughly ten thousand members, one ranked-choice ballot, and a result that decides how a film is remembered commercially.",
    rows: [
      ["2026", "One Battle After Another", "Paul Thomas Anderson · USA", "A multi-generational comedy of political resistance that took six awards, including Anderson’s first after three decades of nominations."],
      ["2025", "Anora", "Sean Baker · USA", "A Brooklyn screwball that turns cruel — the rare film to take both the Palme d’Or and Best Picture in the same cycle."],
      ["2024", "Oppenheimer", "Christopher Nolan · USA/UK", "Three hours of rooms and conversations, and still the year’s biggest picture. Proof a blockbuster can be talk."],
      ["2023", "Everything Everywhere All at Once", "Daniels · USA", "Absurdist multiverse chaos anchored by a mother and daughter who can’t say what they mean. The strangest Best Picture in decades."],
      ["2022", "CODA", "Siân Heder · USA", "A small family drama and the first streaming release to take the top prize — a structural shift disguised as a feel-good win."],
      ["2021", "Nomadland", "Chloé Zhao · USA", "Non-actors playing versions of themselves on the road through the American West. Grief filmed as landscape."],
      ["2020", "Parasite", "Bong Joon-ho · South Korea", "The first non-English-language Best Picture winner, and a class satire that changes genre roughly every twenty minutes."],
      ["2019", "Green Book", "Peter Farrelly · USA", "A contested win that became shorthand for the Academy’s comfort with tidy racial reconciliation — worth watching as a document of its moment."],
      ["2018", "The Shape of Water", "Guillermo del Toro · USA", "A creature feature played entirely straight as a romance, and the rare monster movie the Academy let win."],
      ["2017", "Moonlight", "Barry Jenkins · USA", "Three chapters of one life, told in close-ups and silences. Also the envelope mix-up nobody has stopped talking about."]
    ]
  },
  {
    id: "cannes",
    tab: "Cannes",
    prize: "Palme d’Or",
    body: "Festival de Cannes",
    city: "Cannes",
    since: "Since 1955",
    blurb: "A nine-person jury, around twenty films, one prize. Cannes is where distributors decide the arthouse calendar for the year that follows.",
    rows: [
      ["2026", "Fjord", "Cristian Mungiu · Romania", "A Romanian family relocating to a Norwegian village falls under suspicion from child services. Mungiu’s second Palme, nineteen years after his first."],
      ["2025", "It Was Just an Accident", "Jafar Panahi · Iran", "A revenge thriller made by a director long banned from making films — moral argument disguised as a road movie."],
      ["2024", "Anora", "Sean Baker · USA", "Farce that curdles into something tender. The Palme that went on to sweep the Oscars."],
      ["2023", "Anatomy of a Fall", "Justine Triet · France", "A death, a marriage read aloud in court, and no clean answer. The trial is really an autopsy of a relationship."],
      ["2022", "Triangle of Sadness", "Ruben Östlund · Sweden", "Wealth aboard a superyacht, then wealth with nothing to buy. Östlund’s second Palme in five years."],
      ["2021", "Titane", "Julia Ducournau · France", "Body horror about family, and only the second Palme awarded to a woman."],
      ["2020", "Festival cancelled", "—", "No Palme d’Or was awarded. Fifty-six titles carried the official selection label instead — the first year without a prize since 1968."],
      ["2019", "Parasite", "Bong Joon-ho · South Korea", "The unanimous jury vote that started its run to the Oscars nine months later."],
      ["2018", "Shoplifters", "Hirokazu Kore-eda · Japan", "A family assembled out of need rather than blood, and the question of whether that counts."],
      ["2017", "The Square", "Ruben Östlund · Sweden", "Art-world satire at its most uncomfortable — including a dinner-party sequence people still argue about."]
    ]
  },
  {
    id: "venice",
    tab: "Venice",
    prize: "Golden Lion",
    body: "Venice International Film Festival",
    city: "Venice Lido",
    since: "Since 1949",
    blurb: "The oldest film festival in the world, and now the launchpad for awards season — a Lion in September often means a nomination in January.",
    rows: [
      ["2026", "Woman Unknown", "May el-Toukhy · Denmark", "A post-war drama that took both the Lion and Best Actress; el-Toukhy was the only woman in main competition this year."],
      ["2025", "Father Mother Sister Brother", "Jim Jarmusch · USA", "Three quiet chapters about adult children visiting their parents. Deadpan, and then suddenly not."],
      ["2024", "The Room Next Door", "Pedro Almodóvar · Spain", "Almodóvar’s first English-language feature: two friends, one decision about how to die."],
      ["2023", "Poor Things", "Yorgos Lanthimos · Ireland/UK", "A Frankenstein story told from the creature’s side, as a comedy about learning appetite."],
      ["2022", "All the Beauty and the Bloodshed", "Laura Poitras · USA", "Nan Goldin’s photography and her campaign against the Sackler family, braided into one argument."],
      ["2021", "Happening", "Audrey Diwan · France", "1963 France, an illegal abortion, and a countdown structure that refuses to look away."],
      ["2020", "Nomadland", "Chloé Zhao · USA", "Won the Lion in a socially distanced edition, then went on to Best Picture."],
      ["2019", "Joker", "Todd Phillips · USA", "A character study wearing a comic-book costume — and the argument about it hasn’t settled yet."],
      ["2018", "Roma", "Alfonso Cuarón · Mexico", "A domestic worker’s year in Mexico City, shot in black and white with the patience of memory."],
      ["2017", "The Shape of Water", "Guillermo del Toro · USA", "Venice first, then the Oscars — the fairy tale that made the whole run."]
    ]
  },
  {
    id: "berlin",
    tab: "Berlinale",
    prize: "Golden Bear",
    body: "Berlin International Film Festival",
    city: "Berlin",
    since: "Since 1951",
    blurb: "The most politically minded of the big three. Berlin rewards films that argue with the present, and its jury tends to look outside the industry’s centre of gravity.",
    rows: [
      ["2026", "Yellow Letters", "İlker Çatak · Germany", "Two Turkish theatre artists lose their work to state persecution. The first German Golden Bear in twenty-two years."],
      ["2025", "Dreams", "Dag Johan Haugerud · Norway", "A teenager writes down a first infatuation; her mother and grandmother read it. Three perspectives, one text."],
      ["2024", "Dahomey", "Mati Diop · France/Senegal", "Twenty-six looted artefacts return to Benin, and the film lets the objects narrate."],
      ["2023", "On the Adamant", "Nicolas Philibert · France", "A day-care centre for psychiatric patients on a barge in the Seine, filmed with unusual patience."],
      ["2022", "Alcarràs", "Carla Simón · Spain", "A Catalan peach-farming family’s last harvest before the solar panels arrive."],
      ["2021", "Bad Luck Banging or Loony Porn", "Radu Jude · Romania", "A teacher’s private video leaks and the town convenes a tribunal. Furious, formally strange."],
      ["2020", "There Is No Evil", "Mohammad Rasoulof · Iran", "Four stories about the men asked to carry out executions, made in defiance of a filmmaking ban."],
      ["2019", "Synonyms", "Nadav Lapid · Israel/France", "An Israeli in Paris tries to shed his own language. Identity as something you attempt to leave behind."],
      ["2018", "Touch Me Not", "Adina Pintilie · Romania", "Documentary and fiction collapsed together in an examination of intimacy and the body."],
      ["2017", "On Body and Soul", "Ildikó Enyedi · Hungary", "Two slaughterhouse workers discover they share the same dream every night."]
    ]
  },
  {
    id: "bafta",
    tab: "BAFTA",
    prize: "Best Film",
    body: "British Academy of Film and Television Arts",
    city: "London",
    since: "Since 1948",
    blurb: "The awards season bellwether. BAFTA votes weeks before the Academy, and the overlap is close enough that the result is read as a forecast.",
    rows: [
      ["2026", "One Battle After Another", "Paul Thomas Anderson · USA", "Six BAFTAs from fourteen nominations, and confirmation of the Oscar result a month later."],
      ["2025", "Conclave", "Edward Berger · UK/USA", "A papal election as procedural thriller — all whispers, ballots and corridors."],
      ["2024", "Oppenheimer", "Christopher Nolan · USA/UK", "Seven wins in London ahead of the same result in Los Angeles."],
      ["2023", "All Quiet on the Western Front", "Edward Berger · Germany", "Seven BAFTAs for a German-language war film — an unusually decisive result for a non-English title."],
      ["2022", "The Power of the Dog", "Jane Campion · New Zealand", "A western about masculinity that withholds its violence until the very last move."],
      ["2021", "Nomadland", "Chloé Zhao · USA", "Four wins in a ceremony held without an audience."],
      ["2020", "1917", "Sam Mendes · UK", "Two soldiers, one apparent continuous take, and a sprint across the Western Front."],
      ["2019", "Roma", "Alfonso Cuarón · Mexico", "BAFTA gave it Best Film where the Academy stopped short — the year’s most telling split."],
      ["2018", "Three Billboards Outside Ebbing, Missouri", "Martin McDonagh · UK/USA", "Grief turned into a public campaign, with no interest in making anyone likeable."],
      ["2017", "La La Land", "Damien Chazelle · USA", "A musical about the cost of ambition, and BAFTA’s clearest endorsement of the year’s frontrunner."]
    ]
  },
  {
    id: "globes",
    tab: "Golden Globes",
    prize: "Best Motion Picture — Drama",
    body: "Golden Globe Awards",
    city: "Beverly Hills",
    since: "Since 1944",
    blurb: "The first major result of the season, and the one that separates drama from comedy — which makes it the best single read on how a year’s serious films landed.",
    rows: [
      ["2026", "Hamnet", "Chloé Zhao · UK/USA", "Shakespeare’s household after the death of a son. It won Drama on a night otherwise dominated by One Battle After Another."],
      ["2025", "The Brutalist", "Brady Corbet · USA", "An architect rebuilding a life in postwar America, shot on VistaVision with an intermission."],
      ["2024", "Oppenheimer", "Christopher Nolan · USA/UK", "Five Globes, and the start of a sweep that never really faltered."],
      ["2023", "The Fabelmans", "Steven Spielberg · USA", "Spielberg on his own family, and on discovering what a camera can conceal."],
      ["2022", "The Power of the Dog", "Jane Campion · New Zealand", "Campion’s return after twelve years away, and the year’s most argued-over ending."],
      ["2021", "Nomadland", "Chloé Zhao · USA", "The first of the season’s wins, awarded remotely in a year without a room."],
      ["2020", "1917", "Sam Mendes · UK", "An upset over the presumed frontrunners, and the moment the race reopened."],
      ["2019", "Bohemian Rhapsody", "Bryan Singer · UK/USA", "A crowd-pleasing biopic whose win over more austere competition still reads as a surprise."],
      ["2018", "Three Billboards Outside Ebbing, Missouri", "Martin McDonagh · UK/USA", "Four Globes, including both lead and supporting acting prizes."],
      ["2017", "Moonlight", "Barry Jenkins · USA", "Its only Globe that night, and the one that mattered."]
    ]
  }
];

async function resolveRow(row: string[]): Promise<FestivalRowData> {
  const [year, title, meta, note] = row;
  const isGap = meta === "—";
  if (isGap) {
    return { year, title, meta, note, isGap: true };
  }

  const cleanKey = title.toLowerCase().trim();
  let movieId: number | null = DIRECT_TMDB_MAP[cleanKey] || null;
  let posterPath: string | null = null;
  let voteAverage: number | null = null;

  try {
    if (movieId) {
      const detail = await getMovieDetail(movieId);
      posterPath = detail.poster_path;
      voteAverage = detail.vote_average;
    } else {
      const searchRes = await searchMovies(title);
      if (searchRes.results && searchRes.results.length > 0) {
        const topHit = searchRes.results[0];
        movieId = topHit.id;
        posterPath = topHit.poster_path;
        voteAverage = topHit.vote_average;
      }
    }
  } catch (err) {
    console.warn(`TMDB resolve warning for festival title "${title}":`, err);
  }

  return {
    year,
    title,
    meta,
    note,
    isGap: false,
    movieId,
    posterPath,
    voteAverage,
  };
}

export default async function FestivalSeasonPage() {
  const awards: AwardBodyData[] = await Promise.all(
    AWARDS_RAW.map(async (award) => {
      const rows = await Promise.all(award.rows.map((r) => resolveRow(r)));
      return {
        ...award,
        rows,
      };
    })
  );

  return <FestivalSeasonClient awards={awards} />;
}
