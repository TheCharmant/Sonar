// Add this to your index.tsx file to enable more detailed console logging
if (import.meta.env.DEV) {
  console.log("Running in development mode - verbose logging enabled");
  
  // Log all localStorage operations
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    console.log(`localStorage.setItem('${key}', '${value.substring(0, 20)}...')`);
    originalSetItem.apply(this, arguments);
  };
  
  const originalGetItem = localStorage.getItem;
  localStorage.getItem = function(key) {
    const value = originalGetItem.call(this, key);
    console.log(`localStorage.getItem('${key}') => ${value ? `'${value.substring(0, 20)}...'` : 'null'}`);
    return value;
  };
  
  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function(key) {
    console.log(`localStorage.removeItem('${key}')`);
    originalRemoveItem.apply(this, arguments);
  };
}