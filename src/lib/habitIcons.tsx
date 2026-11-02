import {
  Activity, AlarmClock, Apple, Baby, CalendarHeart, HeartHandshake, Stethoscope, Thermometer, Wind, BedDouble, BookOpen, Brain, Camera, CigaretteOff, Code, Coffee, Dog, Droplets,
  Dumbbell, Flower2, Footprints, Heart, Languages, Laptop, Moon, Mountain, Music, PenLine, Pill, PhoneOff,
  Salad, ShowerHead, Smile, Sparkles, Sprout, Sun, Target, Utensils, Wallet, Bike,
  type LucideIcon,
} from 'lucide-react'

export const HABIT_ICONS: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  footprints: Footprints,
  droplets: Droplets,
  sun: Sun,
  alarm: AlarmClock,
  book: BookOpen,
  brain: Brain,
  heart: Heart,
  activity: Activity,
  bike: Bike,
  mountain: Mountain,
  salad: Salad,
  apple: Apple,
  utensils: Utensils,
  coffee: Coffee,
  pill: Pill,
  moon: Moon,
  bed: BedDouble,
  shower: ShowerHead,
  sparkles: Sparkles,
  pen: PenLine,
  code: Code,
  laptop: Laptop,
  languages: Languages,
  music: Music,
  camera: Camera,
  phoneoff: PhoneOff,
  nosmoke: CigaretteOff,
  sprout: Sprout,
  flower: Flower2,
  dog: Dog,
  wallet: Wallet,
  smile: Smile,
  baby: Baby,
  thermometer: Thermometer,
  calendar: CalendarHeart,
  handshake: HeartHandshake,
  wind: Wind,
  stethoscope: Stethoscope,
  target: Target,
}

export const ICON_KEYS = Object.keys(HABIT_ICONS)

export function HabitIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = HABIT_ICONS[name] ?? Target
  return <Icon size={size} strokeWidth={1.75} aria-hidden />
}
