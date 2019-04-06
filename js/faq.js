let byId = (e) => document.getElementById(e);

window.onload = () => {
  // byId('home').href = `http://${ip}`;
  byId('report').href = `http://${ip}/report.html`;

  byId('cheat').href = '#';
  $('#cheat').on('click', () => window.location.href = 'https://youtu.be/dQw4w9WgXcQ?t=43');

  $('.hash').on('click', (e) => byId(e.currentTarget.id + 'a').scrollIntoView({block: 'nearest'}));
}
