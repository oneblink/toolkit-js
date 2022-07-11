interface ReferenceDataMeta {
  type: string;
  hash: string;
}

type ReferenceDataType<T> = T extends Array<infer R> ? R : T;

interface ReferenceData<T = unknown[]> extends ReferenceDataMeta {
  value: Array<ReferenceDataType<T>>;
}

export class ReferenceDataStore {
  store: LocalForage;

  constructor(store: LocalForage) {
    this.store = store;
  }

  async emptyStore() {
    await this.store.clear();
  }

  async updateStore(referenceData: ReferenceData[]) {
    await this.store.clear();
    for (const data of referenceData) {
      await this.store.setItem(data.type, data);
    }
  }

  async getReferenceDataByType<T>(
    typeKey: string
  ): Promise<ReferenceData<T> | undefined> {
    const item = await this.store.getItem<ReferenceData<T>>(typeKey);
    return item || undefined;
  }

  async getAllReferenceData() {
    const referenceData: Record<string, Array<unknown>> = {};
    await this.store.iterate((record: ReferenceData) => {
      if (record) {
        referenceData[record.type] = record.value;
      }
    });
    return referenceData;
  }

  async getAllReferenceDataMeta(store: LocalForage) {
    const referenceDataMeta: Record<string, unknown> = {};
    await store.iterate((record: ReferenceData) => {
      if (record) {
        referenceDataMeta[record.type] = record.hash;
      }
    });
    return referenceDataMeta;
  }
}
