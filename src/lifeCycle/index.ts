import { InternalAppInfo, LifeCycles, LifeStatus, AppList } from "../types";
let lifeCycles: LifeCycles = {};
export const setLifeCycle = (list: LifeCycles) => {
  lifeCycles = list;
};
export const getLifeCycle = () => {
  return lifeCycles;
};

//* 加载前
export const runBeforeLoad = async (app: InternalAppInfo) => {
  app.status = LifeStatus.LOADING;
  await runLifeCycle("beforeLoad", app);
  // *加载子应用资源
  // await app= loadHTML(app)
  app.status = LifeStatus.LOADED;
};
//* 初始化
export const runBoostrap = async (app: InternalAppInfo) => {
  if (app.status == LifeStatus.LOADED) {
    return app;
  }
  app.status = LifeStatus.BOOTSTRAPPING;
  await app.bootstrap?.(app);
  app.status = LifeStatus.NOT_MOUNTED;
};
//* 挂载app
export const runMounted = async (app: InternalAppInfo) => {
  app.status = LifeStatus.MOUNTING;

  await app.mount?.(app);
  app.status = LifeStatus.MOUNTED;
  await runLifeCycle("mounted", app);
};
//* 卸载app
export const runUnmounted = async (app: InternalAppInfo) => {
  app.status = LifeStatus.UNMOUNTING;
  await app.unmount?.(app);
  app.status = LifeStatus.NOT_MOUNTED;
  await runLifeCycle("unmounted", app);
};
//* 执行应用生命周期
const runLifeCycle = async (name: keyof LifeCycles, app: AppList) => {
  const fn = lifeCycles[name];
  if (fn instanceof Array) {
    await Promise.all(fn.map((item) => item(app)));
  } else {
    await fn?.(app);
  }
};
