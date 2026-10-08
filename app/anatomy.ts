// Regions are functional groupings of the brain, assigned by scripts/build-brain.mjs. 'skull' is a translucent context shell.
export type RegionId = 'frontal'|'parietal'|'temporal'|'occipital'|'limbic'|'basal-ganglia'|'diencephalon'|'brainstem'|'white-matter'|'ventricles'|'skull';
export const GHOST_REGION:RegionId = 'skull';
export const REGIONS: {id:RegionId;name:string;color:string;description:string}[] = [
 {id:'frontal',name:'Frontal cortex',color:'#ffb829',description:'Frontal gyri support planning, working memory, response inhibition, voluntary movement and the valuation of options.'},
 {id:'parietal',name:'Parietal cortex',color:'#3ed6b0',description:'Parietal cortex integrates touch, body position and space, and supports spatial attention, number processing and perspective-taking.'},
 {id:'temporal',name:'Temporal cortex',color:'#4aa3ff',description:'Temporal cortex supports hearing, language comprehension, object and face recognition, and semantic knowledge.'},
 {id:'occipital',name:'Occipital cortex',color:'#ff6b8b',description:'Occipital cortex receives visual input and builds the early representations of edges, motion and colour.'},
 {id:'limbic',name:'Limbic & paralimbic',color:'#ff7a45',description:'Limbic and paralimbic structures link emotion, memory, bodily state and motivation, and include the amygdala, hippocampus, cingulate cortex and insula.'},
 {id:'basal-ganglia',name:'Basal ganglia',color:'#9be564',description:'The basal ganglia select and gate actions, learn from outcomes, and automatise practised sequences into habit.'},
 {id:'diencephalon',name:'Thalamus & hypothalamus',color:'#f5a3ff',description:'The thalamus relays and gates information to cortex; the hypothalamus, with the pituitary and pineal glands, regulates drives, hormones and daily rhythm.'},
 {id:'brainstem',name:'Brainstem & cerebellum',color:'#9fb0c4',description:'The brainstem controls arousal and vital functions; the cerebellum refines movement, timing and learned prediction.'},
 {id:'white-matter',name:'White matter & tracts',color:'#e8e4d8',description:'White matter carries signals between regions, including the corpus callosum between hemispheres and the optic pathway from eye to thalamus.'},
 {id:'ventricles',name:'Ventricles & meninges',color:'#a8d8ff',description:'The ventricular system holds and circulates cerebrospinal fluid, which cushions the brain and clears waste.'},
 {id:'skull',name:'Glass skull',color:'#ffffff',description:'A translucent skull gives spatial context. It is hidden by default.'},
];
export interface Part {id:string;name:string;conceptId:string;system:RegionId;chunk:number;positions:number;normals:number;indices:number;vertexCount:number;indexCount:number;bounds:[number[],number[]]}
export interface Concept {id:string;name:string;elements:string[]}
export interface Atlas {version:string;sex?:'male';source?:string;scope?:string;parts:Part[];concepts:Concept[];chunks:{url:string;bytes:number;gzip?:string;gzipBytes?:number}[];triangles:number}
export type View = 'three-quarter'|'front'|'back'|'side';
export interface SceneState {inspectorOpen?:boolean;explode:number;visible:RegionId[];selected:string[];isolate:boolean;view:View;rotate:boolean;reset:number}
export const DEFAULT_VISIBLE:RegionId[] = REGIONS.filter(r=>r.id!==GHOST_REGION).map(r=>r.id);
/** Concept-level anatomical descriptions, keyed by lowercase concept name. Psychological roles live in psychology.json. */
export const EXPLANATIONS:Record<string,string> = {
 'brain':'The central organ of the nervous system, about 1.3 kg in adults. Its interconnected regions support perception, movement, memory, language, emotion and the regulation of bodily functions.',
 'cerebellum':'A densely folded structure behind the brainstem containing more neurons than the rest of the brain combined. It refines movement and contributes to timing and learned prediction.',
 'hippocampus':'A curved structure in the medial temporal lobe. It is essential for forming new episodic memories and for spatial navigation.',
 'amygdala':'An almond-shaped cluster of nuclei in the anterior medial temporal lobe. It evaluates the emotional significance of stimuli and shapes arousal and memory.',
 'thalamus':'A paired egg-shaped relay in the diencephalon. Nearly all sensory input, except smell, passes through it on the way to cortex.',
 'hypothalamus':'A small structure below the thalamus that regulates temperature, hunger, thirst, sleep and hormones through its control of the pituitary gland.',
 'insula':'Cortex folded deep within the lateral sulcus. It represents the body\'s internal state and contributes to taste, pain, empathy and awareness of feeling.',
 'corpus callosum':'The largest white-matter tract in the brain, containing roughly 200 million fibres that connect the two cerebral hemispheres.',
 'cingulate gyrus':'A band of cortex arching above the corpus callosum. It links emotion, attention, pain and memory.',
 'caudate nucleus':'A C-shaped basal-ganglia nucleus that arches over the thalamus. It contributes to learning, action selection and motivated behaviour.',
 'putamen':'The outer, lens-shaped basal-ganglia nucleus. Together with the globus pallidus it forms the lentiform nucleus and supports movement and habit.',
 'pituitary gland':'A pea-sized endocrine gland beneath the hypothalamus that releases hormones controlling growth, stress response, reproduction and metabolism.',
 'pineal body':'A small midline gland that secretes melatonin in response to the light-dark cycle.',
 'prefrontal cortex':'The frontal cortex anterior to the motor areas. It supports working memory, planning, inhibition and flexible, goal-directed behaviour.',
 'orbital gyrus':'Cortex on the underside of the frontal lobe, above the eye sockets. It represents value and helps regulate emotion and decisions.',
 'pons':'The bulge of the brainstem between the midbrain and medulla. It relays signals to the cerebellum and contributes to sleep and arousal.',
 'midbrain':'The uppermost part of the brainstem. It contains visual and auditory reflex centres and arousal and movement circuits.',
 'medulla oblongata':'The lowest part of the brainstem, which controls breathing, heart rate and reflexes such as swallowing.',
 'optic chiasm':'The X-shaped crossing of the optic nerves. Fibres from the nasal half of each retina cross to the opposite side.',
 'fornix of forebrain':'An arching white-matter bundle that is the main output pathway of the hippocampus.',
 'mammillary body':'A small paired nucleus at the base of the hypothalamus, part of the Papez memory circuit.',
};
export function explanation(name:string,region:RegionId){return EXPLANATIONS[name.toLowerCase().replace(/^(left|right) /,'')] ?? EXPLANATIONS[name.toLowerCase()] ?? REGIONS.find(s=>s.id===region)?.description ?? '';}
