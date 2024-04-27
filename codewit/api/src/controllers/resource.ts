import { Resource } from '../models';

export async function createResource(
  url: string,
  title: string,
  source: string
): Promise<Resource> {
  const resource = await Resource.create({ url, title, source });
  return resource;
}

export async function getAllResources(): Promise<Resource[]> {
  const resources = await Resource.findAll();
  return resources;
}

export async function getResource(uid: number): Promise<Resource | null> {
  const resource = await Resource.findByPk(uid);
  return resource;
}

export async function likeResource(
  uid: number,
  user_uid: number
): Promise<Resource | null> {
  const resource = await Resource.findByPk(uid);

  if (!resource) {
    return null;
  }

  const isliked = await resource.hasLikedBy(user_uid);
  if (!isliked) {
    resource.addLikedBy(user_uid);
    resource.likes += 1;

    await resource.save();
    await resource.reload();
  }

  return resource;
}

export async function removeLikeResource(
  uid: number,
  user_uid: number
): Promise<Resource | null> {
  const resource = await Resource.findByPk(uid);

  if (!resource) {
    return null;
  }

  const isliked = await resource.hasLikedBy(user_uid);
  if (isliked) {
    resource.removeLikedBy(user_uid);
    resource.likes -= 1;

    await resource.save();
    await resource.reload();
  }

  return resource;
}

export async function deleteResource(uid: number): Promise<Resource | null> {
  const resource = await Resource.findByPk(uid);
  if (resource) {
    await resource.destroy();
    return resource;
  }

  return resource;
}

export async function updateResource(
  uid: number,
  url?: string,
  title?: string,
  source?: string
): Promise<Resource | null> {
  const resource = await Resource.findByPk(uid);
  if (!resource) {
    return null;
  }

  if (url) {
    resource.url = url;
  }
  if (title) {
    resource.title = title;
  }
  if (source) {
    resource.source = source;
  }

  await resource.save();
  await resource.reload();

  return resource;
}
