// Bug reports welcomed!
"use strict";

// Initialize IP variable
var ip;

/**
 * Check form existence and validity
 *
 * @return {boolean}      - Form validity
 **/
function checkForm() {
    let ins = ['fname', 'lname', 'id', 'pass'];
    // Check form existence because who knows...
    if (!byID('input') || ins.some((val) => !byID(val))) {
        err('Internal Error! Reloading...');
        window.location.reload(true);
        return false;
    }
    // Focus on all inputs for better input error texts
    for (let x of ins)
        byID(x).focus();
    byID(ins[ins.length - 2]).blur();
    // Prompt for invalid input
    if (!byID('input').checkValidity()) {
        err('Invalid Input');
        return false;
    }
    // A valid student ID should be 11 mod 13
    if (parseInt(byID('id').value) % 13 !== 11) {
        byID('id').focus();
        err('You may have mistyped your student ID. Please double check.');
        return false;
    }
    return true;
}

/**
 * Get and submit data
 *
 * @param {string}   fn      - Filename of PHP file to be accessed
 * @param {Function} load    - Callback for load
 * @param {string[]} ins     - List of ID's of inputs
 * @param {number}   attempt - Attempt number
 * @param {Function} restart - Callback for another attempt
 **/
function submitData(fn, load, ins, attempt, restart) {
    // Get an object with input ID's as keys and input values as values
    let data = ins.reduce((acc, cur) => {
        acc[cur] = byID(cur).value.trim().toLowerCase();
        return acc;
    }, {});
    xhr(fn, load, () => {
        switch (attempt) {
            case 0:
                war('Connection to Crappy Server Timed Out, 1st Retry...');
                break;
            case 1:
                war('Connection to Crappy Server Timed Out, 2nd Retry...');
                break;
            default:
                err('Connection to Crappy Server Timed Out!');
                return;
        }
        restart(attempt + 1);
    }, true, data);
}

/**
 * Simple XHR
 *
 * @param {string}        path    - Path of XHR
 * @param {Function}      load    - Callback for load
 * @param {EventListener} timeout - Callback for timeout
 * @param {boolean}       method  - false for get, true for post
 * @param {object}        data    - If post, data to be sent
 **/
function xhr(path, load, timeout, method, data = {}) {
    let xhr = new XMLHttpRequest();
    // 10-sec timeout
    xhr.timeout = 10000;
    xhr.addEventListener('timeout', timeout);
    // Onload
    xhr.addEventListener('load', () => load(xhr));
    if (method) {
        // Post
        xhr.open('POST', path);
        // Response always in JSON
        xhr.responseType = 'json';
        // Always submit as URL-encoded
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        // Send in URL-encoded format
        xhr.send(Object.entries(data).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join(
            '&'));
    } else {
        // Get
        xhr.open('GET', path);
        // Send
        xhr.send();
    }
}

/**
 * Put text in stat
 *
 * @param {string} text  - Text to be put
 * @param {string} color - Color to change to
 **/
function putInStat(text, color) {
    let stat = byID('stat');
    stat.style.color = color;
    stat.value = text;
}

/**
 * Too lazy to type document.getElementById again and again
 *
 * @param {string} e - ID of the element
 **/
const byID = (e) => document.getElementById(e);

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
const errCon = () => err('Connection to Crappy Server Timed Out!');

/**
 * Search main function
 *
 * @param {number} attempt - Attempt number
 **/
function search(attempt = 0) {
    const ins = ['fname', 'lname', 'id', 'pass'];
    const outs = [byID('serv'), byID('lead'), byID('fell')];
    const tbl = byID('data');
    // Empty outputs
    for (let x of outs)
        x.value = '';
    // Stop if invalid form
    if (!checkForm())
        return;
    // Prompt for first attempt
    if (!attempt) {
        war('Searching Data on Crappy Server...');
        for (let x of outs)
            x.value = 'Checking...';
    }
    submitData(`http://${ip}/php/search.php`, (x) => {
        if (x.status === 200) {
            for (let y of outs)
                y.value = '';
            switch (x.response['stat']) {
                case 1:
                    err('Name-ID Combination not Found!');
                    return;
                case -2:
                    err('Request Error!');
                    return;
                case -3:
                    err('Server is Updating Data, Please Retry in a Few Moments...');
                    return;
                case 0:
                    for (let y of outs)
                        y.value = (Math.round(parseFloat(x.response[y]) * 100) / 100).toFixed(2);
                    suc('Success');
                    return;
                default:
                    err(x.response['data']);
            }
        }
        err('Internal Error!');
    }, ins, attempt, search);
}

/**
 * Get time from server, also test connection
 *
 * @param {string} ip - Server IP
 **/
let time = () => xhr(`http://${ip}/php/search.php`, (x) => {
    if (x.status == 200) {
        suc('Data Fetched at ' + x.responseText);
        for (let x of ['submit', 'fname', 'lname', 'id', 'pass'])
            byID(x).disabled = false;
    } else
        errCon();
}, errCon, false);

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
    // Connection test indicator
    war('Testing Connection with Crappy Server...');
    // Get IP
    xhr('https://mushinako.github.io/Check-Hours/ip.txt', (x) => {
        if (x.status !== 200) {
            errCon();
            return;
        }
        ip = x.responseText.trim() + ':38080';
        // Contact server to test connection
        time();
        // Click event
        byID('submit').addEventListener('click', (e) => {
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
        byID('fname').focus();
    }, errCon, false);
});