export const QUOTE_CATEGORIES = {
  henley:      { label: 'Henley',      color: '#FDB931' },
  performance: { label: 'Performance', color: '#FF6B35' },
  mindset:     { label: 'Mindset',     color: '#45B7D1' },
  nutrition:   { label: 'Fuel',        color: '#7EC8E3' },
  grit:        { label: 'Grit',        color: '#FF6B9D' },
}

export const QUOTES = [
  // Henley
  { text: "The medals at Henley are made in December.", author: "Unknown Boat Club", category: "henley" },
  { text: "Every meter logged in winter is a medal forged for Henley.", author: "British Rowing", category: "henley" },
  { text: "Henley doesn't reward talent. It rewards the ones who trained when nobody was watching.", author: "Anonymous Coach", category: "henley" },
  { text: "The Henley course is unforgiving. So must be your preparation.", author: "Steve Redgrave", category: "henley" },
  { text: "Champions at Henley are already training while others are still planning to start.", author: "Leander Club", category: "henley" },
  { text: "Temple Island sees all. Every split, every sacrifice, every session.", author: "Unknown", category: "henley" },
  { text: "The enclosure at Henley belongs to those who earned it at 5am in January.", author: "Anonymous", category: "henley" },
  { text: "Rowing is the sport of Henley, and Henley is the sport's cathedral. Earn your pew.", author: "Peter Coni CBE", category: "henley" },
  { text: "One more split. One more stroke. That's how Henley champions are built — one piece at a time.", author: "National Rowing Foundation", category: "henley" },

  // Performance
  { text: "The erg doesn't lie. It is the most honest judge on earth.", author: "Concept2", category: "performance" },
  { text: "Your 2k score is a reflection of every session you have ever done.", author: "Unknown Coach", category: "performance" },
  { text: "Pain is temporary. Your 2k score is on the board forever.", author: "World Rowing", category: "performance" },
  { text: "Train in zones. Race with purpose.", author: "British Rowing Performance", category: "performance" },
  { text: "Most rowers finish their 2k in the last 500 metres. Winning rowers start there.", author: "Jurgen Grobler", category: "performance" },
  { text: "Watts don't lie. Effort doesn't lie. The erg is the great equaliser.", author: "Unknown", category: "performance" },
  { text: "You can't fake fitness on the water. You can't fake it on the erg. You can only earn it.", author: "Unknown", category: "performance" },
  { text: "Chase the watts, not the numbers. The splits will follow.", author: "British Rowing", category: "performance" },
  { text: "Perfect technique under fatigue. That's what separates good from great.", author: "Marlow RC", category: "performance" },
  { text: "Four strokes per second for 2000 metres. Every one of them matters.", author: "Unknown", category: "performance" },
  { text: "Your threshold is not your ceiling. It's your floor for next season.", author: "Anonymous Coach", category: "performance" },

  // Mindset
  { text: "The hardest stroke is always the next one. Take it anyway.", author: "Unknown", category: "mindset" },
  { text: "A champion is someone who gets up one more time than they fall.", author: "Jack Dempsey", category: "mindset" },
  { text: "The body achieves what the mind believes.", author: "Napoleon Hill", category: "mindset" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier", category: "mindset" },
  { text: "Don't count the days. Make the days count.", author: "Muhammad Ali", category: "mindset" },
  { text: "Champions keep playing until they get it right.", author: "Billie Jean King", category: "mindset" },
  { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson", category: "mindset" },
  { text: "Hard days are the best because they make you stronger.", author: "Gabrielle Douglas", category: "mindset" },
  { text: "It never gets easier. You just get stronger.", author: "Unknown", category: "mindset" },
  { text: "Your limitation is only your imagination.", author: "Unknown", category: "mindset" },
  { text: "Great things never came from comfort zones.", author: "Neil Strauss", category: "mindset" },
  { text: "Suffer the pain of discipline, or suffer the pain of regret. Your choice.", author: "Jim Rohn", category: "mindset" },
  { text: "You are one workout away from a better mood.", author: "Unknown", category: "mindset" },
  { text: "One stroke at a time. One split at a time. One race at a time.", author: "Kelly Holmes", category: "mindset" },

  // Nutrition / Fuel
  { text: "You cannot out-train a bad diet. Fuel your machine like the high-performance engine it is.", author: "Matthew Pinsent", category: "nutrition" },
  { text: "Food is not a reward. It's the fuel that powers every split.", author: "British Rowing Nutritionist", category: "nutrition" },
  { text: "Protein is the bricklayer. Carbohydrates are the crane operator. Both build champions.", author: "Unknown", category: "nutrition" },
  { text: "Hydration is not optional. Your brain and your muscles both row in the same body.", author: "Rowing Performance Lab", category: "nutrition" },
  { text: "Eat to perform, not to punish.", author: "Unknown Sports Nutritionist", category: "nutrition" },
  { text: "Recover like a professional. Sleep, eat, repeat.", author: "Dave Brailsford", category: "nutrition" },
  { text: "What you eat in private shows in public performance.", author: "Unknown", category: "nutrition" },
  { text: "Marginal gains in nutrition compound like interest.", author: "British Cycling", category: "nutrition" },

  // Grit
  { text: "Rowing is 90% mental and the other half is physical.", author: "Anonymous", category: "grit" },
  { text: "The hardest part is showing up. Everything after that is just effort.", author: "Unknown", category: "grit" },
  { text: "When your legs scream stop and your lungs are on fire, that's when champions are separated from the rest.", author: "Unknown Coach", category: "grit" },
  { text: "Training in rain, training in dark, training alone — this is what builds grit.", author: "Sir Steve Redgrave", category: "grit" },
  { text: "Nobody ever drowned in sweat.", author: "Lou Holtz", category: "grit" },
  { text: "The race doesn't wait for you to feel ready.", author: "Unknown", category: "grit" },
  { text: "Embrace the grind. The erg doesn't care how you feel today.", author: "Unknown", category: "grit" },
  { text: "Every sunrise is a chance to improve yesterday's worst piece.", author: "Unknown", category: "grit" },
  { text: "Be the person who does it when it's hard.", author: "Unknown", category: "grit" },
]

export function getDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return QUOTES[dayOfYear % QUOTES.length]
}

export function getQuoteByCategory(category) {
  const filtered = QUOTES.filter(q => q.category === category)
  return filtered[Math.floor(Math.random() * filtered.length)]
}

export const DAILY_AFFIRMATIONS = [
  "I am stronger than I was yesterday.",
  "Every stroke I take today brings me closer to Henley.",
  "My body is capable of more than I think.",
  "I train with purpose. I race with confidence.",
  "I fuel my body like the champion I am becoming.",
  "Consistency is my superpower.",
  "I embrace the hard sessions — they make me elite.",
  "I trust my training. I trust the process.",
  "Today's effort is tomorrow's baseline.",
  "I am building something extraordinary, one session at a time.",
  "My competition is yesterday's version of me.",
  "I row with intention. I recover with discipline.",
  "Champions are made when no one is watching. I am always watching.",
  "Pain is temporary. Pride in the work lasts forever.",
]

export function getDailyAffirmation() {
  const day = new Date().getDate()
  return DAILY_AFFIRMATIONS[day % DAILY_AFFIRMATIONS.length]
}

export const TRAINING_TIPS = [
  { title: "2k Prep", tip: "Do your 2k test fresh — minimum 48h after your last hard session. Warm up with 10' easy + 3×20s race-pace strikes." },
  { title: "Zone 2 Base", tip: "80% of your holiday volume should be UT2/UT1. Boring? Yes. Essential? Absolutely. This is where VO2max is built." },
  { title: "Stroke Rate", tip: "For threshold work, target 22-24spm. Higher rate with same watts = poorer technique. Work smarter, not faster." },
  { title: "Recovery", tip: "Sleep 8–9 hours. HRV dropping for 3 straight days means reduce intensity by 20% — your body is telling you something." },
  { title: "Splits Strategy", tip: "Elite 2k: negative split (2nd 1k faster than 1st). In training, aim for even splits — deviation > 3s/500m means poor pacing." },
  { title: "Cross-training", tip: "Running and cycling protect your back while maintaining aerobic fitness. Two 30-45' easy runs per week accelerates erg gains." },
  { title: "Weight Room", tip: "Romanian deadlifts and hip flexor work directly translate to drive length. Strengthen these and your split improves mechanically." },
  { title: "Hydration", tip: "Dehydration of just 2% body weight drops power output by 6%. Drink 500ml 90 minutes before each session." },
  { title: "Breathing", tip: "Breathe on the recovery, not the drive. Establish a rhythmic pattern: exhale on the catch, inhale during recovery." },
  { title: "Mental Model", tip: "Break your 2k into four 500m pieces. Treat each as a separate race. Win each piece and you've won the 2k." },
]

export function getDailyTip() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return TRAINING_TIPS[dayOfYear % TRAINING_TIPS.length]
}
