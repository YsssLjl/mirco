import { getAppList } from "./appList";
import { InternalAppInfo, LifeStatus } from "./types";
import { importEntry } from "import-html-entry";
import { match } from "path-to-regexp";
export const getAppListStatus = () => {
  // *根据注册阶段传入的applist
  // *匹配当前路由
  // *返回对应状态

  // *需要渲染的应用列表
  const actives: InternalAppInfo[] = [];
  // *需要卸载的应用列表
  const unmounts: InternalAppInfo[] = [];
  // *需要注册的子应用列表
  const appList = getAppList() as InternalAppInfo[];
  // *路由匹配，返回状态
  appList.forEach((app) => {
    const isActive = match(app.activeRule, { end: false })(location.pathname);
    switch (app.status) {
      case LifeStatus.NOT_LOADED:
      case LifeStatus.LOADING:
      case LifeStatus.LOADED:
      case LifeStatus.BOOTSTRAPPING:
      case LifeStatus.NOT_MOUNTED:
        isActive && actives.push(app);
        break;
      case LifeStatus.MOUNTED:
        !isActive && unmounts.push(app);
        break;
    }
  });
  return { actives, unmounts };
};
// *预加载
export const prefetch = async (app: InternalAppInfo) => {
  // 空闲时间加载
  requestIdleCallback(async () => {
    const { getExternalScripts, getExternalStyleSheets } = await importEntry(
      app.entry
    );
    requestIdleCallback(getExternalStyleSheets);
    requestIdleCallback(getExternalScripts);
  });
};
