// restore
document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get({
    listname: ''
  }, function(items) {
    document.getElementById('listname').value = items.listname;
  });
});

// save
document.getElementById('save').addEventListener('click', function() {
  chrome.storage.sync.set({
    listname: document.getElementById('listname').value
  }, function() {
    // update status after saved:
    document.getElementById('status').innerHTML = 'Default task list saved.';
  });
});

// clear status when text changes again:
document.getElementById('listname').addEventListener('change', function() {
  document.getElementById('status').innerHTML = '';
});
