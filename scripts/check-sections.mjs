// Keep public names consistent across the runtime, static fallback and both layouts.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {sections,sectionIds,normaliseSection,browsingLabel} from '../site/sections.js';
import {viewHTML} from '../site/portfolio-views.js';

assert.deepEqual(Object.values(sections),['Home','About','Projects','Photos','Résumé','Contact']);
for(const id of sectionIds)assert.equal(normaliseSection(id),id);
for(const [old,id] of Object.entries({work:'projects',outside:'photos',experience:'resume'}))assert.equal(normaliseSection(old),id);
for(const unknown of ['',undefined,'toString','constructor','__proto__','missing'])assert.equal(normaliseSection(unknown),'home');
const html=fs.readFileSync(new URL('../site/index.html',import.meta.url),'utf8');
for(const match of html.matchAll(/<button[^>]*data-view="([^"]+)"[^>]*>(.*?)<\/button>/gs)){
 const [,id,content]=match;
 assert.ok(sectionIds.includes(id),`canonical destination ${id}`);
 assert.equal(content.replace(/<[^>]+>/g,''),sections[id],`static ${id} navigation`);
}
assert.match(html,/<section id="projects"><span id="work" aria-hidden="true"><\/span><h2>Projects<\/h2>/,'legacy no-JS anchor');
for(const id of sectionIds.filter(id=>id!=='home')){
 assert.match(html,new RegExp(`<section id="${id}">(?:<span[^>]+></span>)?<h2>${sections[id]}</h2>`));
}
for(const mobile of [false,true]){
 const state={mobile,listIndex:{about:0,projects:0},photoMode:'index',photoTab:'photos',photoIndex:0,videoIndex:0};
 for(const id of ['about','projects','photos','resume']){
  assert.match(viewHTML(id,state),new RegExp(`<h1[^>]*>${sections[id]}</h1>`),`${id}, mobile=${mobile}`);
 }
 const resume=viewHTML('resume',state);
 assert.match(resume,/>Open résumé(?:<svg|<\/a>)/);
 assert.match(resume,/Download PDF/);
 if(mobile){
  assert.match(resume,/<iframe class="resume-frame"/, 'mobile résumé is shown immediately');
  assert.doesNotMatch(resume,/<details|loading="lazy"|Preview here/, 'no collapsed/lazy preview gate');
  assert.ok(resume.indexOf('</iframe>')<resume.indexOf('Download PDF'), 'download follows the document');
  assert.match(resume,/>Download PDF[\s\S]*<\/a><\/div><\/section>$/, 'download is the final action');
 }
 assert.match(viewHTML('about',state),/Experience/,'About topic stays Experience');
 assert.match(viewHTML('photos',state),/>Videos<\/button>/,'Videos stays a Photos tab');
}
assert.equal(browsingLabel('projects'),'project');
assert.equal(browsingLabel('about'),'topic');
assert.equal(browsingLabel('photos','photos'),'photograph');
assert.equal(browsingLabel('photos','videos'),'video');
assert.equal(browsingLabel('home'),'section');
console.log('PASS: canonical names, static navigation, templates, legacy aliases and contextual browse labels.');
