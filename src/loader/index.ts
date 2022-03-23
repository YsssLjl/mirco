import { InternalAppInfo } from '../types'
import { importEntry } from 'import-html-entry'
import { ProxySandbox } from './sandbox'

export const loadHTML = async (app: InternalAppInfo) => {
  const { container, entry } = app

  const { template, getExternalScripts, getExternalStyleSheets } =
    await importEntry(entry)
  const dom = document.querySelector(container)

  if (!dom) {
    throw new Error('容器不存在')
  }

  dom.innerHTML = template
  await getExternalStyleSheets()
  const jsCode = await getExternalScripts()
  jsCode.forEach(script => {
    const lifeCycle = runJS(script, app)
    if (lifeCycle) {
      app.bootstrap = lifeCycle.bootstrap
      app.mount = lifeCycle.mount
      app.unmount = lifeCycle.unmount
    }
  })

  return app
}

const runJS = (value: string, app: InternalAppInfo) => {
  if (!app.proxy) {
    app.proxy = new ProxySandbox()
    // 将沙箱挂在全局属性上
    
  }
  // @ts-ignore
  window.__CURRENT_PROXY__ = app.proxy.proxy
  // 激活沙箱
  app.proxy.active()
  // 用沙箱替代全局环境调用 JS
  const code = `
    return (window => {
      ${value}
      return window['${app.name}']
    })(window.__CURRENT_PROXY__)
  `
  return new Function(code)()
}
