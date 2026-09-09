/**
 * One-time seed content: the categories and a starter set of products derived
 * from the original sample catalog, mapped into the simplified data model.
 *
 * These are SAMPLE products. Edit or delete them in the admin panel and add your
 * real Mindray catalogue. Images point at stock photos — replace them with your
 * own product photography via the admin image uploader.
 */
import type { CategoryDraft, ProductDraft } from '../src/lib/types';

export const SEED_CATEGORIES: (CategoryDraft & { key: string })[] = [
  {
    key: 'console-ultrasound',
    name: 'Console Ultrasound',
    slug: 'console-ultrasound',
    description:
      'Cart-based ultrasound systems for radiology, OB/GYN, and cardiovascular imaging.',
    order: 0,
  },
  {
    key: 'portable-ultrasound',
    name: 'Portable & Point-of-Care Ultrasound',
    slug: 'portable-ultrasound',
    description: 'Laptop-style and handheld ultrasound for emergency, ICU, and bedside use.',
    order: 1,
  },
  {
    key: 'digital-radiography',
    name: 'Digital Radiography (DR)',
    slug: 'digital-radiography',
    description: 'Floor-mounted and ceiling-suspended digital X-ray rooms and flat-panel detectors.',
    order: 2,
  },
  {
    key: 'mobile-xray',
    name: 'Mobile X-Ray',
    slug: 'mobile-xray',
    description: 'Motorized bedside digital radiography units for wards, ICU, and isolation rooms.',
    order: 3,
  },
  {
    key: 'surgical-c-arm',
    name: 'Surgical C-Arm',
    slug: 'surgical-c-arm',
    description: 'Mobile flat-panel fluoroscopy for orthopedic, vascular, and spinal surgery.',
    order: 4,
  },
];

type SeedProduct = Omit<ProductDraft, 'categoryId' | 'categoryName'> & { categoryKey: string };

const U = 'https://images.unsplash.com/';

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    categoryKey: 'console-ultrasound',
    slug: 'sonomax-e90-elite',
    name: 'SonoMax E90 Elite',
    brand: 'Mindray',
    shortDescription:
      'Flagship multi-specialty ultrasound console with single-crystal transducer architecture.',
    description:
      'A premium diagnostic ultrasound platform for high-volume hospitals and imaging centers. Combines single-crystal acoustic beamforming with wideband matrix processing for strong resolution across challenging patients, plus workflow automation for routine echocardiography, abdominal, and obstetric exams.',
    images: [
      `${U}photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80`,
      `${U}photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80`,
    ],
    keyFeatures: [
      '23.8-inch HD display with articulating arm and 13.3-inch touch panel',
      'Four active pinless transducer ports with automatic preset switching',
      'Single-crystal acoustic matrix for deeper penetration',
      'Real-time 4D HD rendering engine',
      'Shear-wave elastography for liver and breast assessment',
    ],
    specs: [
      { label: 'Main monitor', value: '23.8-inch IPS (1920 x 1080), 3D articulation' },
      { label: 'Touch screen', value: '13.3-inch capacitive, anti-glare' },
      { label: 'Transducer ports', value: '4 active + 1 parking' },
      { label: 'Imaging modes', value: 'B, M, Color/Power Doppler, PW, CW, HD-Live 4D, elastography' },
      { label: 'Storage', value: '1 TB medical SSD' },
      { label: 'Connectivity', value: 'DICOM 3.0, Gigabit Ethernet, dual-band Wi-Fi' },
    ],
    priceRange: 'Request a quote',
    datasheetUrl: '',
    isFeatured: true,
    isPublished: true,
    order: 0,
  },
  {
    categoryKey: 'portable-ultrasound',
    slug: 'sonomax-air-pro',
    name: 'SonoMax Air Pro',
    brand: 'Mindray',
    shortDescription: 'High-performance laptop-style portable ultrasound with dual-connector docking.',
    description:
      'Designed for emergency rooms, bedside ICU evaluations, and mobile clinics. Packs high-tier beamforming into a briefcase-portable form factor without sacrificing Doppler sensitivity or image clarity.',
    images: [`${U}photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80`],
    keyFeatures: [
      '12-second boot with 3.5-hour battery',
      'Magnesium-alloy shock-resistant shell, 4.6 kg',
      'Dual direct transducer connectors',
      'Needle enhancement for guided procedures',
      'One-touch auto-optimization',
    ],
    specs: [
      { label: 'Display', value: '15.6-inch full-HD anti-glare medical LCD' },
      { label: 'Weight', value: '4.6 kg with battery' },
      { label: 'Battery life', value: '3.5 hours scanning, 8 hours standby' },
      { label: 'Probe ports', value: '2 native active ports' },
      { label: 'Modes', value: 'B, M, Color/Power Doppler, PW, THI, compound imaging' },
      { label: 'Connectivity', value: 'DICOM 3.0, Wi-Fi 6, USB 3.0, HDMI' },
    ],
    priceRange: 'Request a quote',
    datasheetUrl: '',
    isFeatured: true,
    isPublished: true,
    order: 1,
  },
  {
    categoryKey: 'digital-radiography',
    slug: 'raymax-vision-dr',
    name: 'RayMax Vision DR (Floor-Mounted)',
    brand: 'Mindray',
    shortDescription:
      'High-throughput digital radiography room with a 65 kW generator and dual CsI detectors.',
    description:
      'An institutional-grade digital radiographic suite for maximum patient throughput and diagnostic image quality, with a motorized synchronized tracking tube stand, four-way floating carbon-fiber tabletop, and low-dose cesium iodide flat-panel detectors.',
    images: [
      `${U}photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80`,
      `${U}photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80`,
    ],
    keyFeatures: [
      '65 kW high-frequency inverter generator (up to 150 kV / 800 mA)',
      'Dual high-DQE cesium iodide detectors (17x17 wall stand + 14x17 wireless)',
      'Motorized auto-tracking tube stand',
      'Automatic exposure control reduces patient dose',
      '24-inch DICOM-calibrated acquisition console',
    ],
    specs: [
      { label: 'Generator', value: '65 kW high-frequency inverter (400 kHz)' },
      { label: 'Tube voltage', value: '40–150 kV in 1 kV steps' },
      { label: 'Tube current', value: '10–800 mA' },
      { label: 'Table', value: '4-way floating elevating carbon-fiber top, 300 kg capacity' },
      { label: 'Primary detector', value: '17 x 17-inch fixed CsI' },
      { label: 'PACS / DICOM', value: 'DICOM 3.0 (Store, Print, MWL, MPPS, Storage Commitment)' },
    ],
    priceRange: 'Request a quote',
    datasheetUrl: '',
    isFeatured: true,
    isPublished: true,
    order: 2,
  },
  {
    categoryKey: 'surgical-c-arm',
    slug: 'optima-c-900-surgical-c-arm',
    name: 'Optima-C 900 Surgical C-Arm',
    brand: 'Mindray',
    shortDescription:
      'Flat-panel detector mobile C-arm for orthopedic, vascular, and spinal procedures.',
    description:
      'Provides surgical teams with distortion-free intraoperative imaging and a low radiation footprint. Suitable for complex spine, trauma, orthopedic, pain-management, and vascular interventions.',
    images: [`${U}photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80`],
    keyFeatures: [
      '30 x 30 cm distortion-free dynamic flat-panel detector',
      '25 kW generator with pulsed fluoroscopy up to 30 fps',
      'Dual 27-inch 4K medical monitors on a motorized cart',
      'DSA, roadmapping, and max-opacity vascular package',
      '150° orbital rotation with 820 mm free space',
    ],
    specs: [
      { label: 'Generator', value: '25 kW high-frequency pulsed fluoroscopy inverter' },
      { label: 'Max tube voltage', value: '125 kV' },
      { label: 'Pulsed fluoro rate', value: '1–30 pulses per second' },
      { label: 'Detector', value: 'Dynamic flat panel 30 x 30 cm (2048 x 2048)' },
      { label: 'Orbital movement', value: '150° (-50° to +100°)' },
      { label: 'Cine storage', value: '100,000 frames, USB / DVD / DICOM export' },
    ],
    priceRange: 'Request a quote',
    datasheetUrl: '',
    isFeatured: true,
    isPublished: true,
    order: 3,
  },
  {
    categoryKey: 'mobile-xray',
    slug: 'rayport-mobile-dr',
    name: 'RayPort Ultra-Mobile Bedside DR',
    brand: 'Mindray',
    shortDescription:
      'Motorized battery-driven mobile digital X-ray for ICU, ER, and isolation wards.',
    description:
      'Brings hospital-grade digital radiography to the patient bedside, with power-assisted steering and a collapsible telescopic column for clear driving visibility.',
    images: [`${U}photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80`],
    keyFeatures: [
      'Motorized power-assisted drive with anti-collision safety',
      'Collapsible telescopic column for full forward visibility',
      'Dual lithium-ion packs: 200+ exposures per charge',
      'Instant wireless DICOM transmission over 5G / Wi-Fi 6',
      'On-board wireless detector charging bay',
    ],
    specs: [
      { label: 'Generator', value: '32 kW high-frequency inverter' },
      { label: 'Tube voltage', value: '40–130 kV' },
      { label: 'mAs range', value: '0.1–320 mAs' },
      { label: 'Detector', value: '14 x 17-inch wireless CsI flat panel' },
      { label: 'Console', value: '19-inch all-in-one capacitive touch screen' },
      { label: 'Weight', value: '380 kg, low centre of gravity' },
    ],
    priceRange: 'Request a quote',
    datasheetUrl: '',
    isFeatured: false,
    isPublished: true,
    order: 4,
  },
  {
    categoryKey: 'console-ultrasound',
    slug: 'cardiovascular-pro-7000',
    name: 'CardioVascular Pro 7000',
    brand: 'Mindray',
    shortDescription:
      'Dedicated cardiovascular and TEE ultrasound workstation with strain analysis.',
    description:
      'Built for cardiologists and cardiac surgeons: sub-millisecond temporal resolution, automated strain quantification, and full support for matrix TEE echocardiography.',
    images: [`${U}photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80`],
    keyFeatures: [
      '4D transesophageal (TEE) probe support with real-time colour Doppler',
      'Automated LV auto-EF and 18-segment speckle-tracking strain',
      'Pure-wave crystal architecture for high-BMI patients',
      'Automated valvular hemodynamic calculations',
      'Integrated multi-lead ECG with stress echo workflows',
    ],
    specs: [
      { label: 'Beamformer', value: 'Matrix coherent, 524,288 processing channels' },
      { label: 'Cardiac frame rate', value: 'Over 900 fps in tissue Doppler' },
      { label: 'Display', value: '24-inch OLED with 14-inch floating touch panel' },
      { label: 'Analysis', value: 'Auto-EF, wall-motion tracking, stress echo, contrast echo' },
      { label: 'Storage', value: '2 TB NVMe SSD with encrypted backup' },
    ],
    priceRange: 'Request a quote',
    datasheetUrl: '',
    isFeatured: false,
    isPublished: true,
    order: 5,
  },
  {
    categoryKey: 'portable-ultrasound',
    slug: 'sonopocket-dual-probe',
    name: 'SonoPocket Dual-Probe Handheld',
    brand: 'Mindray',
    shortDescription: 'Pocket-sized wireless ultrasound with dual convex and linear transducer heads.',
    description:
      'A stethoscope-replacement scanner for physicians, paramedics, and bedside clinicians. Flip the probe in your hand to switch between deep abdominal/cardiac and shallow vascular/MSK imaging.',
    images: [`${U}photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80`],
    keyFeatures: [
      'Dual head: convex 3.5 MHz + linear 10 MHz',
      '220 g, IP67 waterproof for full disinfection',
      'Wi-Fi Direct to iPad, iPhone, Android, and Windows',
      'Qi wireless charging, 3.5 hours scanning',
      'Cloud image vault with one-click PDF report export',
    ],
    specs: [
      { label: 'Transducer heads', value: 'Convex (3.2 MHz) + linear (7.5–10 MHz)' },
      { label: 'Weight', value: '220 g' },
      { label: 'Ingress rating', value: 'IP67 (submersible)' },
      { label: 'OS compatibility', value: 'iOS 14+, Android 10+, Windows 11' },
      { label: 'Modes', value: 'B, M, Color/Power Doppler, PW' },
    ],
    priceRange: 'Request a quote',
    datasheetUrl: '',
    isFeatured: false,
    isPublished: true,
    order: 6,
  },
  {
    categoryKey: 'digital-radiography',
    slug: 'raymax-vet-dr-pro',
    name: 'RayMax VetDR Pro',
    brand: 'Mindray',
    shortDescription:
      'High-frequency veterinary digital radiography table with wireless flat-panel detector.',
    description:
      'A purpose-built digital radiography solution for animal hospitals, companion veterinary clinics, and equine mobile practices, with species-specific anatomical presets.',
    images: [`${U}photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80`],
    keyFeatures: [
      '32 kW high-frequency monoblock generator',
      '4-way floating low-noise table with quiet brake',
      '17 x 17-inch high-DQE cesium iodide detector',
      'Canine, feline, avian, exotic, and equine presets',
      'Automated VHS and orthopedic pre-op measurement tools',
    ],
    specs: [
      { label: 'Generator', value: '32 kW / 125 kV / 400 mA' },
      { label: 'Table', value: '4-way float radiolucent top with tie-down rails' },
      { label: 'Detector', value: '17 x 17-inch wireless/tethered CsI flat panel' },
      { label: 'Presets', value: 'APR database for 40+ species and breeds' },
    ],
    priceRange: 'Request a quote',
    datasheetUrl: '',
    isFeatured: false,
    isPublished: true,
    order: 7,
  },
];
