export const LOCATION_CATEGORY = {
  O: 'O',
  K: 'K',
  P: 'P',
  H: 'H',
  M: 'M',
  X: 'X',
  C: 'C',
  B: 'B',
} as const;

export type LocationCategory = (typeof LOCATION_CATEGORY)[keyof typeof LOCATION_CATEGORY];

export interface LocalizedName {
  ua: string;
  en: string;
}

export interface LocationCategoryInfo {
  code: LocationCategory;
  name: LocalizedName;
  level: 1 | 2 | 3 | 4 | null;
}

export interface LocationCategoryEntity {
  code: LocationCategory;
  nameUa: string;
  nameEn: string;
  level: 1 | 2 | 3 | 4 | null;
}

export interface LocationEntity {
  code: string;

  nameUa: string;
  nameEn: string;

  categoryCode: LocationCategory;

  parentCode: string | null;
}
