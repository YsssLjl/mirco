import { AppList, InternalAppInfo, LifeStatus } from "../types";
let appList: AppList[] = [];
export const setAppList = (list: AppList[]) => {
  appList = list;
  appList.map((app) => {
    (app as InternalAppInfo).status = LifeStatus.NOT_LOADED;
  });
};

export const getAppList = () => {
  return appList;
};
