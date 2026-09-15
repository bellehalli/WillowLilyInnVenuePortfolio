/* Willow Lily linework. Small, self-contained SVGs; no icon font or network request. */
(() => {
 const paths={
  arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
  calendar:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4m8-4v4M4 10h16m-11 4h2m3 0h2m-7 3h2"/>',
  heart:'<path d="M20.3 5.7a5.2 5.2 0 0 0-7.4 0L12 6.8l-.9-1.1a5.2 5.2 0 0 0-7.4 7.3L12 21l8.3-8a5.2 5.2 0 0 0 0-7.3Z"/>',
  check:'<path d="m5 12 4 4L19 6"/><circle cx="12" cy="12" r="10"/>',
  people:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v3"/>',
  key:'<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-5-5 3-3m-6 0 3-3"/>',
  leaf:'<path d="M20 3C8 2 2 7 5 15c8 5 16-1 15-12ZM3 21 16 8"/>',
  water:'<path d="M2 8q2.5-3 5 0t5 0 5 0 5 0M2 13q2.5-3 5 0t5 0 5 0 5 0M2 18q2.5-3 5 0t5 0 5 0 5 0"/>',
  house:'<path d="m3 10 9-7 9 7v11H3Zm6 11v-8h6v8M7 10h1m8 0h1"/>',
  fire:'<path d="M13 2c2 6-4 7-2 11 2-1 3-3 3-5 7 6 6 14-2 14C3 22 2 14 7 9c-1 4 1 5 2 6-2-6 5-8 4-13Z"/>',
  music:'<path d="M9 18V5l11-2v13M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>',
  pin:'<path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  share:'<path d="M12 16V3m-4 4 4-4 4 4M5 13v8h14v-8"/>',
  edit:'<path d="m4 16 11-11 4 4L8 20l-5 1Zm11-11 2-2a2 2 0 0 1 3 3l-1 3"/>',
  compare:'<path d="M8 3H3v18h5M16 3h5v18h-5M12 2v20M6 8h2m8 0h2M6 13h2m8 0h2"/>',
  menu:'<path d="M3 7h18M3 12h12M3 17h18"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>'
 };
 window.WillowIcons={render(name){return '<svg class="wl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+(paths[name]||paths.arrow)+'</svg>';}};
})();
