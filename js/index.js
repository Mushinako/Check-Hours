// Bug Reports Welcomed!
let byId = (e) => document.getElementById(e);

function search(e, attempt) {
  byId('hour').value = '';
  byId('cost').value = '';
  e.preventDefault();
  if (byId('first_name') && byId('id') && $('form').length) {
    byId('first_name').focus();
    // byId('first_name').blur();
    byId('id').focus();
    byId('id').blur();
    if ($('form')[0].checkValidity()) {
      if (!attempt) {
        byId('stat').style.color = '#ffff00';
        byId('stat').value = 'Searching Data on Crappy Server...';
      }
      let data = {
        name: byId('first_name').value,
        id: byId('id').value
      };
      // console.log(data);
      let jqxhr = $.ajax({
        url: ip + ':18000/search.php',
        method: 'POST',
        data: data
      });
      jqxhr.done((data) => {
        let ret = JSON.parse(data);
        switch (ret['stat']) {
          case 1:
            byId('stat').style.color = '#ff5252';
            byId('stat').value = 'Invalid ID-Name Combination!';
            break;
          case 2:
            byId('stat').style.color = '#ff5252';
            byId('stat').value = 'Invalid ID Format!';
            break;
          case -1:
            byId('stat').style.color = '#ff5252';
            byId('stat').value = 'Internal Error!';
            break;
          case -2:
            byId('stat').style.color = '#ffff00';
            byId('stat').value = 'Server is Updating Data, Please Retry in a Minute!';
            break;
          case 0:
            byId('stat').style.color = '#00e676';
            byId('hour').value = ret['hour'];
            byId('cost').value = ret['cost'];
            byId('stat').value = 'Success';
            break;
          default:
            byId('stat').style.color = '#ff5252';
            byId('stat').value = 'Internal Error!';
        }
      });
      jqxhr.fail((_, status, err) => {
        // console.log(status);
        // console.log(err);
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
        search(e, attempt + 1);
      });
    } else {
      byId('stat').style.color = '#ff5252';
      byId('stat').value = 'Invalid Input Format!';
    }
  } else {
    byId('stat').style.color = '#ff5252';
    byId('stat').value = 'Internal Error!';
  }
}

$(document).ready(() => {
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

  byId('stat').style.color = '#ffff00';
  byId('stat').value = 'Establishing Connection with Crappy Server...';

  console.log(ip + ':18000/time.php');

  let jqxhr = $.ajax({
    url: ip + ':18000/time.php',
    method: 'GET'
  });
  jqxhr.done((data) => {
    byId('stat').style.color = '#00e676';
    byId('stat').value = `Data Updated at ${data} PT`;
    byId('submit').disabled = false;
  });

  $('#submit').on('click', (e) => search(e, 0));
  $(document).on('keypress', (e) => {
    if (e.which === 13) search(e, 0);
  });
});
