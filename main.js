const { app, BrowserWindow } = require('electron')
const { exec } = require("child_process");
const { ipcMain } = require('electron')
var selectedYear = 2020;
function days_of_a_year(year) {
  return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0) ? 366 : 365;
}

var getIndexOfDate = (_now) => {
  var start = new Date(_now.getFullYear(), 0, 0);
  var diff = _now - start;
  var oneDay = 1000 * 60 * 60 * 24;
  var day = Math.floor(diff / oneDay);

  return day;
}
var getDates = () => {
  var now = new Date();
  return getIndexOfDate(now);
}

var total = days_of_a_year(new Date().getFullYear());
var fs = require('fs');
const gitlog = require("gitlog").default;
var getLog = () => {
  const options = {
    repo: __dirname,
    number: 5000,
    fields: ["hash", "abbrevHash", "subject", "authorName", "authorDateRel", "committerDate"],
  };

  // Synchronous
  var commits = gitlog(options);

  commits = commits.map(d => {
    delete d.files
    delete d.status
    d.committerDate = new Date(d.committerDate);
    d.dates = getIndexOfDate(d.committerDate)
    return d;
  })

  commits = commits.filter(d => {
    return d.committerDate.getFullYear() == selectedYear;
  })
  var result = commits.reduce(function (r, a) {
    r[a.dates] = r[a.dates] || [];
    r[a.dates].push(a);
    return r;
  }, Object.create(null));

  var final = {};
  var list = Object.keys(result);
  list.forEach(k => {
    final[k] = result[k].length
  })

  return final;
}

var logs;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('index.html')
  global.win = win
  win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

var TWO_NUMBER = (n) => {
  return ('00' + n).slice(-2);
}

ipcMain.handle('perform-action', (event, ...args) => {
  // ... do actions on behalf of the Renderer

  var date = new Date(selectedYear, 0, 1);

  if (parseInt(args[0].days) > 0) {

    date.setDate(parseInt(args[0].days))

    var endDate = `${date.getFullYear()}-${TWO_NUMBER(date.getMonth() + 1)}-${TWO_NUMBER(date.getDate())}T00:00:00,000000000+08:00`;

    fs.appendFileSync('./public/test.js', 'console.log("test");\n');
    exec(`git add . && git commit -m "test" --quiet && git commit --quiet --amend --no-edit --date "${endDate}')"`,
      {
        env:
        {
          LC_ALL: 'C',
          GIT_COMMITTER_DATE: endDate
        },
      }, (error, stdout, stderr) => {
        if (args[0].needData) {
          logs = getLog()
          global.win.webContents.send('data', { logs: logs });
        }
      });
  }

})

ipcMain.handle('data', (event, ...args) => {
  // ... do actions on behalf of the Renderer
  selectedYear = args[0].year;
  logs = getLog()
  global.win.webContents.send('data', { logs: logs });

})