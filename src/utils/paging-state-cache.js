/**
 * A wrapper around express session that provides an API for dealing with paging state.
 */
export default class PagingStateCache {
  constructor(req) {
    this._req = req;
  }
  
  /**
   * Gets an array of paging state objects for the given key, ordered by the startingIndex.
   */
  getKey(key) {
    let sess = this._req.session;
    let psObject = sess[key];
    
    // We always have at least the 0 index empty paging state
    let basePagingState = [ { startingIndex: 0, pagingState: '' } ];
    if (!psObject) {
      return basePagingState;
    }
    
    return basePagingState.concat(Object.keys(psObject).map(idxStr => {
        return { startingIndex: parseInt(idxStr), pagingState: psObject[idxStr] };
      }))
      .sort((a, b) => { return a.startingIndex - b.startingIndex; });
  }
  
  /**
   * Clears paging state for the given key.
   */
  clearKey(key) {
    let sess = this._req.session;
    delete sess[key];
  }
  
  /**
   * Saves the paging state token and starting index to the cache for the given key.
   */
  saveKey(key, startingIndex, pagingState){
    let sess = this._req.session;
    let psObject = sess[key];
    if (!psObject) {
      psObject = {};
      sess[key] = psObject;
    }
    
    psObject[startingIndex] = pagingState;
  }
};