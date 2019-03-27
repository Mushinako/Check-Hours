let byId = (e) => document.getElementById(e);

function submit(e, attempt) {
  e.preventDefault();
  if (byId('name') && byId('email') && byId('issue') && $('form').length) {
    byId('issue').focus();
    byId('issue').blur();
    if ($('form')[0].checkValidity()) {
      if (!attempt) {
        byId('stat').style.color = '#ffff00';
        byId('stat').value = 'Submitting Your Words to Crappy Server...';
      }
      let data = {
        name: byId('name').value,
        email: byId('email').value,
        issue: byId('issue').value
      };
      // console.log(data);
      let jqxhr = $.ajax({
        url: ip + ':18000/report.php',
        method: 'POST',
        data: data
      });
      jqxhr.done((data) => {
        switch (data) {
          case '-1':
            byId('stat').style.color = '#ff5252';
            byId('stat').value = 'Internal Error!';
            break;
          case '0':
            byId('stat').style.color = '#00e676';
            byId('stat').value = 'Submission Successful! Thank You for Your Feedback!';
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
      byId('stat').value = 'Invalid Input!';
    }
  } else {
    byId('stat').style.color = '#ff5252';
    byId('stat').value = 'Internal Error!';
  }
}

$(document).ready(() => {
  byId('stat').style.color = '#ffff00';
  byId('stat').value = 'Establishing Connection with Crappy Server...';

  let jqxhr = $.ajax({
    url: ip + ':18000/report.php',
    method: 'GET'
  });
  jqxhr.done((data) => {
    byId('stat').style.color = '#00e676';
    byId('stat').value = 'Please Input Your Brilliant Ideas and Press Submit!';
    console.log(data);
    byId('submit').disabled = false;
  });

  $('#submit').on('click', (e) => submit(e, 0));
  $(document).on('keypress', (e) => {
    if (e.which === 13) submit(e, 0);
  });
});
