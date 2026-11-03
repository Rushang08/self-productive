import type { HabitInput } from './types'
import { ALL_DAYS } from './schedule'

export interface TemplateHabit {
  /** Unique id; stored on the habit so we can show "Added". */
  id: string
  name: string
  icon: string
  color: string
  kind: 'check' | 'progress'
  target: number
  unit: string
  step: number
  /** One-line tip shown under the name. */
  note?: string
}

export interface TemplatePack {
  id: string
  title: string
  subtitle: string
  description: string
  icon: string
  color: string
  section: 'pregnancy' | 'popular'
  disclaimer?: string
  habits: TemplateHabit[]
}

const SAGE = '#5f8a6f'
const TERRA = '#c2674a'
const OCHRE = '#c79a3b'
const SLATE = '#5b7a99'
const PLUM = '#8a5a83'
const CLAY = '#a8745a'
const TEAL = '#3f8a8a'
const STONE = '#7d7468'

const check = (id: string, name: string, icon: string, color: string, note?: string): TemplateHabit => ({
  id, name, icon, color, kind: 'check', target: 1, unit: '', step: 1, note,
})
const goal = (
  id: string, name: string, icon: string, color: string,
  target: number, unit: string, step: number, note?: string,
): TemplateHabit => ({ id, name, icon, color, kind: 'progress', target, unit, step, note })

export const PREGNANCY_DISCLAIMER =
  'These are general wellness suggestions, not medical advice. Talk to your doctor or midwife before trying to conceive, especially about supplements and any medication.'

export const TEMPLATE_PACKS: TemplatePack[] = [
  {
    id: 'ttc-her',
    title: 'Pregnancy planning · Her',
    subtitle: 'Prepare your body and mind',
    description: 'Daily habits commonly recommended in the months before trying to conceive.',
    icon: 'flower',
    color: TERRA,
    section: 'pregnancy',
    disclaimer: PREGNANCY_DISCLAIMER,
    habits: [
      check('ttc-her.folic', 'Folic acid / prenatal vitamin', 'pill', TERRA, '400 mcg folic acid daily is commonly advised'),
      goal('ttc-her.water', 'Water', 'droplets', SLATE, 2.5, 'L', 0.25),
      check('ttc-her.sleep', 'Sleep 7–9 hours', 'moon', PLUM),
      goal('ttc-her.move', 'Gentle exercise', 'activity', SAGE, 30, 'min', 10, 'Walking, yoga or swimming'),
      goal('ttc-her.veg', 'Fruit and vegetables', 'salad', SAGE, 5, 'servings', 1),
      check('ttc-her.clean', 'No alcohol or smoking', 'nosmoke', STONE),
      check('ttc-her.caffeine', 'Caffeine under 200 mg', 'coffee', CLAY, 'About one to two small coffees'),
      goal('ttc-her.calm', 'Calm time', 'wind', TEAL, 10, 'min', 5, 'Breathing, meditation or stretching'),
      check('ttc-her.cycle', 'Log cycle and ovulation signs', 'calendar', TERRA),
    ],
  },
  {
    id: 'ttc-him',
    title: 'Pregnancy planning · Him',
    subtitle: 'Healthy habits for fertility',
    description: 'Lifestyle habits linked to sperm health and overall fitness.',
    icon: 'dumbbell',
    color: SLATE,
    section: 'pregnancy',
    disclaimer: PREGNANCY_DISCLAIMER,
    habits: [
      check('ttc-him.vitamin', 'Daily multivitamin', 'pill', OCHRE, 'Ask your doctor about zinc and folate'),
      goal('ttc-him.water', 'Water', 'droplets', SLATE, 2.5, 'L', 0.25),
      check('ttc-him.sleep', 'Sleep 7–9 hours', 'moon', PLUM),
      goal('ttc-him.move', 'Exercise', 'dumbbell', TERRA, 30, 'min', 10),
      goal('ttc-him.veg', 'Fruit, veg and nuts', 'salad', SAGE, 5, 'servings', 1),
      check('ttc-him.clean', 'Limit alcohol, no smoking', 'nosmoke', STONE),
      check('ttc-him.cool', 'Keep it cool', 'thermometer', TEAL, 'Skip hot tubs, saunas and laptops on your lap'),
      goal('ttc-him.calm', 'Calm time', 'wind', TEAL, 10, 'min', 5, 'Breathing, meditation or a walk'),
    ],
  },
  {
    id: 'ttc-both',
    title: 'Pregnancy planning · Together',
    subtitle: 'Shared habits for both of you',
    description: 'Small things you can do side by side to stay connected and on track.',
    icon: 'baby',
    color: PLUM,
    section: 'pregnancy',
    disclaimer: PREGNANCY_DISCLAIMER,
    habits: [
      check('ttc-both.checkin', 'Daily check-in together', 'handshake', PLUM, '10 minutes to talk, no phones'),
      goal('ttc-both.walk', 'Walk together', 'footprints', SAGE, 20, 'min', 5),
      check('ttc-both.cook', 'Cook a healthy meal together', 'utensils', OCHRE),
      check('ttc-both.fertile', 'Time together (fertile window)', 'heart', TERRA, 'Tick on the days that matter'),
      check('ttc-both.screens', 'Screen-free evening', 'phoneoff', STONE),
      check('ttc-both.fund', 'Add to the baby fund', 'wallet', TEAL),
    ],
  },
  {
    id: 'morning',
    title: 'Morning routine',
    subtitle: 'Start the day well',
    description: 'A simple routine that sets the tone for everything after it.',
    icon: 'sun',
    color: OCHRE,
    section: 'popular',
    habits: [
      check('morning.wake', 'Wake up early', 'alarm', PLUM),
      check('morning.water', 'Water on waking', 'droplets', SLATE),
      goal('morning.sun', 'Morning sunlight', 'sun', OCHRE, 10, 'min', 5),
      check('morning.bed', 'Make your bed', 'bed', CLAY),
      goal('morning.stretch', 'Stretch', 'activity', SAGE, 5, 'min', 5),
      check('morning.plan', 'Plan your top 3 tasks', 'pen', TEAL),
    ],
  },
  {
    id: 'fitness',
    title: 'Get fit',
    subtitle: 'Move more, eat better',
    description: 'Build a consistent fitness base without overthinking it.',
    icon: 'dumbbell',
    color: TERRA,
    section: 'popular',
    habits: [
      check('fitness.gym', 'Workout', 'dumbbell', TERRA),
      goal('fitness.steps', 'Steps', 'footprints', SAGE, 10000, 'steps', 1000),
      goal('fitness.mobility', 'Mobility', 'activity', TEAL, 10, 'min', 5),
      check('fitness.protein', 'Protein with every meal', 'utensils', OCHRE),
      check('fitness.sugar', 'No sugary drinks', 'apple', CLAY),
      goal('fitness.water', 'Water', 'droplets', SLATE, 3, 'L', 0.25),
    ],
  },
  {
    id: 'sleep',
    title: 'Better sleep',
    subtitle: 'Wake up rested',
    description: 'Evening habits that help you fall asleep faster and sleep deeper.',
    icon: 'moon',
    color: PLUM,
    section: 'popular',
    habits: [
      check('sleep.bed', 'In bed on time', 'bed', PLUM),
      check('sleep.screens', 'No screens 1 hour before bed', 'phoneoff', STONE),
      check('sleep.caffeine', 'No caffeine after 2 pm', 'coffee', CLAY),
      check('sleep.winddown', 'Wind-down routine', 'moon', TEAL, 'Reading, stretching or a warm shower'),
      check('sleep.hours', 'Sleep 7–8 hours', 'moon', SLATE),
    ],
  },
  {
    id: 'mind',
    title: 'Calm mind',
    subtitle: 'Less stress, more focus',
    description: 'Short practices that keep your head clear.',
    icon: 'wind',
    color: TEAL,
    section: 'popular',
    habits: [
      goal('mind.meditate', 'Meditate', 'wind', TEAL, 10, 'min', 5),
      check('mind.gratitude', 'Gratitude journal', 'pen', OCHRE, 'Write three good things'),
      goal('mind.outside', 'Time outside', 'mountain', SAGE, 20, 'min', 5),
      check('mind.breathing', 'Deep breathing', 'wind', SLATE),
      check('mind.digital', 'Digital sunset', 'phoneoff', STONE),
    ],
  },
  {
    id: 'learn',
    title: 'Learn and grow',
    subtitle: 'Get a little better every day',
    description: 'Consistent practice beats occasional cramming.',
    icon: 'book',
    color: SLATE,
    section: 'popular',
    habits: [
      goal('learn.read', 'Read', 'book', SLATE, 20, 'pages', 5),
      check('learn.new', 'Learn something new', 'brain', PLUM),
      goal('learn.skill', 'Practice a skill', 'code', TEAL, 30, 'min', 10),
      goal('learn.language', 'Language practice', 'languages', OCHRE, 15, 'min', 5),
      check('learn.write', 'Write', 'pen', CLAY, 'One page or a few paragraphs'),
    ],
  },
  {
    id: 'focus',
    title: 'Deep work',
    subtitle: 'Protect your best hours',
    description: 'Habits for getting meaningful work done.',
    icon: 'laptop',
    color: STONE,
    section: 'popular',
    habits: [
      goal('focus.deep', 'Deep work', 'laptop', STONE, 3, 'hours', 0.5),
      check('focus.top3', 'Plan your top 3 tasks', 'target', TEAL),
      check('focus.phone', 'Phone-free first hour', 'phoneoff', CLAY),
      check('focus.inbox', 'Clear your inbox', 'sparkles', SLATE),
      check('focus.shutdown', 'Shutdown ritual', 'moon', PLUM, 'Review the day and plan tomorrow'),
    ],
  },
  {
    id: 'money',
    title: 'Money habits',
    subtitle: 'Spend and save with intent',
    description: 'Small daily checks that keep your finances calm.',
    icon: 'wallet',
    color: SAGE,
    section: 'popular',
    habits: [
      check('money.track', 'Log your spending', 'wallet', SAGE),
      check('money.impulse', 'No impulse buys', 'target', TERRA),
      check('money.save', 'Add to savings', 'sprout', TEAL),
      check('money.review', 'Check your balance', 'brain', SLATE),
    ],
  },
  {
    id: 'selfcare',
    title: 'Self care',
    subtitle: 'Look after yourself',
    description: 'Everyday basics that make you feel good.',
    icon: 'sparkles',
    color: CLAY,
    section: 'popular',
    habits: [
      check('selfcare.sunscreen', 'Sunscreen', 'sun', OCHRE),
      check('selfcare.skin', 'Skincare routine', 'sparkles', CLAY),
      check('selfcare.teeth', 'Brush and floss', 'smile', TEAL),
      check('selfcare.shower', 'Shower', 'shower', SLATE),
      check('selfcare.joy', 'Do something you enjoy', 'music', PLUM),
    ],
  },
]

export const toHabitInput = (t: TemplateHabit): HabitInput => ({
  name: t.name,
  icon: t.icon,
  color: t.color,
  kind: t.kind,
  target: t.target,
  unit: t.unit,
  step: t.step,
  days: ALL_DAYS,
  templateId: t.id,
})
