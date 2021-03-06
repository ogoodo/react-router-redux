import { LOCATION_CHANGE } from './reducer'

const defaultSelectLocationState = state => state.routing
// 这文件还要看看 by:ogoodo.com
/**
 * This function synchronizes your history state with the Redux store.
 * Location changes flow from history to the store. An enhanced history is
 * returned with a listen method that responds to store updates for location.
 *
 * When this history is provided to the router, this means the location data
 * will flow like this:
 * history.push -> store.dispatch -> enhancedHistory.listen -> router
 * This ensures that when the store state changes due to a replay or other
 * event, the router will be updated appropriately and can transition to the
 * correct router state.
 */
 /**
  * 这个函数同步你的history state到Redux store
  * location改变会从history同步到store,
  * 一个增强的history会被返回， 包括一个listen方法能回调侦听到loaction更新store
  *
  * history提供到router时, location数据将这样流动:
  * history.push -> store.dispatch -> enhancedHistory.listen -> router
  * 这确保, replay或者其它event引起store state改变时, 路由将被刷新并且能转换到正确的router state
  * by:ogoodo.com
  */
  /**
   * 作用:  替换(hook)history的几个方法(listen, unsubscribe这两个), 就可以插入自己的逻辑了  by:ogoodo.com
   */
export default function syncHistoryWithStore(history, store, {
  selectLocationState = defaultSelectLocationState,
  adjustUrlOnReplay = true
} = {}) {
  // Ensure that the reducer is mounted on the store and functioning properly.
  if (typeof selectLocationState(store.getState()) === 'undefined') {
    throw new Error(
      'Expected the routing state to be available either as `state.routing` ' +
      'or as the custom expression you can specify as `selectLocationState` ' +
      'in the `syncHistoryWithStore()` options. ' +
      'Ensure you have added the `routerReducer` to your store\'s ' +
      'reducers via `combineReducers` or whatever method you use to isolate ' +
      'your reducers.'
    )
  }

  let initialLocation
  let currentLocation
  let isTimeTraveling
  let unsubscribeFromStore
  let unsubscribeFromHistory

  // What does the store say about current location?
  // 默认是返回 store.getState().routing.locationBeforeTransitions
  const getLocationInStore = (useInitialIfEmpty) => {
    const locationState = selectLocationState(store.getState())
    return locationState.locationBeforeTransitions ||
      (useInitialIfEmpty ? initialLocation : undefined)
  }

  // If the store is replayed, update the URL in the browser to match.
  // store重播, 更新浏览器到匹配的url
  if (adjustUrlOnReplay) {
    //订阅store改变
    const handleStoreChange = () => {
      const locationInStore = getLocationInStore(true)
      if (currentLocation === locationInStore) {
        return
      }

      // Update address bar to reflect store state
      // 更新地址栏以反映store state
      isTimeTraveling = true
      currentLocation = locationInStore
      history.transitionTo({
        ...locationInStore,
        action: 'PUSH'
      })
      isTimeTraveling = false
    }

    unsubscribeFromStore = store.subscribe(handleStoreChange)
    handleStoreChange()
  }

  // Whenever location changes, dispatch an action to get it in the store
  // 当location改变,  调用store.dispatch发送个action出去
  const handleLocationChange = (location) => {
    // ... unless we just caused that location change
    if (isTimeTraveling) {
      return
    }

    // Remember where we are
    currentLocation = location

    // Are we being called for the first time?
    if (!initialLocation) {
      // Remember as a fallback in case state is reset
      initialLocation = location

      // Respect persisted location, if any
      if (getLocationInStore()) {
        return
      }
    }

    // Tell the store to update by dispatching an action
    // 触发action， 通知更新store
    // 将loaction存到store.getState().routing.locationBeforeTransitions 路径下
    // 这个是连接store 和 router的桥梁  by:ogoodo.com         重点       重点       重点
    store.dispatch({
      type: LOCATION_CHANGE,
      payload: location
    })
  }
  // 这里以后要了解下history.listen  怎么来的           看          看          看
  unsubscribeFromHistory = history.listen(handleLocationChange)

  // The enhanced history uses store as source of truth
  return {
    ...history,
    // The listeners are subscribed to the store instead of history
    listen(listener) {
      // Copy of last location.
      let lastPublishedLocation = getLocationInStore(true)

      // Keep track of whether we unsubscribed, as Redux store
      // only applies changes in subscriptions on next dispatch
      let unsubscribed = false
      const unsubscribeFromStore = store.subscribe(() => {
        const currentLocation = getLocationInStore(true)
        if (currentLocation === lastPublishedLocation) {
          return
        }
        lastPublishedLocation = currentLocation
        if (!unsubscribed) {
          // 这里回掉react-router     重点     重点     重点
          listener(lastPublishedLocation)
        }
      })

      // History listeners expect a synchronous call. Make the first call to the
      // listener after subscribing to the store, in case the listener causes a
      // location change (e.g. when it redirects)
      listener(lastPublishedLocation)

      // Let user unsubscribe later
      return () => {
        unsubscribed = true
        unsubscribeFromStore()
      }
    },

    // It also provides a way to destroy internal listeners
    unsubscribe() {
      if (adjustUrlOnReplay) {
        unsubscribeFromStore()
      }
      unsubscribeFromHistory()
    }
  }
}
