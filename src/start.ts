import { setAppList, getAppList } from "./appList";
import { setLifeCycle } from "./lifeCycle";
import { hijackRoute, rewriteRoute } from "./route";
import { AppList, InternalAppInfo, LifeCycles, LifeStatus } from "./types";
import { prefetch } from "./utils";

/**
 * @description:注册app
 * @param {AppList} appList
 * @param {LifeCycles} lifeCycles
 * @return {*}
 */
export const registerMicroApps = (
  appList: AppList[],
  lifeCycles?: LifeCycles
) => {
  setAppList(appList);
  lifeCycles && setLifeCycle(lifeCycles);
};

export const start = () => {
  const list = getAppList();
  if (!list.length) {
    throw new Error("请先注册应用");
  }

  hijackRoute();

  rewriteRoute(window.location.href);

  list.forEach((app) => {
    if ((app as InternalAppInfo).status === LifeStatus.NOT_LOADED) {
      prefetch(app as InternalAppInfo);
    }
  });
};
