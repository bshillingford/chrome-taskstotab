'use strict';

// Change favicon
var linkTags = document.getElementsByTagName('link');
linkTags[0].href = chrome.extension.getURL('img/icon-16.png');
linkTags[0].type = 'image/png';
linkTags[0].setAttribute('sizes','16x16');
linkTags[1].href = chrome.extension.getURL('img/favicon.ico');
var highResFavicon = document.createElement('link');
highResFavicon.rel = 'icon';
highResFavicon.type = 'image/png';
highResFavicon.setAttribute('sizes','32x32');
highResFavicon.href = chrome.extension.getURL('img/icon-32.png');
document.head.appendChild(highResFavicon);

function f() {
	// Add styles to tasks iframe
	var link = document.createElement('link');
	link.href= chrome.extension.getURL('css/styles.css');
	link.rel = 'stylesheet';
	link.type = 'text/css';
	document.getElementsByTagName('iframe')[0]
        .contentDocument.head.appendChild(link);
}
f();
window.onload = f();

// Function to add and remove important class
function markImportant(row){
  var r = $(row);
  var text = r.find('div.d').html();
  if(text.match(/^!!/)){
    r.addClass('important');
  } else {
    r.removeClass('important');
  }
}

function markAllImportant(doc){
  doc.find('table.z tr.r').each(function(idx,row){
    markImportant(row);
  });
}

var initialisedIframe = false;

function initIframe(){
  if(initialisedIframe){
    return;
  }
  // Change help link destination
  var doc = $('iframe').contents();
  var helpLink = doc.find('#\\:1\\.he');
  var nav = helpLink.parent();
  helpLink.remove();
  var newHelpLink = "<a href='http://richwells.me/better-google-tasks/' target='_blank' class='goog-flat-button w goog-inline-block' role='button' aria-hidden='true' style='text-decoration:none'>Help</a>";
  nav.prepend(newHelpLink);
  // Mark important
  markAllImportant(doc);
  doc.on('input', 'table.z tr.r div.d', function(){
    markImportant($(this).parents('tr.r'));
  });
  doc.on('DOMNodeInserted', function(e) {
    if(e.target.tagName == 'TABLE'){
      $(e.target).find('tr.r').each(function(idx,row){
        markImportant(row);
      });
    }
  });
  initialisedIframe = true;
}

// check url stuff, including helpers:
const trigger_mouse_event = function(node, eventType) {
  var clickEvent = document.createEvent ('MouseEvents');
  clickEvent.initEvent (eventType, true, true);
  node.dispatchEvent (clickEvent);
};

const trigger_change = function(matches, listname) {
  listname = listname.trim().toLowerCase();
  console.log('listname='+listname);
  var obj;
  matches.forEach(function(match) {
    console.log('match: '+match.innerText);
    if (match.innerText.trim().toLowerCase() == listname)
      obj = match;
  });
  if (!obj) {
    console.warn(`desired match not found for "${listname}"`);
    return;
  }
  trigger_mouse_event(obj, "mouseover");
  trigger_mouse_event(obj, "mousedown");
  trigger_mouse_event(obj, "mouseup");
  trigger_mouse_event(obj, "click");
};

// the redirect itself:
chrome.storage.sync.get({
  listname: ''
}, function(items) {
  const defaultlist = items.listname;

  window.addEventListener('hashchange', function() {
    trigger_change(window.decodeURI(window.location.hash.substring(1)));
  }, false);

  let done = false;
  function click_tab() {
    if (done) return;

    const matches = document
      .querySelector('iframe')
      .contentDocument
      .querySelectorAll('td.Tb div.goog-inline-block.goog-flat-button');
    if (matches.length > 1) {
      // click to the right tab:
      if (window.location.hash.length > 1) {
        trigger_change(matches, window.decodeURI(window.location.hash.substring(1)));
      } else if (defaultlist) {
        trigger_change(matches, defaultlist);
      }
      done = true;
    } else {
      // HACK: repeat while DOM is not yet generated
      window.setTimeout(click_tab, 25);
      console.log('didnt find element, repeating click_tab');
    }
  }
  document.addEventListener('DOMContentLoaded', click_tab);
  click_tab();
});

// bugfix: iframe did not exist, so only the second call (sometimes) worked
document.querySelector('iframe').onload = initIframe();
initIframe();

// Update hash in URL when we change tab (click handlers didn't work)
window.setInterval(function() {
  try {
    var elem = document.querySelector('iframe').contentDocument.querySelector('div.Yb'); 
    var new_hash = '#' + elem.innerText.trim();
    if (window.location.hash.toLowerCase() !== new_hash.toLowerCase()) {
      window.location.hash = new_hash;
    }
  } catch (e) {
    console.log(e);
  }
}, 500);

