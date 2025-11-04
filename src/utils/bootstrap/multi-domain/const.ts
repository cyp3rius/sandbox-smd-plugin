import { UID } from "@strapi/strapi";

export type Domain = {
  name: string;
  code: string;
};

export type DomainRoleMetadata = {
  name: string;
  code: string;
  description: string;
}

export const SUPPORTED_PLUGIN_UID: UID.ContentType[] = [
  'plugin::navigation.navigation',
  'plugin::navigation.navigation-item',
  'plugin::upload.file',
  'plugin::upload.folder',
]

export const SUPPORTED_COLLECTION_UID: UID.ContentType[] = [
  ...SUPPORTED_PLUGIN_UID,
  'plugin::navigation.audience',
  'api::article.article',
  'api::category.category',
  'api::author.author',
  'api::about.about',
  'api::global.global',
] as UID.ContentType[];


export const BRAND_A_DOMAIN = {
  name: 'Brand A',
  code: 'brand-a',
};

export const BRAND_A_DOMAIN_ROLE = {
  name: 'Brand A Domain',
  code: 'brand-a-domain',
  description: 'Role for Brand A domain',
}

export const BRAND_B_DOMAIN = {
  name: 'Brand B',
  code: 'brand-b',
};

export const BRAND_B_DOMAIN_ROLE = {
  name: 'Brand B Domain',
  code: 'brand-b-domain',
  description: 'Role for Brand B domain',
}