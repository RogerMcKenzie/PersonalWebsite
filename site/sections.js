// Public destinations shared by navigation, page templates and browser titles.
export const sections=Object.freeze({
 home:'Home', about:'About', projects:'Projects', photos:'Photos', resume:'Résumé', contact:'Contact'
});
export const sectionIds=Object.freeze(Object.keys(sections));
export const sectionAliases=Object.freeze({work:'projects',outside:'photos',experience:'resume'});
export function normaliseSection(view){
 const canonical=Object.hasOwn(sectionAliases,view)?sectionAliases[view]:view;
 return Object.hasOwn(sections,canonical)?canonical:'home';
}
export function browsingLabel(view,photoTab){
 return view==='photos'?(photoTab==='videos'?'video':'photograph')
  :view==='projects'?'project':view==='about'?'topic':'section';
}
