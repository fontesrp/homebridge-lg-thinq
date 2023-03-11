import * as NodePersist from 'node-persist';

type PersistInterface = {
  init: () => any;
  getItem: (arg0: string) => any;
  setItem: (arg0: string, arg1: string) => any;
  removeItem: (arg0: string) => any;
};

export default class Persist {
  protected persist: PersistInterface;

  constructor(dir) {
    this.persist = NodePersist.create({
      dir,
    });
  }

  async init() {
    return await this.persist.init();
  }

  async getItem(key: string) {
    return await this.persist.getItem(key);
  }

  async setItem(key: string, value: string) {
    return await this.persist.setItem(key, value);
  }

  async cacheForever(key: string, callable: () => any) {
    let value = await this.getItem(key);
    if (!value) {
      value = await callable();
      await this.setItem(key, value);
    }

    return value;
  }

  async cache(key: string, ttl: number, callable: () => any) {
    let value = await this.getWithExpiry(key);
    if (!value) {
      value = await callable();
      await this.setWithExpiry(key, value, ttl);
    }

    return value;
  }

  async setWithExpiry(key: string, value: any, ttl: number) {
    const now = new Date();

    // `item` is an object which contains the original value
    // as well as the time when it's supposed to expire
    const item = {
      value: value,
      expiry: now.getTime() + ttl,
    };

    await this.persist.setItem(key, JSON.stringify(item));
  }

  async getWithExpiry(key: string) {
    const itemStr = await this.persist.getItem(key);

    // if the item doesn't exist, return null
    if (!itemStr) {
      return null;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();

    // compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
      // If the item is expired, delete the item from storage
      // and return null
      await this.persist.removeItem(key);
      return null;
    }

    return item.value;
  }
}
