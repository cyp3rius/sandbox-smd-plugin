import { Core } from "@strapi/strapi";
import { createDomain } from "./createDomain";
import {
  BRAND_A_DOMAIN,
  BRAND_A_DOMAIN_ROLE,
  BRAND_B_DOMAIN,
  BRAND_B_DOMAIN_ROLE,
  SUPPORTED_COLLECTION_UID,
} from "./const";

export const createBrandADomain = async (strapi: Core.Strapi) => 
  await createDomain(
    strapi,
    BRAND_A_DOMAIN,
    BRAND_A_DOMAIN_ROLE,
    SUPPORTED_COLLECTION_UID,
  );

export const createBrandBDomain = async (strapi: Core.Strapi) => 
  await createDomain(
    strapi,
    BRAND_B_DOMAIN,
    BRAND_B_DOMAIN_ROLE,
    SUPPORTED_COLLECTION_UID,
  );