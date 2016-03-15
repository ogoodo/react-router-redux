/**
 * This action type will be dispatched when your history
 * receives a location change.
 */
export const LOCATION_CHANGE = '@@router/LOCATION_CHANGE'

const initialState = {
  locationBeforeTransitions: null
}

/**
 * This reducer will update the state with the most recent location history
 * has transitioned to. This may not be in sync with the router, particularly
 * if you have asynchronously-loaded routes, so reading from and relying on
 * this state it is discouraged.
 */
 /**
  * 简单的合并了action传过来的数据返回 by:ogoodo.com
  * @param payload[Object] 其实是个location对象
  */
export function routerReducer(state = initialState, { type, payload }) {
  if (type === LOCATION_CHANGE) {
    return { ...state, locationBeforeTransitions: payload }
  }

  return state
}
