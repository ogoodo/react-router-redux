import { CALL_HISTORY_METHOD } from './actions'

/**
 * This middleware captures CALL_HISTORY_METHOD actions to redirect to the
 * provided history object. This will prevent these actions from reaching your
 * reducer or any middleware that comes after this one.
 */
 /**
  * 针对CALL_HISTORY_METHOD, 会调用history的方法 by:ogoodo
  */
export default function routerMiddleware(history) {
  return () => next => action => {
    if (action.type !== CALL_HISTORY_METHOD) {
      return next(action)
    }

    const { payload: { method, args } } = action
    history[method](...args)
  }
}
