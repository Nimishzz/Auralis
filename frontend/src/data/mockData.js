// Mock data for MoodDeck (playlists per mood) and RetroMSG (contacts/messages/stories).
// Structured so real APIs (Spotify Web API, messaging backend) can drop-in later.

export const MOODS = [
  { id: "happy",    label: "Happy",      emoji: "😊" },
  { id: "chill",    label: "Chill",      emoji: "😌" },
  { id: "study",    label: "Study",      emoji: "📚" },
  { id: "rainy",    label: "Rainy",      emoji: "🌧" },
  { id: "drive",    label: "Drive",      emoji: "🚗" },
  { id: "latenight",label: "Late Night", emoji: "🌙" },
  { id: "romantic", label: "Romantic",   emoji: "❤️" },
  { id: "party",    label: "Party",      emoji: "🎉" },
  { id: "workout",  label: "Workout",    emoji: "💪" }
];

// Small helper — SoundHelix provides royalty-free demo audio
const AUDIO = (n) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

const COVER = {
  focus:   "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?w=400&q=80&auto=format",
  neon:    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80&auto=format",
  sunny:   "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80&auto=format",
  rain:    "https://images.unsplash.com/photo-1493314894560-5c412a56c17c?w=400&q=80&auto=format",
  road:    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80&auto=format",
  night:   "https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=400&q=80&auto=format",
  romance: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80&auto=format",
  party:   "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80&auto=format",
  gym:     "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80&auto=format",
  default: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80&auto=format"
};

// Playlists keyed by mood id. Each contains meta + tracks.
export const PLAYLISTS_BY_MOOD = {
  happy: {
    name: "Sunshine Radio",
    artist: "Spotify",
    cover: COVER.sunny,
    tracks: [
      { title: "Golden Hour",      artist: "Aurora Beats", album: "Sunlit", duration: 214, audio: AUDIO(1), cover: COVER.sunny },
      { title: "Smile Machine",    artist: "Kite Flyers",  album: "Bright",  duration: 198, audio: AUDIO(2), cover: COVER.sunny },
      { title: "Skip Along",       artist: "Peach Fuzz",   album: "Warm",    duration: 232, audio: AUDIO(3), cover: COVER.sunny }
    ]
  },
  chill: {
    name: "Lo-Fi Chill",
    artist: "Spotify",
    cover: COVER.neon,
    tracks: [
      { title: "Slow Motion",      artist: "Nova Haze",    album: "Drift",   duration: 245, audio: AUDIO(4), cover: COVER.neon },
      { title: "Breeze",           artist: "Mint Radio",   album: "Coast",   duration: 267, audio: AUDIO(5), cover: COVER.neon },
      { title: "Softlight",        artist: "Aura",         album: "Fade",    duration: 210, audio: AUDIO(6), cover: COVER.neon }
    ]
  },
  study: {
    name: "Deep Focus",
    artist: "Spotify",
    cover: COVER.focus,
    tracks: [
      { title: "Analog Study",     artist: "Blue Ink",     album: "Chapter", duration: 289, audio: AUDIO(7), cover: COVER.focus },
      { title: "Late Library",     artist: "Paper Radio",  album: "Silent",  duration: 314, audio: AUDIO(8), cover: COVER.focus },
      { title: "Pens Down",        artist: "Chalkline",    album: "Notes",   duration: 260, audio: AUDIO(9), cover: COVER.focus }
    ]
  },
  rainy: {
    name: "Rainy Windows",
    artist: "Spotify",
    cover: COVER.rain,
    tracks: [
      { title: "Petrichor",        artist: "Cloud Nine",   album: "Storm",   duration: 233, audio: AUDIO(10), cover: COVER.rain },
      { title: "Umbrella Blues",   artist: "Grey Sky",     album: "Wet",     duration: 275, audio: AUDIO(11), cover: COVER.rain },
      { title: "Drizzle",          artist: "Riverbed",     album: "Rain",    duration: 199, audio: AUDIO(12), cover: COVER.rain }
    ]
  },
  drive: {
    name: "Open Highway",
    artist: "Spotify",
    cover: COVER.road,
    tracks: [
      { title: "Route 66",         artist: "Chrome Kids",  album: "Miles",   duration: 245, audio: AUDIO(13), cover: COVER.road },
      { title: "Freeway Dreams",   artist: "Neon Ride",    album: "Cruise",  duration: 288, audio: AUDIO(14), cover: COVER.road },
      { title: "Rear-View",        artist: "Wheelspin",    album: "Asphalt", duration: 220, audio: AUDIO(15), cover: COVER.road }
    ]
  },
  latenight: {
    name: "3AM Thoughts",
    artist: "Spotify",
    cover: COVER.night,
    tracks: [
      { title: "Neon Streets",     artist: "Mono Blue",    album: "Awake",   duration: 275, audio: AUDIO(16), cover: COVER.night },
      { title: "City Never Sleeps",artist: "Skyline",      album: "After",   duration: 302, audio: AUDIO(1),  cover: COVER.night },
      { title: "Moonlight FM",     artist: "Hush",         album: "Late",    duration: 244, audio: AUDIO(2),  cover: COVER.night }
    ]
  },
  romantic: {
    name: "Slow Dance",
    artist: "Spotify",
    cover: COVER.romance,
    tracks: [
      { title: "Two of Us",        artist: "Velvet Room",  album: "Soft",    duration: 233, audio: AUDIO(3),  cover: COVER.romance },
      { title: "First Look",       artist: "Rose Static",  album: "Bloom",   duration: 214, audio: AUDIO(4),  cover: COVER.romance },
      { title: "Candlelight",      artist: "Amber",        album: "Warm",    duration: 260, audio: AUDIO(5),  cover: COVER.romance }
    ]
  },
  party: {
    name: "Big Night Out",
    artist: "Spotify",
    cover: COVER.party,
    tracks: [
      { title: "Confetti",         artist: "Party Boys",   album: "Loud",    duration: 210, audio: AUDIO(6),  cover: COVER.party },
      { title: "Bass Kick",        artist: "Nine Volt",    album: "Rave",    duration: 244, audio: AUDIO(7),  cover: COVER.party },
      { title: "Neon Floor",       artist: "Discotech",    album: "Move",    duration: 232, audio: AUDIO(8),  cover: COVER.party }
    ]
  },
  workout: {
    name: "Beast Mode",
    artist: "Spotify",
    cover: COVER.gym,
    tracks: [
      { title: "Iron Pulse",       artist: "Reps",         album: "Grind",   duration: 220, audio: AUDIO(9),  cover: COVER.gym },
      { title: "Heart Rate",       artist: "Cardio Club",  album: "Sweat",   duration: 245, audio: AUDIO(10), cover: COVER.gym },
      { title: "Last Set",         artist: "Barbell",      album: "Push",    duration: 267, audio: AUDIO(11), cover: COVER.gym }
    ]
  }
};

// Default track shown before the user selects anything.
export const DEFAULT_TRACK = {
  title: "Welcome to MoodDeck",
  artist: "RetroDesk Radio",
  album: "Session 01",
  duration: 220,
  audio: AUDIO(1),
  cover: COVER.default
};

// ================= RETROMSG =================

const AVATAR = (seed) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b0d4ff,c0aede,d1d4f9,ffd5dc,ffdfbf`;

export const CURRENT_USER = {
  id: "me",
  name: "PixelBunny_92",
  status: "Online",
  avatar: AVATAR("me92"),
  mood: "🌸 vibing in Y2K"
};

export const STORIES = [
  { id: "s0", name: "Your story", avatar: AVATAR("me92"), viewed: false, isMe: true },
  { id: "s1", name: "Luna",       avatar: AVATAR("luna"),    viewed: false },
  { id: "s2", name: "Kenji",      avatar: AVATAR("kenji"),   viewed: false },
  { id: "s3", name: "Mia",        avatar: AVATAR("mia"),     viewed: true  },
  { id: "s4", name: "Devon",      avatar: AVATAR("devon"),   viewed: false },
  { id: "s5", name: "Aiko",       avatar: AVATAR("aiko"),    viewed: true  },
  { id: "s6", name: "Jules",      avatar: AVATAR("jules"),   viewed: false },
  { id: "s7", name: "Nikko",      avatar: AVATAR("nikko"),   viewed: false }
];

export const CONTACTS = [
  { id: "c1", name: "Luna ✨",       avatar: AVATAR("luna"),  online: true,  lastMsg: "did u see the new update?" },
  { id: "c2", name: "Kenji",         avatar: AVATAR("kenji"), online: true,  lastMsg: "brb dinner" },
  { id: "c3", name: "Mia 🍓",        avatar: AVATAR("mia"),   online: false, lastMsg: "sent a photo" },
  { id: "c4", name: "Devon",         avatar: AVATAR("devon"), online: true,  lastMsg: "🎵 voice message" },
  { id: "c5", name: "Aiko",          avatar: AVATAR("aiko"),  online: false, lastMsg: "cya tmrw!" },
  { id: "c6", name: "Jules",         avatar: AVATAR("jules"), online: true,  lastMsg: "typing…" },
  { id: "c7", name: "Nikko",         avatar: AVATAR("nikko"), online: false, lastMsg: "lol ok" }
];

// message.kind: text | image | voice
export const CONVERSATIONS = {
  c1: [
    { id: "m1", from: "c1", kind: "text", text: "yooo you online??", time: "10:22 PM" },
    { id: "m2", from: "me", kind: "text", text: "yeahh just installing RetroDesk 👾", time: "10:23 PM" },
    { id: "m3", from: "c1", kind: "text", text: "OMG its so cute", time: "10:23 PM" },
    { id: "m4", from: "c1", kind: "image", text: "sunset today", time: "10:24 PM" },
    { id: "m5", from: "me", kind: "text", text: "GORGEOUS 😭", time: "10:25 PM" },
    { id: "m6", from: "c1", kind: "text", text: "did u see the new update?", time: "10:26 PM" }
  ],
  c2: [
    { id: "m1", from: "c2", kind: "text", text: "we still on for tomorrow?", time: "9:04 PM" },
    { id: "m2", from: "me", kind: "text", text: "yes! 7pm right?", time: "9:05 PM" },
    { id: "m3", from: "c2", kind: "text", text: "perfect", time: "9:05 PM" },
    { id: "m4", from: "c2", kind: "text", text: "brb dinner", time: "9:06 PM" }
  ],
  c3: [
    { id: "m1", from: "me", kind: "text", text: "how was the show?", time: "8:11 PM" },
    { id: "m2", from: "c3", kind: "voice", duration: "0:24", time: "8:15 PM" },
    { id: "m3", from: "c3", kind: "image", text: "photo dump", time: "8:16 PM" },
    { id: "m4", from: "c3", kind: "image", text: "photo dump 2", time: "8:16 PM" }
  ],
  c4: [
    { id: "m1", from: "c4", kind: "text", text: "yo check this", time: "7:00 PM" },
    { id: "m2", from: "c4", kind: "voice", duration: "0:12", time: "7:00 PM" },
    { id: "m3", from: "me", kind: "text", text: "LMAO", time: "7:02 PM" }
  ],
  c5: [
    { id: "m1", from: "c5", kind: "text", text: "cya tmrw!", time: "6:45 PM" }
  ],
  c6: [
    { id: "m1", from: "c6", kind: "text", text: "did u finish the assignment", time: "5:11 PM" },
    { id: "m2", from: "me", kind: "text", text: "ugh no 😩", time: "5:12 PM" }
  ],
  c7: [
    { id: "m1", from: "c7", kind: "text", text: "lol ok", time: "4:30 PM" }
  ]
};
