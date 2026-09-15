/* Pure demo domain model. Replace availabilityProvider with server-backed inventory in production. */
(function(root) {
  'use strict';
  const packages = {
    Sunday: { price: 8000, days: [0], time: 'Sunday · 1 PM–11 PM', inn: 'Daytime Inn access · 1 PM–11 PM', nights: 0 },
    'One Day': { price: 10000, days: [5,6], time: 'Wedding day · 9 AM–midnight', inn: 'Daytime Inn access · 9 AM–midnight', nights: 0 },
    'Full Weekend': { price: 14000, days: [6], time: 'Friday 11 AM through Sunday 11 AM', inn: 'Two Inn nights · sleeps six', nights: 2 }
  };
  const ceremonies = ['Woods','Riverside','Courtyard','Covered Bridge'];
  const seasons = ['Spring','Summer','Autumn','Winter'];
  const evenings = ['Dancing','Bonfire','Lawn Games'];
  const parse = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const date = new Date(value+'T12:00:00Z');
    return Number.isFinite(+date) && date.toISOString().slice(0,10) === value ? date : null;
  };
  const iso = date => date.toISOString().slice(0,10);
  const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'America/Detroit',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const seasonOf = date => { const m = parse(date)?.getUTCMonth(); return m == null ? null : m<2||m===11?'Winter':m<5?'Spring':m<8?'Summer':'Autumn'; };
  const inventory = new Map();
  for(let d=new Date('2027-01-01T12:00:00Z');d.getUTCFullYear()===2027;d.setUTCDate(d.getUTCDate()+1)) {
    if([0,5,6].includes(d.getUTCDay())) inventory.set(iso(d),'AVAILABLE');
  }
  // Holds/reservations occupy the entire estate weekend, across every package.
  for(const [day,status] of [['2027-10-16','RESERVED'],['2027-10-09','COURTESY HOLD']]) {
    for(const offset of [-1,0,1]) { const d=parse(day); d.setUTCDate(d.getUTCDate()+offset); inventory.set(iso(d),status); }
  }
  const check = (date,pkg,now=today()) => {
    const d=parse(date), p=packages[pkg];
    if(!d||!p) return {date,status:'INVALID',message:'Choose a valid date and experience.'};
    if(date<=now) return {date,status:'PAST',message:'Choose a future wedding date.'};
    if(!p.days.includes(d.getUTCDay())) return {date,status:'INCOMPATIBLE',message:pkg==='Sunday'?'Sunday weddings take place on Sundays.':pkg==='Full Weekend'?'Choose the Saturday of your Full Weekend.':'One Day weddings take place on Fridays or Saturdays.'};
    return {date,status:inventory.get(date)||'UNLISTED',message:inventory.has(date)?'':'This date is outside our 2027 demonstration calendar.'};
  };
  const alternatives = (date,pkg,{season=null,now=today(),limit=3}={}) => [...inventory.keys()]
    .filter(d=>d!==date && check(d,pkg,now).status==='AVAILABLE' && (!season||seasonOf(d)===season))
    .sort((a,b)=>Math.abs(+parse(a)-+(parse(date)||parse('2027-10-16')))-Math.abs(+parse(b)-+(parse(date)||parse('2027-10-16'))) || b.localeCompare(a))
    .slice(0,limit).map(d=>({...check(d,pkg,now),package:pkg}));
  const normalize = (w={}) => {
    const pkg=Object.hasOwn(packages,w.package)?w.package:'Full Weekend';
    const count=Number(w.guestCount);
    return {ceremony:ceremonies.includes(w.ceremony)?w.ceremony:null,guestCount:[75,125,160].includes(count)?count:125,guestRange:count===75?'Up to 75':count===160?'126–160':'75–125',package:pkg,investment:packages[pkg].price,inn:true,eveningPreferences:Array.isArray(w.eveningPreferences)?evenings.filter(e=>w.eveningPreferences.includes(e)):[],season:seasons.includes(w.season)?w.season:'Autumn',dateMode:w.dateMode==='flexible'?'flexible':'exact',originalDate:parse(w.originalDate)?w.originalDate:null,selectedDate:parse(w.selectedDate)?w.selectedDate:null};
  };
  const tourDates = (now=today()) => { const d=parse(now); const out=[]; for(let i=0;i<45&&out.length<6;i++){d.setUTCDate(d.getUTCDate()+1);if(d.getUTCDay()===6)out.push(iso(d));}return out; };
  const times=['11:00 AM','12:00 PM','1:00 PM'];
  const calendar = (tour,id='demo') => {
    if(!parse(tour.requestedDate)||parse(tour.requestedDate).getUTCDay()!==6||!times.includes(tour.requestedTime))throw new Error('Invalid tour slot');
    const hour={'11:00 AM':'11','12:00 PM':'12','1:00 PM':'13'}[tour.requestedTime], day=tour.requestedDate.replaceAll('-','');
    return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//A Halliwell Studio//Willow Lily Demo//EN','CALSCALE:GREGORIAN','BEGIN:VTIMEZONE','TZID:America/Detroit','BEGIN:STANDARD','DTSTART:19701101T020000','RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU','TZOFFSETFROM:-0400','TZOFFSETTO:-0500','TZNAME:EST','END:STANDARD','BEGIN:DAYLIGHT','DTSTART:19700308T020000','RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU','TZOFFSETFROM:-0500','TZOFFSETTO:-0400','TZNAME:EDT','END:DAYLIGHT','END:VTIMEZONE','BEGIN:VEVENT','UID:'+id.replace(/[^a-zA-Z0-9-]/g,'')+'@willow-lily.example','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z'),'DTSTART;TZID=America/Detroit:'+day+'T'+hour+'0000','DTEND;TZID=America/Detroit:'+day+'T'+String(Number(hour)+1)+'0000','SUMMARY:Willow Lily private tour - DEMO REQUEST','STATUS:TENTATIVE','DESCRIPTION:Fictional demonstration. No real appointment has been scheduled.','LOCATION:Fenton Michigan - fictional venue','END:VEVENT','END:VCALENDAR'].join('\r\n');
  };
  const api={packages,ceremonies,seasons,evenings,parse,iso,today,seasonOf,check,alternatives,normalize,tourDates,times,calendar};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WillowModel=api;
})(typeof window==='undefined'?{}:window);
