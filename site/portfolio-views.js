import { socialIcons } from './social-icons.js?v=contact-socials-20261117-1';
import { sections } from './sections.js?v=content-gallery-20261117-1';

const EMAIL='roger@rogermckz.dev';
const YOUTUBE='https://www.youtube.com/@RogerMcKenzie1';
const RESUME='https://docs.google.com/document/d/15JX0X1Reny-b6ptbkC4ADLikTLXrJYg3';
const svg=d=>`<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const ICON={
 menu:svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
 out:svg('<path d="M7 17 17 7M9 7h8v8"/>'),
 left:svg('<path d="m15 6-6 6 6 6"/>'),
 right:svg('<path d="m9 6 6 6-6 6"/>'),
 play:svg('<path d="M7 5v14l12-7z"/>'),
 grid:svg('<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>'),
 photo:svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 17 5-5 4 4 3-3 4 4"/>'),
 video:svg('<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>'),
 mail:svg('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>'),
 expand:svg('<path d="m6 9 6 6 6-6"/>'),
 download:svg('<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>')
};
const external='target="_blank" rel="noopener noreferrer"';
const contactProfiles=[{"id":"linkedin","label":"LinkedIn","url":"https://www.linkedin.com/in/rogermckenzie/"},{"id":"youtube","label":"YouTube","url":"https://www.youtube.com/@RogerMcKenzie1"},{"id":"instagram","label":"Instagram","url":"https://www.instagram.com/rogermckz/"},{"id":"tiktok","label":"TikTok","url":"https://www.tiktok.com/@rogermckz"}];
const contactIconsHTML=contactProfiles.map(profile=>socialIcons[profile.id]).join('');
const contactSocialLinks=`<div class="lcd-links contact-social-links">${contactProfiles.map(profile=>`<a href="${profile.url}" ${external}>${socialIcons[profile.id]}<span>${profile.label}</span></a>`).join('')}</div>`;

const photos=[
 {src:'assets/photography/sunset-cathedral.jpg',alt:'Orange sunset over a cathedral silhouette and city rooftops',title:'Cathedral sunset',location:'Washington, DC',year:'2026'},
 {src:'assets/photography/terrace-lights.jpg',alt:'Rooftop terrace with string lights over a city at night',title:'Terrace lights',location:'',year:'2026'},
 {src:'assets/photography/caesars-palace.jpg',alt:'Caesars Palace entrance at golden hour with crowds on the Las Vegas Strip',title:'Caesars Palace',location:'Las Vegas, NV',year:'2026'},
 {src:'assets/photography/north-beach-night.jpg',alt:'North Beach street scene at night with neon signs and city lights',title:'North Beach nights',location:'San Francisco, CA',year:'2026'}
];
// Add a video with its YouTube id; 'vertical' is for Shorts. The grid fills the last slot
// with a link to the channel while there are fewer than four.
const videos=[
 {id:'hrOAiSEx3Ww',title:'AfroTech 2025',location:'Houston, TX',year:'2025',vertical:true}
];
const lists={
 projects:{label:sections.projects,items:[
  {"name":"Home Server","text":"A home-server build using a Dell OptiPlex. I’m documenting the hardware upgrades and exploring virtual machines, game storage and backups.","meta":"Intel Core i3-8100T, 16 GB RAM, 256 GB SATA SSD + 512 GB NVMe SSD","url":"https://github.com/RogerMcKenzie/home-server","cta":"View the build"},
  {"name":"Studio Stack","text":"I lead development of a production-grade platform for creative teams, projects and equipment. Originally built for The Agency at UF, it now serves external clients with shared workspaces, role-based access and production workflows.","meta":"TypeScript, React, Next.js, AWS Amplify, Cognito, API Gateway, Lambda, Amazon RDS for PostgreSQL, S3, SES, SNS and CloudWatch","url":"https://github.com/The-Agency-at-UF/studiostack","cta":"View on GitHub"},
  {"name":"Jenna’s Recipes","img":"assets/jennas-recipes.jpg","text":"A mock client website featuring Jenna’s favorite recipes, Gemini-generated recipes from ingredients and Spoonacular search. It also includes a kitchenware demo store with a shopping cart saved between visits.","meta":"React, TypeScript, MUI, Gemini, Spoonacular","url":"https://jennarecipes.vercel.app","cta":"Open the app"},
  {name:'Content',text:'Videos about tech, events and the places I visit.',view:'content/videos',cta:'Watch videos'}
 ]}
};
const menuPreviews={
 projects:{img:'assets/jennas-recipes.jpg',text:''},
 photos:{img:'assets/photography/sunset-cathedral.jpg',text:''},
 resume:{document:`${RESUME}/preview`,text:''},
 contact:{img:'assets/favicon-512.png',text:EMAIL}
};

function mobileListView(kind,{listIndex}){
 const {label,items}=lists[kind];
 return `<section class="mobile-projects mobile-page"><h1>${label}</h1>${items.map((item,i)=>item.view?`<a class="mobile-project-content" data-project="${i}" data-view="${item.view}" href="#${item.view}">${item.name}${ICON.right}</a>`:`<details data-project="${i}" ${i===listIndex.projects?'open':''}><summary>${item.name}${ICON.expand}</summary><div class="mobile-project-detail">${previewHTML(item)}</div></details>`).join('')}</section>`;
}

function homeView(){
 return `<div class="lcd-live"><img class="lcd-feed" src="assets/profile.jpg" alt="Roger McKenzie" width="1512" height="1375" fetchpriority="high"><span class="lcd-status lcd-shadow" aria-hidden="true"><span class="lcd-rec"></span><span class="lcd-batt"><b></b></span></span><div class="lcd-focus" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="lcd-who lcd-shadow"><h1>Roger McKenzie</h1><p>Software developer and content creator</p></div><button class="lcd-menu-btn" data-open-menu aria-haspopup="true">${ICON.menu}Menu</button></div>`;
}
function previewHTML(item){
 return (item.img?`<img src="${item.img}" alt="" width="262" height="157" loading="lazy">`:'')
  +`<p>${item.text}</p>`
  +(item.meta?`<p class="lcd-meta">${item.meta}</p>`:'')
  +(item.url?`<a class="lcd-cta" href="${item.url}" ${external}>${item.cta}${ICON.out}</a>`:'')
  +(item.view?`<a class="lcd-cta" href="#${item.view}" data-view="${item.view}">${item.cta}${ICON.right}</a>`:'');
}
function listView(kind,{listIndex,mobile}){
 if(mobile)return mobileListView(kind,{listIndex});
 const {label,items}=lists[kind];const index=listIndex[kind];
 return `<div class="lcd-list" data-list="${kind}"><h1 class="lcd-sr">${label}</h1><ul aria-label="${label}">${items.map((item,i)=>`<li><button data-item="${i}"${item.view?` data-view="${item.view}"`:""} aria-current="${i===index}">${item.name}</button></li>`).join('')}</ul><div class="lcd-preview" aria-live="polite">${previewHTML(items[index])}</div></div>`;
}
function photoPlace(p){return [p.location,p.year].filter(Boolean).join('<br>');}
function slideshowView({photoIndex,photoTab}){
 const p=photos[photoIndex],n=photoIndex+1;
 return `<div class="lcd-show"><div class="lcd-show-img" role="region" tabindex="0" aria-label="Photograph ${n} of ${photos.length}. Swipe, scroll or use the arrow keys to browse"><img src="${p.src}" alt="${p.alt}" width="1574" height="2200" draggable="false"></div><div class="lcd-show-side is-left lcd-narrow"><span class="lcd-file">${ICON.play}100-${String(n).padStart(4,'0')}</span><h1>${p.title}</h1><span class="lcd-place">${photoPlace(p)}</span></div><div class="lcd-show-side is-right lcd-narrow"><span>${n} / ${photos.length}</span><div class="lcd-bars" aria-hidden="true">${photos.map((_,i)=>`<i class="${i===photoIndex?'is-on':''}"></i>`).join('')}</div><button class="lcd-all" data-photo-mode="index">${ICON.grid}${photoTab==='all'?'Back to content':'All photos'}</button></div><button class="lcd-arrow is-prev" data-photo-step="-1" aria-label="Previous photograph">${ICON.left}</button><button class="lcd-arrow is-next" data-photo-step="1" aria-label="Next photograph">${ICON.right}</button></div>`;
}
const contentTabs=Object.freeze(['all','videos','photos']);
function contentItems({photoTab}){
 const movieItems=videos.map((item,index)=>({type:'video',index,item}));
 const photoItems=photos.map((item,index)=>({type:'photo',index,item}));
 return photoTab==='videos'?movieItems:photoTab==='photos'?photoItems:[...movieItems,...photoItems];
}
function selectedContentIndex({photoTab,allIndex=0,videoIndex,photoIndex}){
 return photoTab==='all'?allIndex:photoTab==='videos'?videoIndex:photoIndex;
}
function indexCaption(state){
 const items=contentItems(state),index=selectedContentIndex(state),p=items[index]?.item;
 if(!p)return 'No content yet';
 return `<span>${p.title}</span><span class="lcd-dim">${p.year}</span><span class="lcd-dim">${index+1} / ${items.length}</span>`;
}
const videoThumb=v=>`https://i.ytimg.com/vi/${v.id}/${v.vertical?'oardefault':'maxresdefault'}.jpg`;
function thumbsHTML(state){
 const tiles=contentItems(state).map(({type,index,item},i)=>{
  const movie=type==='video',src=movie?videoThumb(item):item.src;
  return `<button${movie?' class="lcd-video-tile"':''} data-${type}="${index}" data-content-index="${i}" aria-current="${i===selectedContentIndex(state)}" aria-label="${movie?'Play':'View'} ${item.title}"><img src="${src}" alt="" width="214" height="143" loading="lazy" draggable="false">${movie?`<span class="lcd-play-badge">${ICON.play}</span>`:''}</button>`;
 });
 if(state.photoTab==='videos'&&videos.length<4)tiles.push(`<a class="lcd-channel-tile" href="${YOUTUBE}" ${external}><span>More on YouTube</span>${ICON.out}</a>`);
 return tiles.join('');
}
function indexView(state){
 const {photoTab}=state,labels={all:'All content',videos:'Videos',photos:'Photos'},icons={all:ICON.grid,videos:ICON.video,photos:ICON.photo};
 return `<div class="lcd-page lcd-index" data-content-filter="${photoTab}"><h1 class="lcd-sr">${sections.photos}</h1><div class="lcd-tabs lcd-narrow" role="tablist" aria-label="Content type">${contentTabs.map(tab=>`<button id="content-tab-${tab}" role="tab" data-photo-tab="${tab}" aria-controls="content-panel" aria-selected="${photoTab===tab}" tabindex="${photoTab===tab?'0':'-1'}" class="${photoTab===tab?'is-on':''}">${icons[tab]}${labels[tab]}</button>`).join('')}</div><div id="content-panel" class="lcd-thumbs" role="tabpanel" aria-labelledby="content-tab-${photoTab}">${thumbsHTML(state)}</div><div class="lcd-index-cap" aria-live="polite">${indexCaption(state)}</div></div>`;
}
function resumeView({mobile}){
 if(mobile)return `<section class="mobile-resume mobile-page"><h1>${sections.resume}</h1><div class="lcd-doc resume-viewer" data-loading><span class="resume-loading" role="status">Loading résumé</span><iframe class="resume-frame" src="${RESUME}/preview" title="Roger McKenzie’s résumé" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><div class="mobile-resume-actions"><a class="lcd-plain" href="${RESUME}/edit" ${external}>Open résumé${ICON.out}</a><a class="lcd-cta" href="${RESUME}/export?format=pdf">Download PDF${ICON.download}</a></div></section>`;
 return `<div class="lcd-resume"><div class="lcd-resume-top"><h1>${sections.resume}</h1><a class="lcd-plain" href="${RESUME}/edit" ${external}>Open résumé</a><a class="lcd-cta" href="${RESUME}/export?format=pdf">${ICON.download}Download PDF</a></div><div class="lcd-doc resume-viewer" data-loading><span class="resume-loading" role="status">Loading résumé</span><iframe class="resume-frame" src="${RESUME}/preview" title="Roger McKenzie’s résumé" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div></div>`;
}
function contactView(){
 return `<div class="lcd-contact"><h1>Email me about internships, collaborations or photo work</h1><a class="lcd-cta" href="mailto:${EMAIL}">${ICON.mail}${EMAIL}</a>${contactSocialLinks}</div>`;
}
function videoView({videoIndex,photoTab}){
 const v=videos[videoIndex],n=videoIndex+1,many=videos.length>1;
 return `<div class="lcd-show lcd-movie"><div class="lcd-show-img${v.vertical?' is-vertical':''}"><button class="lcd-poster" data-play-video aria-label="Play ${v.title}"><img src="${videoThumb(v)}" alt="" draggable="false"><span class="lcd-play-badge is-large">${ICON.play}</span></button></div><div class="lcd-show-side is-left lcd-narrow"><span class="lcd-file">${ICON.play}C${String(n).padStart(4,'0')}.MP4</span><h1>${v.title}</h1><span class="lcd-place">${photoPlace(v)}</span></div><div class="lcd-show-side is-right lcd-narrow"><span>${n} / ${videos.length}</span><div class="lcd-bars" aria-hidden="true">${videos.map((_,i)=>`<i class="${i===videoIndex?'is-on':''}"></i>`).join('')}</div><a class="lcd-all lcd-watch" href="https://www.youtube.com/watch?v=${v.id}" ${external}>Watch on YouTube${ICON.out}</a><button class="lcd-all" data-photo-mode="index">${ICON.grid}${photoTab==='all'?'Back to content':'All videos'}</button></div>${many?`<button class="lcd-arrow is-prev" data-video-step="-1" aria-label="Previous video">${ICON.left}</button><button class="lcd-arrow is-next" data-video-step="1" aria-label="Next video">${ICON.right}</button>`:''}</div>`;
}
function viewHTML(view,state){
 const {photoMode}=state;
 if(view==='home')return homeView(state);
 if(view==='projects')return listView(view,state);
 if(view==='photos')return photoMode==='index'?indexView(state):photoMode==='play'?videoView(state):slideshowView(state);
 if(view==='resume')return resumeView(state);
 return contactView();
}


export { contentTabs, contentItems, selectedContentIndex, contactProfiles, contactIconsHTML, photos, videos, lists, menuPreviews, previewHTML, slideshowView, indexCaption, viewHTML };
