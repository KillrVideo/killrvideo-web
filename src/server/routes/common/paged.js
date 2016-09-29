import R from 'ramda';

import { toAtom, isError } from './sentinels';
import { getFirstArrayProp } from './props';

// Drop index and token from path
const getPathForListFromIndexPath = R.dropLast(2);

// Concat list path with _
const getPagingCacheKeyForIndexPath = R.pipe(getPathForListFromIndexPath, R.join('_'));

const getValuesForGroupsBy = R.pipe(R.mapObjIndexed, R.values);

function getPagingStateIndex(pagingStates, path) {
  let index = R.last(path);
  return R.findLastIndex(ps => index >= ps.startingIndex, pagingStates);
}

function getPagesForCacheKey(pagingStateCache, paths, cacheKey) {
  // Figure out the index in paging states for each path
  let pagingStates = pagingStateCache.getKey(cacheKey);
  let pagingStateIndex = R.partial(getPagingStateIndex, [ pagingStates ]);
  let pathsByPsIdx = R.groupBy(pagingStateIndex, paths);
  
  // Get a page for each group of paths by paging state index
  let page = R.partial(getPage, [ pagingStates ]);
  return getValuesForGroupsBy(page, pathsByPsIdx);
}

function getPage(pagingStates, paths, psIdx) {
  let { startingIndex, pagingState } = pagingStates[psIdx];
  return { paths, startingIndex, pagingState };
}

function getRequestFromPage(createRequestFn, page) {
  // Pick a single path (the last one) from the paths on the page and use it to create a request object
  let lastPath = R.last(page.paths);
  let request = createRequestFn(R.dropLast(1, lastPath));
  
  // Get the index from the path
  let lastIndex = R.last(lastPath);
  
  // Add paging state info to request object
  request.pagingState = page.pagingState;
  request.pageSize = lastIndex - page.startingIndex + 1;
  return request;
}

export function getPages(pagingStateCache, paths) {
  let pathsByCacheKey = R.groupBy(getPagingCacheKeyForIndexPath, paths);
  let pages = R.partial(getPagesForCacheKey, [ pagingStateCache ]);
  return R.unnest(getValuesForGroupsBy(pages, pathsByCacheKey));
};

export function createRequests(createRequestFn, pages) {
  let getRequest = R.partial(getRequestFromPage, [ createRequestFn ]);
  return R.map(getRequest, pages);
};

export function pickResponseValuesForPage(pagingStateCache, page, response) {
  if (isError(response)) {
    return R.map(R.always(response), page.paths);
  }

  // Find the array of things in the response
  let responseValues = getFirstArrayProp(response);

  // Save the paging state
  if (response.pagingState !== '') {
    // Find the last path we requested and get the index that it was requested as
    let lastPathOnPage = R.last(page.paths);
    let lastIndexOnPage = R.last(lastPathOnPage);

    // Calculate the cache key from the path
    let cacheKey = getPagingCacheKeyForIndexPath(lastPathOnPage);

    // Save in paging state cache using the cache key and the last index + 1 since that would be
    // the starting index for that page
    pagingStateCache.saveKey(cacheKey, lastIndexOnPage + 1, response.pagingState);
  }
  
  // Map each path to its object in the response taking into account the starting index for
  // the page that was requested
  return R.map(path => {
    let adjustedIdx = R.last(path) - page.startingIndex;
    return adjustedIdx >= responseValues.length
      ? toAtom()
      : responseValues[adjustedIdx];
  }, page.paths);
};