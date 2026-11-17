// Public destinations shared by navigation, page templates and browser titles.
export const sections=Object.freeze({
 home:'Home', projects:'Projects', photos:'Photos', resume:'Résumé', contact:'Contact'
});
export const sectionIds=Object.freeze(Object.keys(sections));
export const sectionAliases=Object.freeze({content:'photos',about:'contact',work:'projects',outside:'photos',experience:'resume'});
export function normaliseSection(view){
 const canonical=Object.hasOwn(sectionAliases,view)?sectionAliases[view]:view;
 return Object.hasOwn(sections,canonical)?canonical:'home';
}
export function browsingLabel(view,photoTab){
 return view==='photos'?(photoTab==='all'?'content item':photoTab==='videos'?'video':'photograph')
  :view==='projects'?'project':'section';
}
