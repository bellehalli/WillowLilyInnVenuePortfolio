/* V2 compatibility shim.
 * The existing dashboard in script.js is now the single dashboard owner.
 * This file intentionally does not inject a second lead card.
 */
document.addEventListener('DOMContentLoaded',()=>{
  if(!document.documentElement.matches('[data-page="venue-demo"]'))return;
  document.documentElement.dataset.liveSalesConnected='true';
});
