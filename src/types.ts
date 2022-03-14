export interface AppList {
  name: string;
  entry: string;
  container: string;
  activeRule: string;
}
export interface LifeCycles {
  beforeLoad?: LifeCycle | LifeCycle[];
  mounted?: LifeCycle | LifeCycle[];
  unmounted?: LifeCycle | LifeCycle[];
}

type LifeCycle = (app: AppList) => Promise<any>;

export type EventType = "hashchange" | "popstate";

export enum LifeStatus {
  NOT_LOADED = "NOT_LOADED",
  LOADING = "LOADING",
  LOADED = "LOADED",
  BOOTSTRAPPING = "BOOTSTRAPPING",
  NOT_MOUNTED = "NOT_MOUNTED",
  MOUNTING = "MOUNTING",
  MOUNTED = "MOUNTED",
  UNMOUNTING = "UNMOUNTING",
}

export interface InternalAppInfo extends AppList {
  status: LifeStatus;
  bootstrap?: LifeCycle;
  mount?: LifeCycle;
  unmount?: LifeCycle;
  proxy: any;
}
