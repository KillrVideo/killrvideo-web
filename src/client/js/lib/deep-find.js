export function deepFind(key, obj) {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }
  
  let objs = [ obj ];
  let nextObjs = [];
  let found = false;
  let val;
  
  // Breadth first search for an object property with the specified key
  while (objs.length > 0) {
    for (let curObj of objs) {
      for (let prop in curObj) {
        val = curObj[prop];
        if (prop === key) {
          found = true;
          break;
        }
        
        if (typeof val === 'object' && val !== null) {
          nextObjs.push(val);
        }
      }
      
      if (found === true) {
        break;
      }
    }
    
    if (found === true) {
      break;
    }
    
    objs = nextObjs;
    nextObjs = [];
  }
  
  if (found === true) return val;
};