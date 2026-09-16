(() => {'use strict';
const season=document.querySelector('.season-context');
if(season){
 const paragraphs=[...season.querySelectorAll('p')];
 const note=paragraphs.find(p=>p.textContent.includes('surveyed property map'));
 if(note)note.textContent='A visual guide to how the fictional Willow Lily estate is imagined to flow from ceremony through after dark.';
 const kicker=document.querySelector('.explorer-intro .kicker');
 if(kicker)kicker.textContent='Illustrated estate guide';
}
})();