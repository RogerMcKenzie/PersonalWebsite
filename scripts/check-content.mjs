// Check mixed-media identity, order, selection and project-only lists.
import assert from 'node:assert/strict';
import {contentItems,selectedContentIndex,photos,videos,lists,viewHTML,indexCaption} from '../site/portfolio-views.js';
const base={mobile:false,listIndex:{projects:0},photoMode:'index',photoTab:'all',allIndex:0,photoIndex:0,videoIndex:0};
const all=contentItems(base);
assert.equal(all.length,videos.length+photos.length);
assert.deepEqual(all.slice(0,videos.length).map(e=>e.item),videos);
assert.deepEqual(all.slice(videos.length).map(e=>e.item),photos);
for(const photoTab of ['all','videos','photos']){
 const state={...base,photoTab},items=contentItems(state);
 const html=viewHTML('photos',state);
 assert.deepEqual([...html.matchAll(/data-photo-tab="([^"]+)"/g)].map(m=>m[1]),['all','videos','photos']);
 assert.equal((html.match(/data-content-index=/g)||[]).length,items.length);
 assert.equal((html.match(/aria-current="true"/g)||[]).length,1);
 assert.match(html,new RegExp(`aria-labelledby="content-tab-${photoTab}"`));
}
for(let allIndex=0;allIndex<all.length;allIndex++){
 const state={...base,allIndex},entry=all[allIndex];
 assert.equal(selectedContentIndex(state),allIndex);
 assert.ok(indexCaption(state).includes(entry.item.title));
 assert.ok(indexCaption(state).includes(`${allIndex+1} / ${all.length}`));
 const html=viewHTML('photos',state);
 assert.match(html,new RegExp(`data-${entry.type}="${entry.index}" data-content-index="${allIndex}" aria-current="true"`));
}
assert.match(viewHTML('photos',{...base,photoMode:'show'}),/Back to content/);
assert.match(viewHTML('photos',{...base,photoMode:'play'}),/Back to content/);
for(const mobile of [false,true]){
 const html=viewHTML('projects',{...base,mobile});
 assert.doesNotMatch(html,/data-view="content\/videos"|>Content<|Watch videos/);
 assert.deepEqual(lists.projects.items.map(item=>item.name),['Home Server','Studio Stack','Jenna’s Recipes']);
 assert.equal((html.match(mobile?/<details data-project=/g:/<button data-item=/g)||[]).length,3);
}
console.log('PASS: mixed media order/identity, filters, captions, selection, return labels and project-only lists.');
