import { Core, UID } from "@strapi/strapi";
import { ID } from "@strapi/types/dist/data";
import { createRoles } from "./createRoles";
import { Domain, DomainRoleMetadata } from "./const";

// @ts-ignore
const MULTI_DOMAIN_UID: UID.ContentType = "plugin::multi-domain.domain";

const updateEntities = async (
  strapi: Core.Strapi,
  collection: UID.ContentType,
  domainId: ID,
  isDraftAndPublishEnabled: boolean,
  locale?: string,
) => {
  const collectionService = strapi.documents(collection);
  if (isDraftAndPublishEnabled) {
    const publishedEntities = await collectionService.findMany({
      status: 'published',
      locale,
    });
    const draftEntities = await collectionService.findMany({
      status: 'draft',
      locale,
    });
    await Promise.all(draftEntities.map(async entity => {
      await collectionService.update({
        documentId: entity.documentId,
        status: 'draft',
        locale,
        data: { domain: domainId } as any,
      });
    }));
    await Promise.all(publishedEntities.map(async entity => {
      await collectionService.update({
        documentId: entity.documentId,
        status: 'published',
        locale,
        data: { domain: domainId } as any,
      });
    }));
  } else {
    const entities = await collectionService.findMany({ locale });
    await Promise.all(entities.map(async entity => {
      await collectionService.update({
        documentId: entity.documentId,
        locale,
        data: { domain: domainId } as any,
      })
    }))
  }
};

export const createDomain = async (
  strapi: Core.Strapi,
  domain: Domain,
  DomainRoleMetadata: DomainRoleMetadata,
  domainCollections: UID.ContentType[],
) => {
  const isDomainCreated = await strapi.documents(MULTI_DOMAIN_UID).findFirst({
    // @ts-ignore
    filters: domain,
  });

  if (isDomainCreated) {
    return;
  };

  console.log(`${domain.name} domain not found - MIGRATION START`);

  await strapi.db.transaction(async () => {
    const locales = await strapi.documents('plugin::i18n.locale').findMany({ fields: ['code'] })
    const localeCodes = locales.map(l => l.code);

    // create domain and assign default roles to it
    const myDHLiDomainRole = await createRoles(strapi, DomainRoleMetadata, domainCollections, localeCodes);
    const myDHLiDomain = await strapi.documents(MULTI_DOMAIN_UID).create({
      data: {
        ...domain,
        // @ts-ignore
        role: myDHLiDomainRole,
      },
    });

    // assign all existing collection entities to domain
    await Promise.all(domainCollections.map(async collection => {
      const isI18nEnabled = !!(strapi.contentType(collection).pluginOptions as Record<string, any>)?.i18n?.localized;
      const isDraftAndPublishEnabled = strapi.contentType(collection).options.draftAndPublish;
      if (isI18nEnabled) {
        for (const locale of localeCodes) {
          await updateEntities(strapi, collection, myDHLiDomain.id, isDraftAndPublishEnabled, locale)
        };
      } else {
        await updateEntities(strapi, collection, myDHLiDomain.id, isDraftAndPublishEnabled)
      };
    }));
  });

  console.log(`${domain.name} domain not found - MIGRATION END`);
}
