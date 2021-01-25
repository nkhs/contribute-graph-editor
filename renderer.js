const { ipcRenderer } = require('electron')
// var $ = global.jQuery = require('./jquery-3.5.1.min');

var getDates = (year) => {
    var now = new Date();
    var start = new Date(year, 0, 0);
    var diff = now - start;
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);
    console.log('Day of year: ' + day);
    return day;
}
function days_of_a_year(year) {
    return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0) ? 366 : 365;
}

var selectedYear = 2020;

$(document).ready(() => {

    var drawGrid = () => {
        var c = $('#container');
        c.html('')

        var date = new Date(selectedYear, 0, 1);
        console.error(date)

        var day = date.getDay();
        var index = 1;
        for (var kk = 0; kk < 1; kk++) {
            var row = `<div class="d-flex flex-column">`
            for (var i = 0; i < 7; i++) {
                var classS = i > day ? ' bg-success1' : ''
                var tt = i >= day ? index : '';
                if (tt) index++;
                var oneCol = `<span class="item noselect ${classS}" data-date="${tt}" data-toggle="tooltip" data-placement="top" title="${tt}"></span>`;
                row = row + oneCol
            }
            row += `</div>`
            c.append(row)
        }
        tt = tt + 1;
        var total = days_of_a_year(selectedYear);

        for (var kk = 0; kk < (total - day) / 7; kk++) {

            var row = `<div class="d-flex flex-column">`
            for (var i = 0; i < 7; i++) {
                var classS = tt <= total ? ' bg-success1' : ''

                var oneCol = `<span class="item noselect ${classS}" data-date="${tt <= total ? tt : ''}" data-toggle="tooltip" data-placement="top" title="${tt}"></span>`;
                tt++;
                row = row + oneCol
            }
            row += `</div>`

            c.append(row)

        }
    }


    getClass = (total, v) => {
        var level1 = total - 0.1 * total;
        var level2 = total - 0.4 * total;
        var level3 = total - 0.7 * total;
        var level4 = total - 0.99 * total;

        if (v > level1) return 'l1'
        if (v > level2) return 'l2'
        if (v > level3) return 'l3'
        if (v > level4) return 'l4'
        return ''
    }

    drawGrid();

    var total = 0;

    $("body").on("click", ".item", function () {
        console.log($(this).data('date'))
        ipcRenderer.invoke('perform-action', { days: $(this).data('date'), needData: false })

        var k = $(this).data('date');
        var span = $(`[data-date='${k}']`)
        var v = parseInt($(this).html()) > 0 ? parseInt($(this).html()) : 0;
        v = v + 1;

        if (v > total) total = v;

        span.html(v)
        span.removeClass('l1 l2 l3 l4')
        span.addClass(getClass(total, v))

    });
    $('#year').change(function () {
        total = 0;
        selectedYear = $(this).val();
        ipcRenderer.invoke('data', { year: selectedYear })
        drawGrid();
    })

    ipcRenderer.on('data', (e, message) => {
        console.log(message)
        // alert(8)
        var logs = message.logs;
        var keys = Object.keys(logs);


        keys.forEach(k => {
            if (logs[k] > total) total = logs[k];
        });

        keys.forEach(k => {
            var span = $(`[data-date='${k}']`)
            var v = logs[k];
            span.html(v)
            span.removeClass('l1 l2 l3 l4')
            span.addClass(getClass(total, v))
        })

    })

    ipcRenderer.invoke('data', { year: selectedYear })
});
