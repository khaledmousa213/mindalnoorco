import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Editable link lists for the shared site chrome (header menu, footer
 * "Company" column). One small doc, like siteContent. When a list has never
 * been saved, the defaults below — today's hardcoded links — are used.
 */
export interface NavLinkItem {
  id: string;
  label: string;
  path: string;
}

export interface SiteNav {
  header: NavLinkItem[];
  footerCompany: NavLinkItem[];
}

export const DEFAULT_HEADER_NAV: NavLinkItem[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'catalog', label: 'Catalog', path: '/catalog' },
  { id: 'about', label: 'About', path: '/about' },
  { id: 'contact', label: 'Contact', path: '/contact' },
];

export const DEFAULT_FOOTER_NAV: NavLinkItem[] = [
  { id: 'about', label: 'About Mind Alnoor', path: '/about' },
  { id: 'contact', label: 'Contact & quote requests', path: '/contact' },
  { id: 'staff', label: 'Staff sign in', path: '/admin/login' },
];

const NAV_REF = doc(db, 'siteNav', 'default');

export function subscribeSiteNav(onData: (nav: SiteNav) => void): () => void {
  const defaults: SiteNav = { header: DEFAULT_HEADER_NAV, footerCompany: DEFAULT_FOOTER_NAV };
  return onSnapshot(
    NAV_REF,
    (snap) => {
      const data = snap.data();
      onData({
        header: (data?.header as NavLinkItem[]) ?? defaults.header,
        footerCompany: (data?.footerCompany as NavLinkItem[]) ?? defaults.footerCompany,
      });
    },
    () => onData(defaults),
  );
}

export async function setSiteNavList(key: keyof SiteNav, items: NavLinkItem[]): Promise<void> {
  await setDoc(NAV_REF, { [key]: items }, { merge: true });
}
