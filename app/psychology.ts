import data from './psychology.json';
import type {Part} from './anatomy';
export interface LensStructure {match:string;role:string}
export interface LensEvidence {finding:string;source:string;kind:string}
export interface LensCondition {name:string;note:string}
export interface Lens {id:string;name:string;question:string;summary:string;structures:LensStructure[];notModeled:string;evidence:LensEvidence[];conditions:LensCondition[];caution:string}
export const LENSES:Lens[]=data.lenses as Lens[];
const rules=new Map(LENSES.map(l=>[l.id,l.structures.map(s=>({test:new RegExp(s.match,'i'),role:s.role}))]));
/** The role a lens assigns to a mesh, or undefined when the lens does not involve it. First matching rule wins. */
export function roleIn(lens:Lens,partName:string){return rules.get(lens.id)?.find(r=>r.test.test(partName))?.role;}
/** Every mesh a lens involves, each with its role. */
export function lensParts(lens:Lens,parts:Part[]){return parts.flatMap(p=>{const role=roleIn(lens,p.name);return role?[{part:p,role}]:[];});}
/** Lenses that involve any of the given meshes. Skipped for large selections (e.g. the whole brain), where every lens would match. */
export function lensesFor(selected:Part[],limit=12){
 if(!selected.length||selected.length>limit)return [];
 return LENSES.flatMap(lens=>{for(const p of selected){const role=roleIn(lens,p.name);if(role)return [{lens,role}];}return [];});
}
