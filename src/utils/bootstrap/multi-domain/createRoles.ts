import { Core, UID } from "@strapi/strapi";
import { DomainRoleMetadata } from "./const";

const UNSUPPORTED_FIELDS = [
  'createdAt',
  'updatedAt',
  'publishedAt',
  'createdBy',
  'updatedBy',
  'locale',
  'localizations',
  'strapi_stage',
  'strapi_assignee',
];

const SUPPORTED_PERMISSION = [
  'plugin::navigation.read',
  'plugin::navigation.update',
  'plugin::upload.read',
  'plugin::upload.configure-view',
  'plugin::upload.assets.create',
  'plugin::upload.assets.update',
  'plugin::upload.assets.download',
  'plugin::upload.assets.copy-link',
];

const getAllFields = (strapi: Core.Strapi, attributes: any) => {
  return Object.entries(attributes)
    .flatMap(([key, value]: any) => {
      if (value.type !== 'component') {
        return key;
      }
      return getAllFields(strapi, strapi.components[value.component].attributes).map((name) => `${key}.${name}`)
    })
}

const updateRoles = async (
  strapi: Core.Strapi,
  uid: UID.ContentType,
  locales: string[],
) => {
  const contentType = strapi.contentType(uid);

  const fields = getAllFields(strapi, contentType.attributes)
    .filter((field) => !UNSUPPORTED_FIELDS.includes(field));

  const isI18nEnabled = !!(contentType.pluginOptions as Record<string, any>)?.i18n?.localized;

  const permission = await strapi.documents("admin::permission").create({
    data: {
      action: 'plugin::content-manager.explorer.read',
      subject: uid,
      properties: {
        fields,
        locales: isI18nEnabled ? locales : undefined,
      },
    },
  })

  return permission.id;
}

export const createRoles = async (
  strapi: Core.Strapi,
  domainRoleMetadata: DomainRoleMetadata,
  domainCollections: UID.ContentType[],
  locales: string[],
) => {
  const isMyDHLiDomainRoleCreated = await strapi.documents("admin::role").findFirst({
    filters: domainRoleMetadata,
  });

  if (isMyDHLiDomainRoleCreated) {
    return;
  }

  const apiPermissionIds = await Promise.all(domainCollections.map(async uid => updateRoles(strapi, uid, locales)))

  const otherPermisionIds = await Promise.all(SUPPORTED_PERMISSION.flatMap(async action => {
    const { id } = await strapi.documents("admin::permission").create({
      data: { action },
      fields: ['id'],
    });
    return id;
  }));

  const domainRole = await strapi.documents("admin::role").create({
    data: {
      ...domainRoleMetadata,
      permissions: [...apiPermissionIds, ...otherPermisionIds],
    },
  });

  return domainRole.id;
}