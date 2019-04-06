let byId = (e) => document.getElementById(e);
let lastPos = 0;

window.onload = () => {
  // byId('home').href = `http://${ip}`;
  byId('report').href = `http://${ip}/report.html`;

  byId('cheat').href = '#';
  $('#cheat').on('click', () => window.location.href = 'https://youtu.be/dQw4w9WgXcQ?t=43');
}

$(document).bind('hashchange', () => {
  lastPos = $(window).scrollTop();
  location.hash = '';
  $(window).scrollTop(lastPos);
});
