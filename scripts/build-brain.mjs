// Builds the brain & psychology atlas from the immutable BodyParts3D full-body source in raw/bodyparts3d.
// Selects brain-related meshes, assigns each to a functional region, rescales and recentres them for the viewer,
// and writes public/models/atlas.json plus one gzip-able binary chunk.  Run: node scripts/build-brain.mjs
import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
const raw=new URL('../raw/bodyparts3d/',import.meta.url),out=new URL('../public/models/',import.meta.url);
const src=JSON.parse(fs.readFileSync(new URL('atlas.json',raw)));
const chunks=src.chunks.map(c=>fs.readFileSync(new URL(c.url.split('/').pop(),raw)));
const SCALE=6;                       // brain ≈ 0.14 m wide in source; ×6 fills the existing stage and camera framing
const FLOOR=.22;                     // lowest point sits just above the platform so the brain floats on the void

// Region rules are ordered; the first match wins. Each rule is tested against the part name.
const EXCLUDE=/ciliary|ethmoidal|lacrimal|infratrochlear|supratrochlear|supra-orbital|frontal nerve|nasociliary|ophthalmic|trochlear nerve|oculomotor/i;
const RULES=[
 ['skull',     p=>p.system==='skeletal'&&/^(Frontal bone|(Left|Right) parietal bone|(Left|Right) temporal bone|Occipital bone|Sphenoid bone)$/.test(p.name)],
 ['ventricles',p=>/^(Third|Fourth) ventricle$|^(Left|Right) lateral ventricle$|^Interventricular foramen$|choroid plexus|cerebral aqueduct|central canal|tentorium/i.test(p.name)],
 ['frontal',   p=>p.system==='nervous'&&/frontal gyrus|precentral gyrus|orbital gyrus/i.test(p.name)],
 ['parietal',  p=>p.system==='nervous'&&/postcentral gyrus|parietal lobule|supramarginal|angular gyrus/i.test(p.name)],
 ['temporal',  p=>p.system==='nervous'&&/temporal gyrus|fusiform gyrus/i.test(p.name)],
 ['occipital', p=>p.system==='nervous'&&/occipital lobe/i.test(p.name)],
 ['limbic',    p=>p.system==='nervous'&&/amygdala|hippocampus|cingulate|parahippocampal|insula|fornix|septum|mammillary|stria terminalis/i.test(p.name)],
 ['basal-ganglia',p=>p.system==='nervous'&&/caudate|putamen|globus pallidus/i.test(p.name)],
 ['diencephalon',p=>(p.system==='nervous'&&/thalamus|hypothalamus|habenula|geniculate|tuber cinereum|lamina terminalis|stria medullaris/i.test(p.name))||(p.system==='endocrine'&&/^(Pineal body|Pituitary gland)$/.test(p.name))],
 ['brainstem', p=>p.system==='nervous'&&/cerebellum|midbrain|pons|medulla|colliculus|brachium|interpeduncular|peduncle/i.test(p.name)],
 ['white-matter',p=>p.system==='nervous'&&/corpus callosum|internal capsule|commissure|white matter|optic (nerve|chiasm|tract)/i.test(p.name)],
];
const regionOf=p=>{if(p.system==='nervous'&&EXCLUDE.test(p.name))return null;for(const [id,test] of RULES)if(test(p))return id;return null;};

const kept=src.parts.map(p=>({p,region:regionOf(p)})).filter(x=>x.region);
const unassigned=src.parts.filter(p=>p.system==='nervous'&&!EXCLUDE.test(p.name)&&!regionOf(p));
if(unassigned.length)throw new Error('Unassigned nervous-system meshes: '+unassigned.map(p=>p.name).join(', '));

// Bounds of the whole kept set (before transform) → centre x/z on the origin, lift the lowest point to FLOOR.
const lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];
for(const {p} of kept)for(let i=0;i<3;i++){lo[i]=Math.min(lo[i],p.bounds[0][i]);hi[i]=Math.max(hi[i],p.bounds[1][i]);}
const shift=[-(lo[0]+hi[0])/2,-lo[1],-(lo[2]+hi[2])/2];
const tf=(v,i)=>(v+shift[i])*SCALE+(i===1?FLOOR:0);

const parts=[],buffers=[];let offset=0,triangles=0;
for(const {p,region} of kept){
 const b=chunks[p.chunk],at=b.byteOffset;
 const pos=new Float32Array(p.vertexCount*3);const srcPos=new Float32Array(b.buffer,at+p.positions,p.vertexCount*3);
 for(let i=0;i<pos.length;i++)pos[i]=tf(srcPos[i],i%3);
 const normalBytes=p.vertexCount*3*2,normals=Buffer.alloc((normalBytes+3)&~3);   // Int16 normals are scale-invariant; pad so the Uint32 index buffer stays 4-byte aligned
 Buffer.from(b.buffer,at+p.normals,normalBytes).copy(normals);
 const indices=Buffer.from(b.buffer,at+p.indices,p.indexCount*4);
 const posBytes=Buffer.from(pos.buffer);
 const entry={...p,system:region,chunk:0,positions:offset,normals:offset+posBytes.length,indices:offset+posBytes.length+normals.length,bounds:[p.bounds[0].map((v,i)=>tf(v,i)),p.bounds[1].map((v,i)=>tf(v,i))]};
 buffers.push(posBytes,normals,indices);offset+=posBytes.length+normals.length+indices.length;triangles+=p.indexCount/3;parts.push(entry);
}
fs.mkdirSync(out,{recursive:true});
const bin=Buffer.concat(buffers);
if(bin.length!==offset)throw new Error('offset mismatch');
const ids=new Set(parts.map(p=>p.id));
// Keep a concept only when most of its source elements are in scope, so search never implies a body-wide structure is brain-only.
// Abstract ontology scaffolding (e.g. 'cell part cluster', 'zone of neuraxis') is not useful search vocabulary.
const NOISE=/^(anatomical|cell part|organ component|internal gray|nuclear complex|nucleus of (brain|neuraxis)|segment of|subdivision|region of|space of|zone of|lamina of|lobe of|lobule of|gyrus of|gray matter of neuraxis|nerve trunk|neuraxis|spinal cord|nervous system|cavity of|circumventricular|stria of|commissure of neuraxis|fornix of neuraxis|brachium of neuraxis|peduncle of neuraxis|capsule of|head proper|basicranial|frontal part|parietal part|occipital part|left parietal part|right parietal part|subarachnoid|cardinal|white matter of neuraxis|septum of neuraxis)/i;
let concepts=src.concepts.map(c=>({...c,all:c.elements.length,elements:c.elements.filter(id=>ids.has(id))})).filter(c=>c.elements.length&&c.elements.length/c.all>=.8).map(({id,name,elements})=>({id,name,elements})).filter(c=>!NOISE.test(c.name));
const covered=new Set(concepts.flatMap(c=>c.elements));
for(const p of parts)if(!concepts.some(c=>c.id===p.conceptId)&&!covered.has(p.id))concepts.push({id:p.conceptId,name:p.name,elements:[p.id]});
const gz=gzipSync(bin,{level:9});
fs.writeFileSync(new URL('brain-0.bin',out),bin);fs.writeFileSync(new URL('brain-0.bin.gz',out),gz);
const atlas={version:'BodyParts3D 4.0 · brain subset',sex:'male',source:'BodyParts3D',scope:'Adult male reference brain, ventricles and glass skull · '+parts.length+' source meshes',parts,concepts,
 chunks:[{url:'models/brain-0.bin',bytes:bin.length,gzip:'models/brain-0.bin.gz',gzipBytes:gz.length}],triangles,
 optimized:src.optimized,transform:{scale:SCALE,shift,floor:FLOOR}};
fs.writeFileSync(new URL('atlas.json',out),JSON.stringify(atlas));
const byRegion={};for(const p of parts)byRegion[p.system]=(byRegion[p.system]??0)+1;
console.log(`${parts.length} meshes, ${concepts.length} concepts, ${triangles.toLocaleString()} triangles, ${(gz.length/1e6).toFixed(1)} MB compressed`,byRegion);
