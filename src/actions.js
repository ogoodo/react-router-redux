/**
 * This action type will be dispatched by the history actions below.
 * If you're writing a middleware to watch for navigation events, be sure to
 * look for actions of this type.
 */
export const CALL_HISTORY_METHOD = '@@router/CALL_HISTORY_METHOD'

function updateLocation(method) {
  return (...args) => ({
    type: CALL_HISTORY_METHOD,
    payload: { method, args }
  })
}

/**
 * These actions correspond to the history API.
 * The associated routerMiddleware will capture these events before they get to
 * your reducer and reissue them as the matching function on your history.
 */
export const push = updateLocation('push')
export const replace = updateLocation('replace')
export const go = updateLocation('go')
export const goBack = updateLocation('goBack')
export const goForward = updateLocation('goForward')

/**
 * 导出几个操作路由的action  by:ogoodo.com
 * 通过提供的中间件, 绑定到 history[method](...args) 这样子调用
 */
export const routerActions = { push, replace, go, goBack, goForward }
