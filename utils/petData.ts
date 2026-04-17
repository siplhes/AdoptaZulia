/**
 * Pet Data Constants
 * 
 * Predefined options for pet-related forms to ensure consistency
 * and improve user experience.
 */

export const COMMON_LOCATIONS = [
  'Maracaibo (Indio Mara)',
  'Maracaibo (Santa Lucía)',
  'Maracaibo (Tierra Negra)',
  'Maracaibo (San Jacinto)',
  'Maracaibo (5 de Julio)',
  'Maracaibo (El Milagro)',
  'Maracaibo (Bella Vista)',
  'Maracaibo (La Limpia)',
  'Maracaibo (Los Olivos)',
  'Maracaibo (Amparo)',
  'Maracaibo (La Trinidad)',
  'Maracaibo (Centro)',
  'Maracaibo (Norte)',
  'Maracaibo (Sur)',
  'Maracaibo (Oeste)',
  'San Francisco (Centro)',
  'San Francisco (La Coromoto)',
  'San Francisco (Urb. San Francisco)',
  'Cabimas',
  'Otro'
];

export const DOG_BREEDS = [
  'Mestizo / Criollo',
  'Akita Inu',
  'Basset Hound',
  'Beagle',
  'Bernés de la Montaña',
  'Bichón Frisé',
  'Bichón Maltés',
  'Border Collie',
  'Boston Terrier',
  'Boxer',
  'Boyero de Berna',
  'Bulldog Americano',
  'Bulldog Francés',
  'Bulldog Inglés',
  'Bull Terrier',
  'Caniche (Poodle)',
  'Chihuahua',
  'Chow Chow',
  'Cocker Spaniel',
  'Dálmata',
  'Doberman',
  'Dogo Argentino',
  'Fox Terrier',
  'Galgo',
  'Golden Retriever',
  'Gran Danés',
  'Husky Siberiano',
  'Jack Russell Terrier',
  'Labrador Retriever',
  'Mastín Napolitano',
  'Papillón',
  'Pastor Alemán',
  'Pastor Belga',
  'Pastor Australiano',
  'Pekínés',
  'Pinscher',
  'Pitbull',
  'Pomerania',
  'Pug (Carlino)',
  'Rottweiler',
  'Samoyedo',
  'San Bernardo',
  'Schnauzer',
  'Shar Pei',
  'Shiba Inu',
  'Shih Tzu',
  'Terranova',
  'Vizsla',
  'Weimaraner',
  'Yorkshire Terrier',
  'Otro'
].sort((a, b) => {
  if (a === 'Mestizo / Criollo') return -1;
  if (b === 'Mestizo / Criollo') return 1;
  if (a === 'Otro') return 1;
  if (b === 'Otro') return -1;
  return a.localeCompare(b);
});

export const CAT_BREEDS = [
  'Mestizo / Común',
  'Abisinio',
  'Angora Turco',
  'Azul Ruso',
  'Bengala',
  'Birmano',
  'Bombay',
  'Bosque de Noruega',
  'British Shorthair',
  'Burmés',
  'Chartreux',
  'Cornish Rex',
  'Devon Rex',
  'Esfinge (Sphynx)',
  'Exótico de Pelo Corto',
  'Habana Brown',
  'Himalayo',
  'Korat',
  'Maine Coon',
  'Manx',
  'Mau Egipcio',
  'Ocicat',
  'Oriental',
  'Persa',
  'Ragdoll',
  'Siamés',
  'Somalí',
  'Tonquinés',
  'Otro'
].sort((a, b) => {
  if (a === 'Mestizo / Común') return -1;
  if (b === 'Mestizo / Común') return 1;
  if (a === 'Otro') return 1;
  if (b === 'Otro') return -1;
  return a.localeCompare(b);
});

export const AGE_OPTIONS = [
  'Menos de 1 mes',
  '1 mes',
  '2 meses',
  '3 meses',
  '4 meses',
  '5 meses',
  '6 meses',
  '7 meses',
  '8 meses',
  '9 meses',
  '10 meses',
  '11 meses',
  '1 año',
  '1 año y medio',
  '2 años',
  '3 años',
  '4 años',
  '5 años',
  '6 años',
  '7 años',
  '8 años',
  '9 años',
  '10 años',
  '11 años',
  '12 años',
  '13 años',
  '14 años',
  '15 años',
  'Más de 15 años'
];
