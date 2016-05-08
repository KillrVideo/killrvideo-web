import R from 'ramda';

function appendToPath(pathSetVals, path) {
  let append = R.append(R.__, path);
  return R.map(append, pathSetVals);
}

function expandPath(depth, pathSet, path) {
  let curDepth = path.length - 1;
  if (curDepth > depth) {
    throw new Error(`Path is already expanded beyond depth ${depth}`);
  }
  
  let paths = R.of(path);
  while (curDepth < depth) {
    let append = R.partial(appendToPath, R.of(pathSet[curDepth + 1]));
    paths = R.chain(append, paths);
    curDepth++;
  }
  
  return paths;
}

export function expandPaths(depth, pathSet, paths) {
  let expand = R.partial(expandPath, [ depth, pathSet ]);
  return R.chain(expand, paths);
};

export function generatePaths(depth, pathSet) {
  let paths = [ [] ];
  return expandPaths(depth, pathSet, paths);
};