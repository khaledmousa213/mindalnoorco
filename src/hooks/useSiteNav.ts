import { useEffect, useState } from 'react';
import {
  DEFAULT_FOOTER_NAV,
  DEFAULT_HEADER_NAV,
  subscribeSiteNav,
  type SiteNav,
} from '../lib/siteNav';

export function useSiteNav(): SiteNav {
  const [nav, setNav] = useState<SiteNav>({
    header: DEFAULT_HEADER_NAV,
    footerCompany: DEFAULT_FOOTER_NAV,
  });

  useEffect(() => subscribeSiteNav(setNav), []);

  return nav;
}
