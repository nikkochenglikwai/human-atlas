// Confirms every psychology lens resolves to real meshes and carries the fields the UI and the reader depend on.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const atlas=JSON.parse(fs.readFileSync(new URL('../public/models/atlas.json',import.meta.url)));
const {lenses}=JSON.parse(fs.readFileSync(new URL('../app/psychology.json',import.meta.url)));
const regions=new Set(atlas.parts.map(p=>p.system));
const ids=new Set();let rules=0;
for(const l of lenses){
 assert.ok(!ids.has(l.id),`duplicate lens id ${l.id}`);ids.add(l.id);
 assert.ok(l.name?.trim().length>=5,`${l.id}: missing name`);
 for(const f of ['question','summary','notModeled','caution'])assert.ok(l[f]?.trim().length>20,`${l.id}: missing ${f}`);
 assert.ok(l.structures.length>=4,`${l.id}: needs at least 4 structures`);
 const hit=new Set();
 for(const s of l.structures){
  const re=new RegExp(s.match,'i');rules++;
  const matched=atlas.parts.filter(p=>p.system!=='skull'&&re.test(p.name));
  assert.ok(matched.length,`${l.id}: "${s.match}" matches no mesh`);
  assert.ok(s.role.trim().length>20,`${l.id}: role for "${s.match}" is too short`);
  matched.forEach(p=>hit.add(p.id));
 }
 assert.ok(hit.size>=4,`${l.id}: lens lights fewer than 4 meshes`);
 // Falsifiability and independence: a lens must carry evidence with a traceable source and a stated limit, never description alone.
 assert.ok(l.evidence.length>=2,`${l.id}: needs at least 2 evidence items`);
 for(const e of l.evidence){assert.ok(e.finding&&e.kind,`${l.id}: evidence missing finding/kind`);assert.match(e.source,/\b(1[89]|20)\d\d\b/,`${l.id}: evidence source needs a year: ${e.source}`);}
 assert.ok(l.conditions.length>=1,`${l.id}: needs a clinical or applied relevance entry`);
 console.log(`${l.name}: ${hit.size} meshes, ${l.evidence.length} evidence items`);
}
console.log(`Verified ${lenses.length} lenses and ${rules} structure rules against ${atlas.parts.length} meshes in ${regions.size} regions.`);
