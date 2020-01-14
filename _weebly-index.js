"use strict";
// Strings
const str = {
    timeout: 'Connection failure! Please retry in a few moments...',
    testres: 'Data updated at ',
    malfunc: 'Webpage malfunction! Reloading...',
    invinpt: 'Invalid input!',
    invstid: 'You may have mistyped your student ID. Please double check.',
    success: 'Success',
    loading: 'Searching data, please wait...',
    checkin: 'Checking...',
    notfond: 'Name-ID combination not found!',
    reqerrr: 'Request error!',
    updatin: 'Server is updating data. Please retry in a few moments...',
    interrr: 'Internal error!',
    testing: 'Looking for server, please wait...'
};
// Initialize IP variables
var ip;
const ipUrl = 'https://mushinako.github.io/Check-Hours/ip.txt';
var phpUrl;
// Date regexes
const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{2,4}\s*\-\s*\d{1,2}\/\d{1,2}\/\d{2,4}$/;
/**
 * Too lazy to type document.getElementbyId again and again
 *
 * @param {string} e - ID of the element
 **/
const byId = (e) => document.getElementById(e);
/**
 * Map IDs to input elements
 *
 * @param {string[]} ids - IDs of the elements
 **/
const inputsFromIds = (ids) => ids.map((id) => byId(id));
// Elements
const tblDiv = byId('data');
const form = byId('input');
const submit = byId('submit');
const stat = byId('stat');
const ins = inputsFromIds(['fname', 'lname', 'id', 'pass']);
const outs = inputsFromIds(['serv', 'lead', 'fell']);
/**
 * Success
 *
 * @param {string} text - Text to be put
 **/
const suc = (text) => putInStat(text, '#1b5e20');
/**
 * Warning
 *
 * @param {string} text - Text to be put
 **/
const war = (text) => putInStat(text, '#f57f17');
/**
 * Error
 *
 * @param {string} text - Text to be put
 **/
const err = (text) => putInStat(text, '#d50000');
/**
 * Connection error
 **/
const errCon = () => err(str['timeout']);
/**
 * Format number to 2 digits
 *
 * @param   {number} n - Number to be formatted
 * @returns {string}   - Formatted string
 */
const numFormat = (n) => (Math.round(n * 100) / 100).toFixed(2);
/**
 * GET fetch
 *
 * @param   {string}            url - URL to be fetched
 * @returns {Promise<Response>}     - Promise of response
 */
const getFetch = (url) => fetch(url, {
    method: 'GET'
});
/**
 * POST fetch
 *
 * @param   {string}            url  - URL to send data to
 * @param   {dict}              data - Data to send
 * @returns {Promise<Response>}      - Promise of response
 */
const postFetch = (url, data) => fetch(url, {
    method: 'POST',
    headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: Object.entries(data).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
});
/**
 * Put text in stat
 *
 * @param {string} text  - Text to be put
 * @param {string} color - Color to change to
 **/
function putInStat(text, color) {
    stat.style.color = color;
    stat.value = text;
}
/**
 * Check form existence and validity
 *
 * @returns {boolean} - Form validity
 **/
function checkForm() {
    // Check form existence because who knows...
    if (!form || ins.some((e) => !e)) {
        err(str['malfunc']);
        window.location.reload(true);
        return false;
    }
    // Focus on all inputs for better input error texts
    for (let e of ins)
        e.focus();
    // Prompt for invalid input
    if (!form.checkValidity()) {
        err(str['invinpt']);
        return false;
    }
    // A valid student ID should be 11 mod 13
    if (parseInt(byId('id').value) % 13 !== 11) {
        byId('id').focus();
        err(str['invstid']);
        return false;
    }
    // Yeah successful
    return true;
}
/**
 * Get and submit data
 *
 * @param   {string}            fn - Filename of PHP file to be accessed
 * @returns {Promise<Response>}    - Server response promise
 **/
function submitData(fn) {
    // Get an object with input ID's as keys and input values as values
    const data = ins.reduce((acc, cur) => {
        acc[cur.id] = cur.value.trim().toLowerCase();
        return acc;
    }, {});
    // Send request and return promise
    return postFetch(fn, data);
}
/**
 * Convert Excel date number to date string
 *
 * @param   {number} date - Date number
 * @returns {string}      - Date string in mm/dd/yyyy format
 **/
function excelDate(date) {
    let sub;
    if (date > 60) {
        // After 1900/02/29
        sub = 25568;
    } else if (date > 0 && date < 60) {
        // Before 1900/02/29
        sub = 25567;
    } else {
        // Invalid date
        return date.toString();
    }
    let dateObj = new Date((date - sub) * 86400 * 1000);
    return `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
}
/**
 * Clean date range string
 *
 * @param   {string} dateRange - Date range
 * @returns {string}           - Date range string in mm/dd/yyyy format
 **/
function dateRange(dateRange) {
    let dates = dateRange.replace(/\s/g, '').split('-');
    let datesFormatted = dates.map((date) => {
        let dateArr = date.split('/');
        if (dateArr.length === 3 && dateArr[2].length === 2)
            dateArr[2] = `20${dateArr[2]}`;
        return dateArr.join('/');
    });
    return datesFormatted.join(' - ');
}
/**
 * Parse response
 *
 * @param {resObj} res - Data response
 **/
function parseResponse(res) {
    // Fill in numbers
    for (let e of outs)
        e.value = numFormat(res[e.id]);
    // Fill in table
    const data = res.data;
    const tbl = document.createElement('table');
    // Create header
    const thead = document.createElement('thead');
    let tr = document.createElement('tr');
    for (let head of ['Date', 'Event', 'S', 'L', 'F']) {
        let th = document.createElement('th');
        let text = document.createTextNode(head);
        th.appendChild(text);
        tr.appendChild(th);
    }
    thead.appendChild(tr);
    tbl.appendChild(thead);
    // Actual data
    const tbody = document.createElement('tbody');
    for (let row of data) {
        let tr = document.createElement('tr');
        // Add date
        let date;
        if (typeof row.date === 'number') {
            // Number date
            date = excelDate(row.date);
        } else if (dateRegex.test(row.date)) {
            // Date range
            date = dateRange(row.date);
        } else {
            // Unrecognized
            date = row.date;
        }
        let td = document.createElement('td');
        let text = document.createTextNode(date);
        td.appendChild(text);
        tr.appendChild(td);
        // Add event name
        td = document.createElement('td');
        text = document.createTextNode(row.evnt);
        td.appendChild(text);
        tr.appendChild(td);
        // Add hours
        for (let hour of [row.serv, row.lead, row.fell]) {
            td = document.createElement('td');
            if (hour) {
                text = document.createTextNode(numFormat(hour));
                td.appendChild(text);
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    tbl.appendChild(tbody);
    tblDiv.appendChild(tbl);
    // Success indicator
    suc(str['success']);
}
/**
 * Search main function
 **/
function search() {
    // Empty outputs
    for (let e of outs)
        e.value = '';
    while (tblDiv.lastChild)
        tblDiv.removeChild(tblDiv.lastChild);
    // Stop if invalid form
    if (!checkForm())
        return;
    // Prompt for attempt
    war(str['loading']);
    for (let e of outs)
        e.value = str['checkin'];
    // Post search
    submitData(`http://${ip}/php/search.php`).then((res) => {
        // Check request success
        if (res.status !== 200) {
            err('Internal Error!');
            return;
        }
        return res.json();
    }).then((data = {
        stat: 99
    }) => {
        // Clear 'Checking' indicators
        for (let e of outs)
            e.value = '';
        // Analyze response data
        switch (data['stat']) {
            case -1:
                err(str['notfond']);
                return;
            case -2:
                err(str['reqerrr']);
                return;
            case -3:
                err(str['updatin']);
                return;
            case 0:
                parseResponse(data);
                return;
            default:
                err(str['interrr']);
                return;
        }
    }).catch(errCon);
}
/**
 * Get time from server, also test connection
 **/
function time() {
    getFetch(`http://${ip}/php/search.php`).then((res) => {
        // Check request success
        if (res.status !== 200) {
            errCon();
            return;
        }
        return res.text();
    }).then((text) => {
        if (text === undefined || text === null)
            return;
        suc(str['testres'] + text);
        for (let e of ins)
            e.disabled = false;
        submit.disabled = false;
        // Click event
        submit.addEventListener('click', (e) => {
            e.preventDefault();
            search();
        });
        // Enter key event
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                search();
            }
        });
        // Focus on first input
        byId('fname').focus();
    }).catch(errCon);
}
/**
 * Initiations: Get server IP, Test connection and get time, etc.
 **/
function init() {
    // Connection test indicator
    war(str['testing']);
    // Get IP
    getFetch(ipUrl).then((res) => {
        // Check get IP success
        if (res.status !== 200) {
            errCon();
            return;
        }
        return res.text();
    }).then((text) => {
        // Assign server IP
        ip = `${text.trim()}:38080`;
        // Contact server to test connection
        time();
    }).catch(errCon);
}
// Onload
document.addEventListener('DOMContentLoaded', () => {
    let p = [
        '  ___________  ____   ___    _______ ______',
        ' / ___/ __/ / / / /  / _ )  / ___/ //_/  _/',
        '/ /___\\ \\/ /_/ / /__/ _  | / /__/ ,< _/ /',
        '\\___/___/\\____/____/____/  \\___/_/|_/___/',
        '',
        ' Bug Reports Welcomed!'
    ];
    console.log(p.join('\n'));
    init();
});