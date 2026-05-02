export function serializeBigInt(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'bigint') return Number(obj);
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  
  if (typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = serializeBigInt(obj[key]);
    }
    return newObj;
  }
  
  return obj;
}
