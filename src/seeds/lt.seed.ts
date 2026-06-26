import type { NewLocationType } from "../db/schema";

export const locationCategories: NewLocationType[] = [
  {
    code: "O",
    nameUa: "Область",
    nameEn: "Region",
    level: 1
  },
  {
    code: "K",
    nameUa: "Місто спеціального статусу",
    nameEn: "Special-status city",
    level: 1
  },
  {
    code: "P",
    nameUa: "Район",
    nameEn: "District",
    level: 2
  },
  {
    code: "H",
    nameUa: "Територіальна громада",
    nameEn: "Community",
    level: 3
  },
  {
    code: "M",
    nameUa: "Місто",
    nameEn: "City",
    level: 4
  },
  {
    code: "X",
    nameUa: "Селище",
    nameEn: "Settlement",
    level: 4
  },
  {
    code: "C",
    nameUa: "Село",
    nameEn: "Village",
    level: 4
  },
  {
    code: "B",
    nameUa: "Район у місті",
    nameEn: "City district",
    level: null
  }
];
