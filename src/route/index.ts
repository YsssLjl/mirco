import { EventType } from "src/types";
import { getAppListStatus } from "src/utils";
import {
  runUnmounted,
  runBeforeLoad,
  runBoostrap,
  runMounted,
} from "../lifeCycle/index";
//*劫持history和hash相关事件 在劫持后做处理子应用相关的逻辑
const originPush = window.history.pushState;
const originReplace = window.history.replaceState;
// *存储原本路由相关事件逻辑
const captureListener: Record<EventType, Function[]> = {
  hashchange: [],
  popstate: [],
};
// *存储上次页面地址
let lastUrl: string | URL | null = null;

// *判断是否在回调队列里
const hasListeners = (name: EventType, callback: Function): boolean => {
  return !!captureListener[name].filter((cb) => cb == callback).length;
};

let historyEvent: PopStateEvent | null = null;
// *重写路由
export const rewriteRoute = (url: string | URL | undefined | null) => {
  //*主应用生命周期
  if (url !== lastUrl) {
    const { actives, unmounts } = getAppListStatus();
    Promise.all(
      unmounts
        .map(async (app) => {
          await runUnmounted(app);
        })
        .concat(
          actives.map(async (app) => {
            await runBeforeLoad(app);
            await runBoostrap(app);
            await runMounted(app);
          })
        )
    ).then(() => {
      callCapturedListeners();
    });
  }
  lastUrl = url || location.href;
};

const handleUrlChange = () => {
  rewriteRoute(location.href);
};

// *拦截路由
export const hijackRoute = () => {
  //* 重写方法
  window.history.pushState = (...args) => {
    originPush.apply(window.history, args);
    historyEvent = new PopStateEvent("popstate");
    args[2] && rewriteRoute(args[2]);
  };
  window.history.pushState = (...args) => {
    originReplace.apply(window.history, args);
    historyEvent = new PopStateEvent("popstate");
    args[2] && rewriteRoute(args[2]);
  };

  window.addEventListener("hashchange", handleUrlChange);
  window.addEventListener("popstate", handleUrlChange);

  // *兼容原本事件相关逻辑
  window.addEventListener = hijackEventListener(window.addEventListener);
  window.removeEventListener = hijackEventListener(window.removeEventListener);
};

// *拦截监听
const hijackEventListener = (fn: Function): any => {
  return function (name: string, callback: Function) {
    if (name === "hashchange" || name === "popstate") {
      if (!hasListeners(name, callback)) {
        captureListener[name].push(callback);
        return;
      } else {
        captureListener[name] = captureListener[name].filter(
          (cb) => cb !== callback
        );
      }
    }
    return fn.apply(window, arguments);
  };
};
export function callCapturedListeners() {
  if (historyEvent) {
    Object.keys(captureListener).forEach((eventName) => {
      const listeners = captureListener[eventName as EventType];
      if (listeners.length) {
        listeners.forEach((listener) => {
          // @ts-ignore
          listener.call(this, historyEvent);
        });
      }
    });
    historyEvent = null;
  }
}
