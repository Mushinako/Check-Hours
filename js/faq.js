let byId = (e) => document.getElementById(e);

document.addEventListener('DOMContentLoaded', () => {
  byId('report').href = `http://${ip}/report.html`;

  byId('cheat').href = '#';
  byId('cheat').onclick = () => window.open('https://youtu.be/dQw4w9WgXcQ?t=43');

  for (let a of document.getElementsByClassName('hash')) a.onclick = (e) => byId(a.id+'a').scrollIntoView({block:'nearest'});
});
