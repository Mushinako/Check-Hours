"use strict";

// Load function type
type loadFunc = (req: Response) => void;

// Response table type
type resTbl = {
    date: number | string,
    event: string,
    serv: number | null,
    lead: number | null,
    fell: number | null
};

// Response object type
type resObj = {
    stat: number,
    serv: number,
    lead: number,
    fell: number,
    data: resTbl[]
};

// Dictionary type
type dict = Record<string, string>;

// Strings
const str: dict = {
    timeout: 'Connection failure! Please retry in a few moments...',
    testres: 'Ready for query',
    malfunc: 'Webpage malfunction! Reloading...',
    invinpt: 'Invalid input!',
    invstid: 'You may have mistyped your student ID. Please double check.',
    success: 'Success',
    loading: 'Searching data...',
    checkin: 'Checking...',
    notfond: 'Name-ID combination not found!',
    reqerrr: 'Request error!',
    updatin: 'Server is updating data. Please retry in a few moments...',
    interrr: 'Internal error!',
    testing: 'Looking for server...'
};

// Initialize IP variable
var ip: string;
const ipUrl: string = 'https://mushinako.github.io/Check-Hours/ip.txt';

// Date regexes
const dateRegex: RegExp = /^\d{1,2}\/\d{1,2}\/\d{2,4}\s*\-\s*\d{1,2}\/\d{1,2}\/\d{2,4}$/;

/**
 * Too lazy to type document.getElementbyId again and again
 *
 * @param {string} e - ID of the element
 **/
const byId = (e: string): HTMLElement => document.getElementById(e);

/**
 * Map IDs to input elements
 *
 * @param {string[]} ids - IDs of the elements
 **/
const inputsFromIds = (ids: string[]): HTMLInputElement[] => ids.map((id: string): HTMLInputElement => <HTMLInputElement>byId(id));

// Elements
const tblDiv: HTMLDivElement = <HTMLDivElement>byId('data');
const form: HTMLFormElement = <HTMLFormElement>byId('input');
const submit: HTMLButtonElement = <HTMLButtonElement>byId('submit');
const ins: HTMLInputElement[] = inputsFromIds(['fname', 'lname', 'id', 'pass']);
const outs: HTMLInputElement[] = inputsFromIds(['serv', 'lead', 'fell']);

/**
 * Success
 *
 * @param {string} text - Text to be put
 **/
const suc = (text: string): void => putInStat(text, '#1b5e20');

/**
 * Warning
 *
 * @param {string} text - Text to be put
 **/
const war = (text: string): void => putInStat(text, '#f57f17');

/**
 * Error
 *
 * @param {string} text - Text to be put
 **/
const err = (text: string): void => putInStat(text, '#d50000');

/**
 * Connection error
 **/
const errCon = (): void => err(str['timeout']);

/**
 * Format number to 2 digits
 *
 * @param   {number} n - Number to be formatted
 * @returns {string}   - Formatted string
 */
const numFormat = (n: number): string => (Math.round(n * 100) / 100).toFixed(2);

/**
 * GET fetch
 *
 * @param   {string}            url - URL to be fetched 
 * @returns {Promise<Response>}     - Promise of response
 */
const getFetch = (url: string): Promise<Response> => fetch(url, {
    method: 'GET'
});

/**
 * POST fetch
 *
 * @param   {string}            url  - URL to send data to
 * @param   {dict}              data - Data to send
 * @returns {Promise<Response>}      - Promise of response
 */
const postFetch = (url: string, data: dict): Promise<Response> => fetch(url, {
    method: 'POST',
    headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: Object.entries(data).map(
        ([k, v]: [string, string]): string => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
    ).join('&')
});

/**
 * Put text in stat
 *
 * @param {string} text  - Text to be put
 * @param {string} color - Color to change to
 **/
function putInStat(text: string, color: string): void {
    let stat: HTMLInputElement = <HTMLInputElement>byId('stat');
    stat.style.color = color;
    stat.value = text;
}

/**
 * Check form existence and validity
 *
 * @returns {boolean} - Form validity
 **/
function checkForm(): boolean {
    // Check form existence because who knows...
    if (!form || ins.some((e: HTMLInputElement): boolean => !e)) {
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
    if (parseInt((<HTMLInputElement>byId('id')).value) % 13 !== 11) {
        (<HTMLInputElement>byId('id')).focus();
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
function submitData(fn: string): Promise<Response> {
    // Get an object with input ID's as keys and input values as values
    let data: dict = ins.reduce((acc: dict, cur: HTMLInputElement): dict => {
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
function excelDate(date: number): string {
    let sub: number;
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
    let dateObj: Date = new Date((date - sub) * 86400 * 1000);
    return `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
}

/**
 * Convert Excel date number to date string
 *
 * @param   {string} dateRange - Date range
 * @returns {string}           - Date string in mm/dd/yyyy format
 **/
function dateRange(dateRange: string): string {
    let dates: string[] = dateRange.replace(/\s/g, '').split('-');
    let datesFormatted: string[] = dates.map((date: string): string => {
        let dateArr: string[] = date.split('/');
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
function parseResponse(res: resObj): void {
    // Fill in numbers
    for (let e of outs)
        e.value = numFormat(res[e.id]);
    // Fill in table
    const data: resTbl[] = res.data;
    const tbl: HTMLTableElement = document.createElement('table');
    // Create header
    const thead: HTMLTableSectionElement = document.createElement('thead');
    let tr: HTMLTableRowElement = document.createElement('tr');
    for (let head of ['Date', 'Event', 'S', 'L', 'F']) {
        let th: HTMLTableHeaderCellElement = document.createElement('th');
        let text: Text = document.createTextNode(head);
        th.appendChild(text);
        tr.appendChild(th);
    }
    thead.appendChild(tr);
    tbl.appendChild(thead);
    // Actual data
    const tbody: HTMLTableSectionElement = document.createElement('tbody');
    for (let row of data) {
        let tr: HTMLTableRowElement = document.createElement('tr');
        // Add date
        let date: string;
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
        let td: HTMLTableCellElement = document.createElement('td');
        let text: Text = document.createTextNode(date);
        td.appendChild(text);
        tr.appendChild(td);
        // Add event name
        td = document.createElement('td');
        text = document.createTextNode(row.event);
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
function search(): void {
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
    submitData(`http://${ip}/php/search.php`).then((res: Response): Promise<resObj> => {
        // Check request success
        if (res.status !== 200) {
            err('Internal Error!');
            return;
        }
        return res.json();
    }).then((data: resObj): void => {
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
function time(): void {
    getFetch(`http://${ip}/php/search.php`).then((res: Response): void => {
        // Check request success
        if (res.status !== 200) {
            errCon();
            return;
        }
        // Show data
        // suc(`Data Fetched at ${req.responseText}`);
        suc(str['testres']);
        for (let e of ins) {
            e.disabled = false;
        }
        submit.disabled = false;
        // Click event
        submit.addEventListener('click', (e: MouseEvent): void => {
            e.preventDefault();
            search();
        });
        // Enter key event
        document.addEventListener('keydown', (e: KeyboardEvent): void => {
            if (e.key === 'Enter') {
                e.preventDefault();
                search();
            }
        });
        // Focus on first input
        (<HTMLInputElement>byId('fname')).focus();
    }).catch(errCon);
}

/**
 * Initiations: Get server IP, Test connection and get time, etc.
 **/
function init(): void {
    // Connection test indicator
    war(str['testing']);
    // Get IP
    getFetch(ipUrl).then((res: Response): Promise<string> => {
        // Check get IP success
        if (res.status !== 200) {
            errCon();
            return;
        }
        return res.text();
    }).then((text: string): void => {
        // Assign server IP
        ip = `${text.trim()}:38080`;
        // Contact server to test connection
        time();
    }).catch(errCon);
}

// Onload
document.addEventListener('DOMContentLoaded', () => {
    let p: string[] = [
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