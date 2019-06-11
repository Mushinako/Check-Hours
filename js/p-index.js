// Bug Reports Welcomed!
let byId = (e) => document.getElementById(e);

function search(e, attempt) {
  byId('hour').value = '';
  byId('cost').value = '';
  e.preventDefault();
  if (byId('first_name') && byId('id') && document.getElementsByTagName('form').length) {
    byId('first_name').focus();
    // byId('first_name').blur();
    byId('id').focus();
    byId('id').blur();
    if (byId('input').checkValidity()) {
      if (!attempt) {
        byId('stat').style.color = '#ffff00';
        byId('stat').value = 'Searching Data on Crappy Server...';
      }
      let data = {
        name: byId('first_name').value,
        id: byId('id').value
      };
      let xhr = new XMLHttpRequest();
      xhr.timeout = 5000;
      xhr.open('POST', 'php/search.php');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.onload = () => {
        if (xhr.status = '200') {
          let ret = JSON.parse(xhr.responseText);
          switch (ret['stat']) {
            case 1:
              byId('stat').style.color = '#ff5252';
              byId('stat').value = 'Invalid ID-Name Combination!';
              return;
            case 2:
              byId('stat').style.color = '#ff5252';
              byId('stat').value = 'Invalid ID Format!';
              return;
            case -1:
              byId('stat').style.color = '#ff5252';
              byId('stat').value = 'Internal Error!';
              return;
            case -2:
              byId('stat').style.color = '#ffff00';
              byId('stat').value = 'Server is Updating Data, Please Retry in a Minute!';
              return;
            case 0:
              byId('stat').style.color = '#00e676';
              byId('hour').value = ret['hour'];
              byId('cost').value = ret['cost'];
              byId('stat').value = 'Success';
              return;
          }
        }
        byId('stat').style.color = '#ff5252';
        byId('stat').value = 'Internal Error!';
      };
      xhr.ontimeout = () => {
        switch (attempt) {
          case 0:
            byId('stat').style.color = '#ffff00';
            byId('stat').value = 'Connection to Crappy Server Timed Out, 1st Retry...';
            break;
          case 1:
            byId('stat').style.color = '#ffff00';
            byId('stat').value = 'Connection to Crappy Server Timed Out, 2nd Retry...';
            break;
          default:
            byId('stat').style.color = '#ff5252';
            byId('stat').value = 'Connection to Crappy Server Timed Out!';
            return;
        }
        search(e, attempt+1);
      };
      xhr.send(Object.entries(data).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&'));
    } else {
      byId('stat').style.color = '#ff5252';
      byId('stat').value = 'Invalid Input Format!';
    }
  } else {
    byId('stat').style.color = '#ff5252';
    byId('stat').value = 'Internal Error!';
  }
}

function conErr() {
  byId('stat').style.color = '#ff5252';
  byId('stat').value = 'Connection to Crappy Server Timed Out!';
}

function time() {
  byId('stat').style.color = '#ffff00';
  byId('stat').value = 'Testing Connection with Crappy Server...';

  let xhr = new XMLHttpRequest();
  xhr.timeout = 5000;
  xhr.open('GET', 'php/time.php');
  xhr.onload = () => {
    if (xhr.status = '200') {
      byId('stat').style.color = '#00e676';
      byId('stat').value = `Data Updated at ${xhr.responseText} PT`;
      byId('submit').disabled = false;
    } else conErr();
  };
  xhr.ontimeout = conErr;
  xhr.send();
}

document.addEventListener('DOMContentLoaded', () => {
  byId('noscript').style.display = 'none';

  let p = [
    '`;-.          ___,',
    '  `.`\\_...._/`.-"`',
    '    \\        /      ,',
    '    /()   () \\    .\' `-._',
    '   |)  .    ()\\  /   _.\'',
    '   \\  -\'-     ,; \'. <',
    '    ;.__     ,;|   > \\',
    '   / ,    / ,  |.-\'.-\'',
    '  (_/    (_/ ,;|.<`',
    '    \\    ,     ;-`',
    '     >   \\    /',
    '    (_,-\'`> .\'',
    '         (_,\'',
    ' Bug Reports Welcomed!'
  ];
  console.log(p.join('\n'));

  time();

  byId('submit').onclick = (e) => search(e, 0);
  document.onkeydown = (e) => (e.key === 'Enter') ? search(e, 0) : 0;
});
