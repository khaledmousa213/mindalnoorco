import {
  Award,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  PackageSearch,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/** Curated set an admin can pick from; stored by name so props stay plain JSON. */
export const CARD_ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  Wrench,
  PackageSearch,
  Award,
  Clock,
  Stethoscope,
  Sparkles,
  Zap,
  CheckCircle2,
  PhoneCall,
  Mail,
  MapPin,
};

export const CARD_ICON_NAMES = Object.keys(CARD_ICONS);
