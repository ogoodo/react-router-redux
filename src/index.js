
/**
 * 导出模块的方法  by:ogoodo.com
 */
export syncHistoryWithStore from './sync'
export { LOCATION_CHANGE, routerReducer } from './reducer'

export {
  CALL_HISTORY_METHOD,
  push, replace, go, goBack, goForward,
  routerActions
} from './actions'
export routerMiddleware from './middleware'
