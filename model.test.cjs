const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../demo-model.js');
const now='2026-09-15';
test('primary wedding recovers a reserved weekend with October 23',()=>{
 const w=M.normalize({ceremony:'Riverside',guestCount:125,package:'Full Weekend',eveningPreferences:['Dancing','Bonfire'],season:'Autumn',originalDate:'2027-10-16',selectedDate:'2027-10-16'});
 assert.equal(w.investment,14000);assert.equal(w.inn,true);assert.equal(M.packages[w.package].nights,2);
 assert.equal(M.check(w.originalDate,w.package,now).status,'RESERVED');
 const alternatives=M.alternatives(w.originalDate,w.package,{now});
 assert.equal(alternatives[0].date,'2027-10-23');assert.equal(alternatives.length,3);
 assert.ok(alternatives.every(a=>a.status==='AVAILABLE'));
 const accepted=M.normalize({...w,selectedDate:alternatives[0].date});
 assert.equal(accepted.originalDate,'2027-10-16');assert.equal(accepted.guestCount,125);
 assert.deepEqual(accepted.eveningPreferences,['Dancing','Bonfire']);
});
test('holds and reservations apply to every day of a package weekend',()=>{
 for(const [date,pkg,status] of [['2027-10-09','Full Weekend','COURTESY HOLD'],['2027-10-08','One Day','COURTESY HOLD'],['2027-10-10','Sunday','COURTESY HOLD'],['2027-10-17','Sunday','RESERVED']])assert.equal(M.check(date,pkg,now).status,status);
});
test('invalid, past, incompatible and unlisted dates never claim availability',()=>{
 for(const [date,pkg,status] of [['2027-02-30','Full Weekend','INVALID'],['2026-09-12','Full Weekend','PAST'],['2027-10-23','Sunday','INCOMPATIBLE'],['2028-10-21','Full Weekend','UNLISTED']])assert.equal(M.check(date,pkg,now).status,status);
});
test('flexible results honor season and package weekdays',()=>{
 for(const pkg of Object.keys(M.packages))for(const season of M.seasons){const dates=M.alternatives(null,pkg,{season,now});assert.ok(dates.length);for(const a of dates){assert.equal(M.seasonOf(a.date),season);assert.equal(M.check(a.date,pkg,now).status,'AVAILABLE');}}
});
test('shared wedding whitelist derives price and discards contacts or invalid options',()=>{
 const w=M.normalize({package:'Sunday',investment:1,inn:false,guestCount:999,ceremony:'Invalid',email:'private@example.com',eveningPreferences:['Bonfire','Unknown','Bonfire']});
 assert.equal(w.investment,8000);assert.equal(w.guestCount,125);assert.equal(w.ceremony,null);assert.equal(w.email,undefined);assert.deepEqual(w.eveningPreferences,['Bonfire']);assert.equal(M.packages[w.package].nights,0);
});
test('calendar preserves selected Saturday and each tour time in Michigan timezone',()=>{
 const dates=M.tourDates(now);assert.equal(dates[0],'2026-09-19');assert.equal(dates.length,6);
 for(const [time,hour] of [['11:00 AM','11'],['12:00 PM','12'],['1:00 PM','13']]){const text=M.calendar({requestedDate:dates[0],requestedTime:time},'test');assert.ok(text.includes('DTSTART;TZID=America/Detroit:20260919T'+hour+'0000'));assert.ok(text.includes('STATUS:TENTATIVE'));}
 assert.throws(()=>M.calendar({requestedDate:'2026-09-20',requestedTime:'12:00 PM'}));
});
