// vim: ts=2 sw=2 et ai:

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
	var iframe = document.getElementsByTagName('iframe')[0];
	iframe.contentDocument.head.appendChild(link);
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
  var doc = $(iframe).contents();
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

// check url:
function nav() {
    'use strict';
    const defaultlist = '*Grocery/TODOs';

    function triggerMouseEvent (node, eventType) {
        var clickEvent = document.createEvent ('MouseEvents');
        clickEvent.initEvent (eventType, true, true);
        node.dispatchEvent (clickEvent);
    }

    function trigger_change(listname) {
        listname = listname.trim().toLowerCase();
        console.log('listname='+listname);
        var obj;
        document
            .querySelector('iframe')
            .contentDocument
            .querySelectorAll('div.goog-inline-block.goog-flat-button')
            .forEach(function(match) {
                console.log('match: '+match.innerText);
                if (match.innerText.trim().toLowerCase() == listname)
                    obj = match;
            });
        if (!obj) {
            console.warn(`desired match not found for "${listname}"`);
            return;
        }
        triggerMouseEvent(obj, "mouseover");
        triggerMouseEvent(obj, "mousedown");
        triggerMouseEvent(obj, "mouseup");
        triggerMouseEvent(obj, "click");
    }

    window.addEventListener('hashchange', function() {
        trigger_change(window.decodeURI(window.location.hash.substring(1)));
    }, false);

    function setup() {
        var matches = document
            .querySelector('iframe')
            .contentDocument
            .querySelectorAll('div.goog-inline-block.goog-flat-button');
        if (matches.length > 1) {
            if (window.location.hash.length > 1)
                trigger_change(window.decodeURI(window.location.hash.substring(1)));
            else
                trigger_change(defaultlist);
        } else {
            // HACK: repeat while DOM is not yet generated
            window.setTimeout(setup, 25);
        }
    }
    setup();
}
document.body.onload = nav;
nav();

iframe.onload = initIframe();
initIframe();

