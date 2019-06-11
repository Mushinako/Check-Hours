// Bug Reports Welcomed!
let byId = (e) => document.getElementById(e);

function submit(e, attempt) {
  e.preventDefault();
  if (byId('name') && byId('email') && byId('issue') && document.getElementsByTagName('form').length) {
    byId('issue').focus();
    byId('issue').blur();
    if (byId('input').checkValidity()) {
      if (!attempt) {
        byId('stat').style.color = '#ffff00';
        byId('stat').value = 'Submitting Your Words to Crappy Server...';
      }
      let data = {
        name: byId('name').value,
        email: byId('email').value,
        issue: byId('issue').value
      };
      let xhr = new XMLHttpRequest();
      xhr.timeout = 5000;
      xhr.open('POST', 'php/report.php');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.onload = () => {
        if (xhr.status = '200') switch (xhr.responseText) {
          case '-1':
            byId('stat').style.color = '#ff5252';
            byId('stat').value = 'Internal Error!';
            return;
          case '0':
            byId('stat').style.color = '#00e676';
            byId('stat').value = 'Submission Successful! Thank You for Your Feedback!';
            return;
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
      byId('stat').value = 'Invalid Input!';
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

function connect() {
  byId('stat').style.color = '#ffff00';
  byId('stat').value = 'Testing Connection with Crappy Server...';

  let xhr = new XMLHttpRequest();
  xhr.timeout = 5000;
  xhr.open('GET', 'php/report.php');
  xhr.onload = () => {
    if (xhr.status = '200') {
      byId('stat').style.color = '#00e676';
      byId('stat').value = 'Please Input Your Brilliant Ideas and Press Submit!';
      console.log(xhr.responseText);
      byId('submit').disabled = false;
    } else conErr();
  };
  xhr.ontimeout = conErr;
  xhr.send();
}

document.addEventListener('DOMContentLoaded', () => {
  byId('noscript').style.display = 'none';

  connect();

  byId('submit').onclick = (e) => submit(e, 0);
  document.onkeydown = (e) => (e.key === 'Enter') ? submit(e, 0) : 0;
});
