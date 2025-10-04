/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.88, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "021 - /actions/Account.action;jsessionid=BF49D44EA8540FCE37C1A1D090F491C6 ()"], "isController": false}, {"data": [1.0, 500, 1500, "039 - /actions/Order.action ()"], "isController": false}, {"data": [1.0, 500, 1500, "024 - /actions/Catalog.action ()"], "isController": false}, {"data": [1.0, 500, 1500, "023 - /actions/Account.action ()-0"], "isController": false}, {"data": [1.0, 500, 1500, "Add to cart"], "isController": true}, {"data": [1.0, 500, 1500, "Preceed to checkout"], "isController": true}, {"data": [1.0, 500, 1500, "038 - /actions/Order.action ()"], "isController": false}, {"data": [1.0, 500, 1500, "023 - /actions/Account.action ()-1"], "isController": false}, {"data": [0.5, 500, 1500, "Signout"], "isController": true}, {"data": [1.0, 500, 1500, "Click on continue"], "isController": true}, {"data": [1.0, 500, 1500, "042 - /actions/Catalog.action ()"], "isController": false}, {"data": [1.0, 500, 1500, "030 - /actions/Catalog.action ()"], "isController": false}, {"data": [0.5, 500, 1500, "Login"], "isController": true}, {"data": [0.0, 500, 1500, "Launch"], "isController": true}, {"data": [1.0, 500, 1500, "Click on fish"], "isController": true}, {"data": [1.0, 500, 1500, "023 - /actions/Account.action ()"], "isController": false}, {"data": [1.0, 500, 1500, "026 - /actions/Catalog.action ()"], "isController": false}, {"data": [1.0, 500, 1500, "041 - /actions/Account.action ()-1"], "isController": false}, {"data": [1.0, 500, 1500, "041 - /actions/Account.action ()-0"], "isController": false}, {"data": [1.0, 500, 1500, "036 - /actions/Order.action ()"], "isController": false}, {"data": [1.0, 500, 1500, "033 - /actions/Cart.action ()"], "isController": false}, {"data": [1.0, 500, 1500, "041 - /actions/Account.action ()"], "isController": false}, {"data": [1.0, 500, 1500, "select product ID"], "isController": true}, {"data": [1.0, 500, 1500, "Click on confirm"], "isController": true}, {"data": [0.0, 500, 1500, "003 - /actions/Catalog.action ()"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 16, 0, 0.0, 335.62499999999994, 169, 1910, 191.0, 916.700000000001, 1910.0, 1910.0, 3.5390400353904004, 15.230357290975448, 3.6245783565582834], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["021 - /actions/Account.action;jsessionid=BF49D44EA8540FCE37C1A1D090F491C6 ()", 1, 0, 0.0, 183.0, 183, 183, 183.0, 183.0, 183.0, 183.0, 5.46448087431694, 21.863259904371585, 4.653346994535519], "isController": false}, {"data": ["039 - /actions/Order.action ()", 1, 0, 0.0, 196.0, 196, 196, 196.0, 196.0, 196.0, 196.0, 5.1020408163265305, 27.239118303571427, 4.170320471938775], "isController": false}, {"data": ["024 - /actions/Catalog.action ()", 1, 0, 0.0, 182.0, 182, 182, 182.0, 182.0, 182.0, 182.0, 5.4945054945054945, 27.901785714285715, 4.818423763736264], "isController": false}, {"data": ["023 - /actions/Account.action ()-0", 1, 0, 0.0, 200.0, 200, 200, 200.0, 200.0, 200.0, 200.0, 5.0, 1.123046875, 5.78125], "isController": false}, {"data": ["Add to cart", 1, 0, 0.0, 195.0, 195, 195, 195.0, 195.0, 195.0, 195.0, 5.128205128205129, 24.363982371794872, 4.407051282051282], "isController": true}, {"data": ["Preceed to checkout", 1, 0, 0.0, 179.0, 179, 179, 179.0, 179.0, 179.0, 179.0, 5.58659217877095, 30.715345670391063, 4.691864525139665], "isController": true}, {"data": ["038 - /actions/Order.action ()", 1, 0, 0.0, 181.0, 181, 181, 181.0, 181.0, 181.0, 181.0, 5.524861878453039, 25.741324240331494, 7.893430593922652], "isController": false}, {"data": ["023 - /actions/Account.action ()-1", 1, 0, 0.0, 288.0, 288, 288, 288.0, 288.0, 288.0, 288.0, 3.472222222222222, 17.632378472222225, 3.3433702256944446], "isController": false}, {"data": ["Signout", 1, 0, 0.0, 592.0, 592, 592, 592.0, 592.0, 592.0, 592.0, 1.6891891891891893, 16.910037478885137, 4.166886613175676], "isController": true}, {"data": ["Click on continue", 1, 0, 0.0, 181.0, 181, 181, 181.0, 181.0, 181.0, 181.0, 5.524861878453039, 25.741324240331494, 7.893430593922652], "isController": true}, {"data": ["042 - /actions/Catalog.action ()", 1, 0, 0.0, 183.0, 183, 183, 183.0, 183.0, 183.0, 183.0, 5.46448087431694, 26.537952527322403, 4.4772455601092895], "isController": false}, {"data": ["030 - /actions/Catalog.action ()", 1, 0, 0.0, 187.0, 187, 187, 187.0, 187.0, 187.0, 187.0, 5.347593582887701, 22.466159759358288, 4.58514371657754], "isController": false}, {"data": ["Login", 1, 0, 0.0, 856.0, 856, 856, 856.0, 856.0, 856.0, 856.0, 1.1682242990654206, 16.801210207359812, 4.494925525700935], "isController": true}, {"data": ["Launch", 1, 0, 0.0, 1910.0, 1910, 1910, 1910.0, 1910.0, 1910.0, 1910.0, 0.5235602094240839, 2.8959424083769636, 0.3543234620418848], "isController": true}, {"data": ["Click on fish", 1, 0, 0.0, 178.0, 178, 178, 178.0, 178.0, 178.0, 178.0, 5.617977528089887, 22.62552668539326, 4.641415028089888], "isController": true}, {"data": ["023 - /actions/Account.action ()", 1, 0, 0.0, 491.0, 491, 491, 491.0, 491.0, 491.0, 491.0, 2.0366598778004072, 10.79986634419552, 4.3159686863543785], "isController": false}, {"data": ["026 - /actions/Catalog.action ()", 1, 0, 0.0, 178.0, 178, 178, 178.0, 178.0, 178.0, 178.0, 5.617977528089887, 22.62552668539326, 4.641415028089888], "isController": false}, {"data": ["041 - /actions/Account.action ()-1", 1, 0, 0.0, 239.0, 239, 239, 239.0, 239.0, 239.0, 239.0, 4.184100418410042, 20.626307531380753, 3.428183838912134], "isController": false}, {"data": ["041 - /actions/Account.action ()-0", 1, 0, 0.0, 169.0, 169, 169, 169.0, 169.0, 169.0, 169.0, 5.9171597633136095, 1.3290495562130176, 4.900147928994082], "isController": false}, {"data": ["036 - /actions/Order.action ()", 1, 0, 0.0, 179.0, 179, 179, 179.0, 179.0, 179.0, 179.0, 5.58659217877095, 30.715345670391063, 4.691864525139665], "isController": false}, {"data": ["033 - /actions/Cart.action ()", 1, 0, 0.0, 195.0, 195, 195, 195.0, 195.0, 195.0, 195.0, 5.128205128205129, 24.363982371794872, 4.407051282051282], "isController": false}, {"data": ["041 - /actions/Account.action ()", 1, 0, 0.0, 409.0, 409, 409, 409.0, 409.0, 409.0, 409.0, 2.444987775061125, 12.602192848410759, 4.02802185207824], "isController": false}, {"data": ["select product ID", 1, 0, 0.0, 187.0, 187, 187, 187.0, 187.0, 187.0, 187.0, 5.347593582887701, 22.466159759358288, 4.58514371657754], "isController": true}, {"data": ["Click on confirm", 1, 0, 0.0, 196.0, 196, 196, 196.0, 196.0, 196.0, 196.0, 5.1020408163265305, 27.239118303571427, 4.170320471938775], "isController": true}, {"data": ["003 - /actions/Catalog.action ()", 1, 0, 0.0, 1910.0, 1910, 1910, 1910.0, 1910.0, 1910.0, 1910.0, 0.5235602094240839, 2.8959424083769636, 0.3543234620418848], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 16, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
