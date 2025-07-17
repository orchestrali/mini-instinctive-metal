const places = "1234567890ETABCD";
var stages;
var type = "grid";
let gridtype = "basic-lines";
var stage, checkedClass;
let mode = "methods";
var bigmethodarr;

var methodNameList;
let methodList;

var svg;
var method;
var rowArray;
var blueBell;
var queryobj;


$(function(){
  
  getlists();
  $("#container").svg({onLoad: (o) => {
    svg = o;
    svg.configure({xmlns: "http://www.w3.org/2000/svg", "xmlns:xlink": "http://www.w3.org/1999/xlink", width: 0, height: 0});
  }});

  //nav toggle
  $("#nav-options").click(function() {
    $("#nav-options ul").slideToggle(600, "swing");
    $(".arrow").toggleClass("rotate");
  });
  
  $("#stage").change(stagechange);
  $('#methodClass').change(classchange);
  $("#methodName").click(methodnameclick);
  //when a method in the dropdown list is clicked on, make it the methodName value and hide the list
  $("#methodList").on("click", "li", function(e) {
    //console.log('method clicked 1');
    $("#methodName").val($(this).text());
    $("#methodList li").hide();
    $(this).siblings().detach();
    e.stopPropagation();
  });
  $("#methodName").on("keyup", methodnamekeyup);
  
  $("#submit").on("click", submitform);
  
});

// INITIAL SETUP

function getlists() {
  $.get("stages.json", function(body) {
    stages = body;
    
    $.get("methodNames.json", function(list) {
      methodNameList = list;
      
      $.get("methods.json", function(arr) {
        bigmethodarr = arr;
        console.log("lists retrieved");
      });
      
    });
  });
}

// FORM ADJUSTMENTS - METHOD INFO

function stagechange() {
  stage = Number($('select#stage option:checked').val());
  //console.log("stage: ", stage);
  checkedClass = "";
  
  //remove methods from name dropdown
  $('ul#methodList').children().detach();
  $("#methodName").val("");
  
  //now getting classes immediately from stages file
  let classes = stages.find(o => o.num == stage).classes;
  
  $('select#methodClass').children().detach();
  $('<option></option>').prop({disabled: true, selected: true}).appendTo('select#methodClass');
  $('<option></option').text("Plain").val("Plain").appendTo("select#methodClass");
  for (var i = 0; i < classes.length; ++i) {
    let text;
    if (["Bob", "Place"].includes(classes[i])) {
      text = "- " + classes[i];
    } else {
      text = classes[i];
    }
    //console.log(classes[i]);
    $('<option></option>').text(text).val(classes[i]).appendTo('select#methodClass');
  }
  
  //if the placeholder and class are blank, set the placeholder
  if ($("#methodName").prop("placeholder") == "" && $("select#methodClass option:checked").text() == "") {
    $("#methodName").prop("placeholder", "Select a stage and class to search methods");
  }
  
  //remove blueBell options and add a blank selected option
  $('select.blueBell').children().detach();
  $('<option>auto</option>').prop({selected: true}).appendTo('select.blueBell');
  blueBell = null;

  blueBellOpts(stage);
  
  // BLUE BELL STUFF - include later!
  /*
  
  
  toggleHunts();
  
  //build options to draw every line
  bluelines = '';
  allLines(stage);
  $('div#everyline > ul').children().remove();
  $('div#everyline > ul').append(bluelines);

  if (type !== "grid" || gridtype !== "everyline") {
    $("div#everyline").find(":input").prop("disabled", true);
  }
  
  */
}

function classchange() {
  stage = Number($('select#stage option:checked').val());
  checkedClass = $('select#methodClass option:checked').val();
  
  //remove methods from dropdown
  $('ul#methodList').children().detach();

  //if there's a stage make the search placeholder blank
  if (stage) {
    $("#methodName").prop("placeholder", "");
    methodList = methodNames(stage, checkedClass);
  }

  $("#methodName").val("");
  //toggleHunts();
}

function hidenamelist() {
  $(document.body).on('click.menuHide', function(){
      var $body = $(this);
      $("#methodList li").hide();
      $body.off('click.menuHide');
  });
}

function searchWarning() {
  $('<li id="warning"></li>').text("Select a stage and class to search methods").css("display", "list-item").appendTo($("#methodList"));
}

function methodnameclick(e) {
  //body click causes methodList to be hidden
  hidenamelist();
  
  //don't trigger body click
  e.stopPropagation();
  
  //check if stage and class are selected and display warning if either isn't
  if (stage == "" || checkedClass == "") {
    if ($('li#warning').length == 0) {
      searchWarning();
    } else if ($('li#warning').length == 1) {
      $('li#warning').css("display", "list-item");
    }
  }
  
  $("#methodList li").css("display", "list-item");
}

function checkname(name, val) {
  let names = [name];
  let vals = [val];
  
  if (/[^a-z\s0-9]/.test(name)) {
    let altname = respell(name);
    if (altname != name) names.push(altname);
    names.forEach(n => {
      if (n.includes("'")) {
        
      }
    });
  }
  
  if (/[^a-z\s0-9]/.test(val)) {
    let altval = respell(val);
    if (altval != val) vals.push(altval);
  }
  
  
  let res = false;
  let i = 0, j = 0;
  do {
    res = names[i].indexOf(vals[j]) > -1;
    j++;
    if (j === vals.length) {
      j = 0;
      i++;
    }
  } while (!res && (i < names.length-1 || (i === names.length-1 && j < vals.length)));
  
  return res;
}

function respell(name) {
  //'.()!-?&,£="/₃₁²™
  //éèëøůáčöåòùûàóìäúñṟāêæâîü
  let lstr = "áàäâāåčçéèëêēe̊íìïîīñóòöôōo̊øṟřšśúùüûūů";
  let letters = {
    a: "áàäâāå",
    //ae: "æ",
    c: "čç",
    e: "éèëêēe̊",
    i: "íìïîī",
    n: "ñ",
    o: "óòöôōo̊ø",
    r: "ṟř",
    s: "šś",
    u: "úùüûūů"
  };
  let alt = "";
  for (let i = 0; i < name.length; i++) {
    if (lstr.indexOf(name[i]) > -1) {
      let l = Object.keys(letters).find(c => letters[c].indexOf(name[i]) > -1);
      alt += l;
    } else {
      alt += name[i];
    }
  }
  return alt;
}

//build filtered methodSet
function getMethods(methods, howMany) {
  let n = 0;
  let methodSet = [];
  do {
    let methodNum = Math.floor(Math.random() * (methods.length));
    methodSet.push(methods[methodNum]);
    methods.splice(methodNum, 1);
    n++
  } while (n < howMany && methods.length > 0)
    return methodSet;
}

//build the list items
function buildList(methods, display) {
  for (var j = 0; j < methods.length; j++) {
    $('<li></li>').text(methods[j]).css("display", display).appendTo($("#methodList"));
  }
}

function filterList(value) {
  //console.log("filtering items");
  $("#methodList li").filter(function() {
    let text = $(this).text().toLowerCase();
    
    $(this).toggle(checkname(text, value));
  });
}

function removeItems(value) {
  //console.log('removing items');
  $("#methodList li").filter(function() {
    let text = $(this).text().toLowerCase();
    return (!checkname(text, value));
  }).remove();
  $("#methodList li").css("display", "list-item");
}

//search json methodNames file, returns array of arrays with methods
function methodNames(stage, checkedClass) {
  
  if (checkedClass == "Plain") {
    var plainClasses = ["Bob", "Place"];
    let classMethods = [];
    for (var i = 0; i < plainClasses.length; i++) {

      let methods = methodNameList.find(o => o.stage == stage).classes.find(o => o.class == plainClasses[i]).methods;
      for (var j = 0; j < methods.length; j++) {
        classMethods.push(methods[j]);
      }
    }
    //console.log("length of classMethods", classMethods.length);
    return classMethods;
  } else {
    let classMethods = methodNameList.find(o => o.stage == stage).classes.find(o => o.class == checkedClass).methods;
  //console.log("length of classMethods", classMethods.length);
    return classMethods;
  }
  
}

function methodnamekeyup(event) {
  hidenamelist();
  
  stage = Number($('select#stage option:checked').val());
  checkedClass = $('select#methodClass option:checked').val();
  
  //value = whatever's been typed
  let value = $(this).val().toLowerCase();
  let altval = respell(value);
  //warn people to pick stage and class if they haven't
  if (stage == "" || checkedClass == "") {
    if ($('li#warning').length == 0) {
      searchWarning();
    } else if ($('li#warning').length == 1) {
      $('li#warning').css("display", "list-item");
    }
  } else if (/^[^\s]/.test(value)) {
    
    let stageName = getStageName(stage);
    
    //calculate number of methods in the class
    let numArrays = methodList.length;
    let numMethods = 0;
    for (var i = 0; i < numArrays; ++i) {
      numMethods += methodList[i].length;
    }
    
    //remove the message to pick stage and class
    $("li#warning").remove();
    //remove message about unrecognized character
    $("li#badChar").remove();
    //remove message about no methods
    $("li#noMethods").remove();
    
    let methods = [];
    let numMatch = 0;
    //if there are fewer than 16 methods, add all to an array
    if (numMethods < 16) {
      for (var j = 0; j < numMethods; j++) {
        //chop off the stage name
        let text = methodList[0][j].substring(0,methodList[0][j].length-1-stageName.length);
        methods.push(text);
        if (checkname(text.toLowerCase(), value)) {
          numMatch++;
        }
      }
    } else {
      //if there are ≥16 methods, make an array of those that match search
      for (var j = 0; j < numArrays; ++j) {
        for (var k = 0; k < methodList[j].length; ++k) {
          let method = methodList[j][k].substring(0,methodList[j][k].length-1-stageName.length);
          if (checkname(method.toLowerCase(), value)) {
            methods.push(method);
            numMatch++;
          }
        }
      }
    }
    
    //if no methods match, say so
    if (numMatch == 0) {
      $("#methodList li").remove();
      $('<li id="noMethods"></li>').text("no methods match search").css("display", "list-item").appendTo($("#methodList"));
    } else {
      //if some methods match search
      
      //if nothing's been added to the methodList yet
      if ($("#methodList li").length == 0) {

        //if there are fewer than 16 methods, just add all of them
        if (numMethods < 16) {
          buildList(methods, "none");
          //apply the filter next
          filterList(value);
        } else {
          //if there are <16 methods that match, display them all
          if (methods.length < 16) {
            buildList(methods, "list-item");
          } else {
            let methodSet = [];
            let numMethods = 15;
            //if there are 16 or more methods, add 15 at random to a different array and display those
            if (methods.indexOf("Little Bob") > -1) {
              methodSet.push("Little Bob");
              methods.splice(methods.indexOf("Little Bob"), 1);
              numMethods -= 1;
            }
            methodSet = methodSet.concat(getMethods(methods, numMethods));
            buildList(methodSet, "list-item");
          }
        } 
      } else {
        //if there IS a methodList already
        //var methods will already be updated with new search, if there were ≥ 16 in class
        //check how many current items match the new search
        let currentMatch = [];
        for (let i = 1; i <= $("#methodList li").length; i++) {
          let text = $("#methodList li:nth-child("+ i + ")").text();
          if (checkname(text.toLowerCase(), value)) {
            currentMatch.push(text);
          }
        }
        
        //console.log('methods that still match search:', currentMatch)
        //if fewer than 15 current methods match the new search, remove the ones that don't match and add new
        if (currentMatch.length < 15) {
          removeItems(value);
          //console.log("method array length 1", methods.length);
          //remove the current list items from the method array
          for (let i = 0; i < currentMatch.length; ++i) {
            let index = methods.indexOf(currentMatch[i]);
            //console.log("removing " + methods[index]);
            methods.splice(index, 1);

          }
          //console.log("method array length 2", methods.length);
          //get new methods from the pruned array
          let methodSet = getMethods(methods, 15-currentMatch.length);
          //console.log(methodSet);
          buildList(methodSet, "list-item");

        } else {
          $("#methodList li").css("display", "list-item");
        }
        
      }
      //end of something
      
      //down arrow
      if (event.which == 40) {
        //console.log($("#methodList li.selected"));
        if ($("#methodList li.selected")[0]) {
          //console.log($("#methodList li.selected").next());
          $("#methodList li.selected").nextAll().filter(function (index) {
            return $(this).css("display") == "list-item";
          }).first().addClass("selected");

          $("#methodList li.selected:first").removeClass("selected"); 
        } else {
          $("#methodList li").filter(function (index) {
            return $(this).css("display") == "list-item";
          }).first().addClass("selected");
        }
        //up arrow
      } else if (event.which == 38) {
        if ($("#methodList li.selected")[0]) {
          $("#methodList li.selected").prevAll().filter(function (index) {
            return $(this).css("display") == "list-item";
          }).last().addClass("selected");
          $("#methodList li.selected:last").removeClass("selected"); 
        }
        //enter key
      } else if (event.which == 13) {
        $("#methodName").val($("li.selected").text());

        $("#methodList li").hide();
      }
      
    }
    
  } else { // methodName value starts with whitespace char
    $("#methodList li").remove(); 
  }
  
}

function blueBellOpts(stage) {
  for (let i = 1; i <= stage; ++i) {
    $('<option></option').text(i).val(i).appendTo('select.blueBell');
  }
}


// BASIC SUBMIT

//click submit
function submitform() {
  $(".results").remove();
  method = null;
  blueBell = null;
  let form = document.getElementById("formform");
  let data = new FormData(form);
  queryobj = {};
  
  for (let key of data.entries()) {
    queryobj[key[0]] = key[1];
  }
  
  resultsrouter(queryobj);
}

function resultsrouter(obj) {
  $("#container").contents().remove();
  method = findmethod(obj);
  if (method) {
    //console.log(method.hunts);
    let stagename = getStageName(obj.stage);
    if (method.name === "Stedman "+stagename) {
      method.stedman = true;
    }
    let title = method.name + " - plain course";
    $("#container").append("<h1>"+title+"</h1>");
    buildrowarr();
    if (queryobj.blueBell != "auto") {
      blueBell = Number(queryobj.blueBell);
    }
    
    let pbs = !method.stedman || method.leadLength > 3;
    drawgrid(pbs);
    
  } else {
    $("#container").append(`<h4>Method not found</h4>`);
  }
}

//get more method info
//methods json file: stage, name (title), plain, class, leadLength, leadHeadCode, hunts, pbOrder, plainPN
//stage, methodClass, methodName
function findmethod(obj) {
  let stagename = getStageName(obj.stage);
  let title = obj.methodName + " " + stagename;
  let method = bigmethodarr.find(o => o.name === title);
  return method;
}

//build row array
function buildrowarr() {
  switch (queryobj.quantity) {
    case "onelead":
      rowArray = buildRows(rounds(stage), method.plainPN, 0);
      break;
    case "touch":
      // stuff here later
      break;
    default:
      buildplaincourse(stage, method.plainPN);
  }
  let stagename = getStageName(stage);
  let stedman = method.name === "Stedman "+stagename;
  if (stedman) {
    addLHs(6, 3, "new six");
  }
  addLHs(method.leadLength, 0, "leadhead");
}

//draw stuff
function drawElement(label, args) {
  return svg[label](...args);
}

function drawNumbers(arr, x, parent) {
  let g = drawElement("group", [parent, {style: "font-family: Verdana, sans-serif; fill: #000; font-size: 16px;"}]);
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].bells.length; j++) {
      let number = arr[i].bells[j];
      let fill = i === 0 && arr[i].rowNum > 0 ? "#888" : null;
      let text = drawElement("text", [g, x+j*16, 16+i*20, places[number-1]]);
      if (fill) $(text).css("fill", fill);
    }
  }
}

function drawPath(arr, bell, x, parent) {
  let g = drawElement("group", [parent, {style: "stroke:"+bell.color+"; stroke-width:"+bell.weight+"; fill:none;"}]);
  let num = bell.bell;
  let current = arr[0].bells.indexOf(num);
  let path = "M "+(current*16+x)+" 10";
  for (let i = 1; i < arr.length; i++) {
    let index = arr[i].bells.indexOf(num);
    if (index === current) {
      path += " v20";
    } else if (index > current) {
      path += " l16,20";
    } else if (index < current) {
      path += " l-16,20";
    }
    current = index;
  }
  drawElement("path", [g, path]);
}

function buildpaths2(bb) {
  let paths = [];
  let used = [];
  if (method.hunts) {
    method.hunts.forEach(n => {
      let path = {
        bell: n,
        weight: bb.includes(n) ? 2 : 1,
        color: "red"
      };
      paths.push(path);
      used.push(n);
    });
  }
  let colors = ["blue", "green", "purple"];
  bb.forEach((b,i) => {
    if (!used.includes(b)) {
      let path = {
        bell: b,
        weight: 2,
        color: colors[i]
      };
      paths.push(path);
    }
  });
  return paths;
}

function buildpaths() {
  let paths = [];
  let used = [];
  if (method.hunts) {
    method.hunts.forEach(n => {
      let path = {
        bell: n,
        weight: 1,
        color: "red"
      };
      paths.push(path);
      used.push(n);
    });
  }
  if (paths.length < stage) {
    let pal = testlastpn(method.plainPN[method.plainPN.length-1]);
    let bell;
    if (pal && !used.includes(pal)) {
      bell = pal;
    } else {
      let r = rounds(stage);
      bell = r.find(n => !used.includes(n));
    }
    paths.push({
      bell: bell,
      weight: 2,
      color: "blue"
    });
    blueBell = bell;
  }
  return paths;
}


function drawgrid(pbs) {
  
  let width = rowArray[0].bells.length*16 + 38;
  let x = 40;
  
  let blue;
  if (queryobj.blueBell === "auto") {
    let n = queryobj.describe ? 1 : 2;
    blue = chooseworking(n);
    blueBell = blue[0];
  } else {
    blue = [blueBell];
  }
  
  let paths = buildpaths2(blue);
  
  if (queryobj.describe) {
    let working = !method.hunts.includes(blueBell);
    describenew(rowArray, blueBell, stage, method.hunts, pbs && working);
  }
  
  if (queryobj.pagination) {
    let numleads = 1;
    let chunk = method.leadLength ? Math.min(40, method.leadLength) : stage*2;
    while ((chunk+1)*numleads < 40) {
      numleads++;
    }
    let numrows = numleads*chunk;
    let numsvgs = Math.ceil((rowArray.length-1)/(numrows));
    for (let i = 0; i < numsvgs; i++) {
      let arr = rowArray.slice(i*numrows, (i+1)*numrows+1);
      drawgridsvg(arr, paths, width, x);
    }
  } else {
    //svg.circle($("#containersvg"), 50, 50, 10, {fill: "blue"});
    drawgridsvg(rowArray, paths, width, x);
  }
}

function drawgridsvg(arr, paths, width, x) {
  let height = arr.length * 20;
  let gridwidth = (arr.some(r => r.method) || arr[0].description) ? width+500 : width;
  $("#container").append('<div class="grid"></div>');
  let grid = svg.svg($("div.grid:last-child"), null, null, gridwidth, height, {class: "grid", xmlns: "http://www.w3.org/2000/svg", "xmlns:xlink": "http://www.w3.org/1999/xlink"});
  
  //draw numbers
  if (queryobj.numbers) {
    drawNumbers(arr, x, grid);
  }
  //draw lines
  for (let i = 0; i < paths.length; i++) {
    drawPath(arr, paths[i], x+5, grid);
  }
  
  //draw LH lines
  //indicate calls
  let text = svg.group(grid, {style: "font-family: Verdana, sans-serif; fill: #000; font-size: 14px;"});
  let lines = svg.group(grid, {style: "stroke: #111; stroke-width:1;"});
  svg.line(lines, x-2, 20, width, 20);
  let stedman = arr.find(r => r.name === "new six");
  for (let i = 1; i < arr.length; i++) {
    let y = arr[i].rowNum * 20;
    if (arr[i].name === "new six") {
      svg.line(lines, x-2, y, width, y);
    }
    if (arr[i].name === "leadhead" && !stedman) {
      svg.line(lines, x-2, y, width, y);
    }
    if (["b", "s"].includes(arr[i].type)) {
      let t = arr[i].type === "b" ? "-" : "s";
      svg.text(text, 24, y+16, t);
    }
    if (arr[i].method) {
      let textx = x+(stage+1)*16;
      svg.text(text, textx, y+16, arr[i].method);
    }
  }
  
  //add description
  if (arr[0].description) {
    drawdescript(text, x);
  }
  
}

function drawdescript(group, x) {
  rowArray.forEach(r => {
    if (r.instruction) {
      let text = r.instruction;
      if (r.with) {
        text += " with "+r.with;
      }
      if (r.instruction2) {
        text += " "+r.instruction2;
      }
      let tx = x+(r.bells.length+1)*16;
      let y = 16+r.rowNum*20;
      drawElement("text", [group, tx, y, text]);
    }
  });
}


// BELLRINGING FUNCTIONS

//given stage number, get its name
function getStageName(stage) {
  var stageName = stages.find(o => o.num == stage).name;
  //console.log("stage", stage);
  return stageName;
}

//build rounds
function rounds(numBells) {
  let rowZero = [];
  
  for (let i = 0; i < numBells; ++i) {
      rowZero.push(i+1);
    }
  return rowZero;
}

//convert row array to string
function rowStr(row) {
  let str = "";
  
  for (var i = 0; i < row.length; i++) {
    str += places[row[i]-1];
  }
  
  return str;
}

function chooseworking(n) {
  let used = [];
  method.hunts.forEach(b => used.push(b));
  let bell;
  if (used.length < stage) {
    let pal = testlastpn(method.plainPN[method.plainPN.length-1]);
    
    if (pal && !used.includes(pal) && (n === 1 || method.pbOrder.length === 1)) {
      bell = [pal];
    } else {
      bell = n === 1 ? [method.pbOrder[0][0]] : method.pbOrder.map(a => a[0]) ;
    }
  }
  return bell;
}

//test final place notation
function testlastpn(pn) {
  let res;
  if (stage%2 === 0) {
    if (pn.length === 2 && pn[0] === 1) {
      switch (pn[1]) {
        case 2:
          res = 2;
          break;
        case stage:
          res = stage;
          break;
      }
    }
  } else if (pn[0] === 1) {
    if (pn.length === 3 && pn[1] === 2 && pn[2] === stage) {
      res = 2;
    }
  }
  return res;
}

function addLHs(l, start, name) {
  for (let i = 0; i < rowArray.length; i+=l) {
    if (rowArray[start+i]) {
      rowArray[start+i].name = name;
    }
  }
}

//build a portion of method
//given a starting row, place notation, and the number of the first row to create, create an array of rows
function buildRows(prevRow, placeNotArray, rowNum) {
  let arrayRows = [];
  let numBells = prevRow.length;
  
  //loop through place notation
  for (let i = 0; i < placeNotArray.length; ++i) {
    let row = {};
    row.rowNum = i + rowNum;
    row.bells = [];
    let direction = 1;
    
    //build one row
    for (let p = 0; p < numBells; ++p) {
      if (placeNotArray[i].indexOf(p+1) >= 0) {
        row.bells.push(prevRow[p]);
      } else {
        row.bells.push(prevRow[p+direction]);
        direction *= -1;
      }
    }
    prevRow = row.bells;
    //console.log(row.bells);
    arrayRows.push(row);
    
  }
  return arrayRows;
}

//build plain course
function buildplaincourse(stage, pn) {
  let start = rounds(stage);
  let roundstr = rowStr(start);
  rowArray = [{rowNum: 0, bells: start}];
  let lastrow = rounds(stage);
  let laststr;
  let lead;
  let num = 1;
  do {
    lead = buildRows(lastrow, pn, num);
    lead.forEach(o => rowArray.push(o));
    lastrow = rowArray[rowArray.length-1].bells;
    laststr = rowStr(lastrow);
    num += pn.length;
  } while (laststr != roundstr);
  
}

const placeNames = [{num: 1, name: "lead"}, {num: 2, name: "2nds"}, {num: 3, name: "3rds"}];

function ordinal(p) {
  switch (p%10) {
    case 1:
      return p+"st";
      break;
    case 2:
      return p+"nd";
      break;
    case 3:
      return p+"rd";
      break;
    default:
      return p+"th";
  }
}

function describenew(rowArr, bell, stage, hunts, pbs, early) {
  rowArr[0].description = true;
  let i = 0;
  
  let placearr = rowArr.map(r => r.bells.indexOf(bell)+1);
  let lastworki;
  
  let treblepasses = hunts && hunts.length && hunts[0] === 1 && !hunts.includes(bell);
  let tpasses = [];
  let abovetreble;
  let wtreble = false;
  
  let startp = getPlace(0);
  
  let leadheads = rowArr.filter(r => r.name === "leadhead").map(r => r.rowNum-rowArr[0].rowNum);
  //console.log(leadheads);
  if (leadheads[0] === 0) leadheads.shift();
  
  let nextlh = leadheads.shift();
  if (pbs && rowArr[0].name === "leadhead") {
    rowArr[0].instruction = rowArr[0].rowNum != 0 ? "Become "+placeName(startp,true)+" place bell" : placeName(startp,true)+" place bell";
  }
  
  while (i < rowArr.length-2) {
    //console.log("i: "+i);
    if (i === 16) {
      //console.log("row 16");
      //console.log(nextlh);
    }
    let s = getPlace(i);
    let t = getPlace(i+1);
    let u = getPlace(i+2);
    
    let instruct;
    if (pbs && nextlh === i) {
      instruct = "Become "+placeName(s,true)+" place bell; ";
      nextlh = leadheads.shift();
    }
    
    if (t === s && u === s) {
      //3+ blows
      let text = instruct ? instruct : "";
      
      let count = 3;
      while (checkPlace(i+count, s)) {
        count++;
      }
      text += count + " blows in " + placeName(s);
      if (pbs && nextlh < i+count) {
        let pbn = nextlh-i+1;
        text += "; become "+placeName(s,true)+" place bell at the "+ordinal(pbn)+" blow";
        nextlh = leadheads.shift();
      }
      let j = (early && lastworki) ? lastworki : i;
      addInstruct(j, text); //first blow in the place, unless early
      i += count-1; //i now at last blow in the place
      lastworki = i;
      wtreble = false;
    } else if (t === s) {
      //make place
      
      let make = makePlace(s, rowArr[i].rowNum);
      let text = instruct ? instruct + make.toLowerCase() : make;
      if (pbs && nextlh === i+1) {
        text += "; become "+placeName(s,true)+" place bell";
        nextlh = leadheads.shift();
      }
      let j = (early && lastworki) ? lastworki : i;
      addInstruct(j, text); //first blow in the place, unless early
      i++; //i at last blow in the place
      lastworki = i;
      wtreble = false;
    } else if (t-s === u-t) {
      //hunt
      let dir = t-s;
      let dirName = dirname(dir);
      let text = "Hunt " + dirName;
      
      let treblei;
      let become = [];
      if (instruct) become.push(i);
      if (treblepasses && getBell(i, t) === 1) {
        treblei = i;
      }
      let starti = i;
      let place = u;
      let count = 2;
      while (getPlace(i+3) && getPlace(i+3)-place === dir) {
        i++;
        if (pbs && nextlh === i) {
          become.push(i);
          nextlh = leadheads.shift();
        }
        if (treblepasses && !treblei && getBell(i,place) === 1) {
          treblei = i;
        }
        count++;
        place += dir;
      }
      
      if (pbs && ((nextlh === i+1 && getPlace(i+3) != place) || (nextlh === i+2 && rowArr.length === i+3))) {
        become.push(nextlh);
        nextlh = leadheads.shift();
      }
      
      if (instruct) {
        //become = starti;
        //should this go earlier if early?
        //rowArr[starti].instruction = instruct + text.toLowerCase();
      }
      //need to deal with other points of becoming a new place bell
      /*
      if (treblepasses) {
        let tp1 = rowArr[starti].bells.indexOf(1)+1;
        let above = tp1 > s;
        //need to get the row AFTER the hunting
        let last = rowArr[i+3] ? i+3 : i+2;
        let tp2 = rowArr[last].bells.indexOf(1)+1;
        let stillabove = tp2 > getPlace(last);
        if (above != stillabove) {
          let j = starti;
          while (rowArr[j].bells.indexOf(1) != rowArr[j].bells.indexOf(bell)+dir) {
            j++;
          }
          treblei = j;
        }
      }
      */
      //whether or not this "work" is added depends on length and passing treble
      //or if it's the end of the line???
      if (become.length && treblei) {
        //console.log("both");
        //console.log(become);
        let pp = getPlace(treblei) + "-" + getPlace(treblei+1);
        if (pp === "1-2" && wtreble === false) pp += " (treble takes you off lead)";
        if (pp === "2-1" && wtreble === false) pp += " (take treble off lead)";
        if (become.length === 1) {
          let becomep = getPlace(become[0]);
          //console.log("pass treble and become "+becomep);
          if (treblei >= become[0]) {
            let text = "Become "+placeName(becomep,true)+ " place bell, hunt "+dirName+" passing treble in "+pp;
            if (become[0] <= starti+3) {
              let j = (early && lastworki) ? lastworki : become[0];
              addInstruct(j, text);
            } else {
              if (early) {
                let j = lastworki ? lastworki : starti;
                text = "Hunt "+dirName+"; become "+placeName(becomep, true)+" place bell";
                
                addInstruct(j, text);
                let words = "Pass treble in "+pp;
                addInstruct(become[0], words);
                lastworki = treblei+1;
              } else {
                addInstruct(starti, "Hunt "+dirName);
                addInstruct(become[0], text);
              }
            }
          } else {
            let j = (early && lastworki) ? lastworki : treblei;
            let words = "Pass treble in "+pp;
            addInstruct(j, words);
            words = "Become "+placeName(becomep,true)+ " place bell";
            addInstruct(become[0], words);
            lastworki = become[0];
          }
        } else {
          //I don't know how to deal with this
          console.log("multiple leadheads???");
        }
      } else if (become.length === 1) {
        let becomep = getPlace(become[0]);
        //console.log("only become, "+becomep);
        let text = "Become "+placeName(becomep,true)+ " place bell";
        if (become[0] <= i) {
          text += ", hunt "+dirName;
        }
        
        let j = (early && lastworki) ? lastworki : become[0];
        addInstruct(j, text);
        lastworki = become[0];
      } else if (treblei) {
        let pp = getPlace(treblei) + "-" + getPlace(treblei+1);
        if (pp === "1-2" && wtreble === false) pp += " (treble takes you off lead)";
        if (treblei-starti > 3 || i+3 > rowArr.length-1) {
          let words = text + " passing treble in "+pp;
          addInstruct(starti, words);
        } else {
          let j = early ? starti : treblei;
          let words = "Pass treble in "+pp;
          addInstruct(j, words);
        }
        
        lastworki = i+1;
      } else if (count > 3 || i+3 > rowArr.length-1 || starti === 0) {
        addInstruct(starti, text);
        lastworki = i+1;
      }
      
      i++; //i is at penultimate blow of hunting??
      wtreble = false;
    } else if (u === t) {
      //also make place
      let pi = instruct ? i : i+1;
      let count = 2;
      while (checkPlace(i+count+1, t)) {
        count++;
      }
      
      let text;
      if (count === 2) {
        text = makePlace(t, rowArr[i+1].rowNum);
      } else {
        text = count + " blows in " + placeName(t);
      }
      if (treblepasses && wtreble === false) {
        if (getBell(i,t) === 1) {
          let pp = s + "-" + t;
          if (pp === "1-2") pp += " (treble takes you off lead)";
          if (pp === "2-1") pp += " (take treble off lead)";
          let j = (early && lastworki) ? lastworki : i;
          let pass = "Pass treble in "+pp;
          let words = instruct ? instruct+pass.toLowerCase() : pass;
          addInstruct(j, words);
          lastworki = i;
          instruct = null;
          pi = i+1;
        }
      }
      
      if (pbs && nextlh === i+1) {
        instruct = "Become "+placeName(t,true)+" place bell; ";
        nextlh = leadheads.shift();
      }
      
      let j = (early && lastworki) ? lastworki : pi;
      let words = instruct ? instruct+text.toLowerCase() : text; //first blow of the place, unless early, or unless the blow before is a leadhead
      addInstruct(j, words);
      
      if (pbs && nextlh > i+1 && nextlh <= i+count) {
        if (count === 2) {
          rowArr[j].instruction += "; become "+placeName(t,true)+" place bell";
        } else {
          let pbn = nextlh-i;
          rowArr[j].instruction += "; become "+placeName(t,true)+" place bell at the "+ordinal(pbn)+" blow";
        }
        nextlh = leadheads.shift();
      }
      
      i += count;
      lastworki = i;
      wtreble = false;
    } else {
      //point, fishtail, or dodge
      //t is A Point
      let dir1 = t-s;
      let v = getPlace(i+3);
      
      if (v && v-u != dir1) {
        let stroke = rowArr[i+1].rowNum % 2 == 1 ? " at hand" : " at back";
        let text = "Point " + placeName(t) + stroke;
        
        let j = (early && lastworki) ? lastworki : i+1;
        let words = instruct ? instruct+text.toLowerCase() : text; //blow of point, unless early
        addInstruct(j, words);
        if (pbs && [i+1,i+2].includes(nextlh)) {
          let p = nextlh === i+1 ? t : u;
          rowArr[j].instruction += "; become "+placeName(p)+" place bell";
          nextlh = leadheads.shift();
        }
        
        i+=2;
        lastworki = i-1;
      } else {
        let count = 1; //counting points in place t
        let starti = i;
        if (pbs && nextlh === i+1) {
          instruct = "Become "+placeName(t)+" place bell; ";
          nextlh = leadheads.shift();
        }
        let howmany = 0;
        if (pbs && nextlh === i+2) {
          howmany = 1;
        }
        i+=3;
        while (getPlace(i) === t && getPlace(i+1) === s) {
          count++;
          if (pbs && howmany === 0 && [i,i+1].includes(nextlh)) {
            howmany = count;
          }
          i+=2;
        }
        let pp = s > t ? t + "-" + s : s + "-" + t;
        let text;
        let bwith = getBell(starti+1,s);
        let becomei;
        if (pbs && nextlh && nextlh < i) {
          becomei = nextlh;
          nextlh = leadheads.shift();
        }
        
        if (i > rowArr.length-2 || getPlace(i) === t) {
          //assume dodge at end?
          //dodge(s)
          text = dodgeNum(count) + pp + " " + dirname(dir1);
          text += " with the ";
          text += (treblepasses && bwith === 1) ? "treble" : bwith;
          if (becomei) {
            let p = getPlace(becomei);
            text += "; become "+placeName(p,true)+" place bell";
            if (count > 1) {
              text += p === s ? " at the " : " after the ";
              text += ordinal(howmany) + " dodge";
            }
            
          }
          if (starti > 0) starti++;
        } else {
          //fishtail
          let points = count > 2 ? ", " + count + " points " + placeName(t) : "";
          text = "Fishtail in "+pp+points;
          text += " with the "+bwith;
          i--; //blow after last point
        }
        
        let j = (early && lastworki) ? lastworki : starti;
        let words = instruct ? instruct+text.toLowerCase() : text;
        addInstruct(j, words);
        //rowArr[j].with = (treblepasses && bwith === 1) ? "the treble" : bwith;
        wtreble = treblepasses && bwith === 1;
        lastworki = i-1;
      }
      
    }
    
    
    
  }
  
  //console.log("rows remaining: "+(rowArr.length-1-i));
  
  if (i === rowArr.length-2) {
    let penult = getPlace(i);
    let ult = getPlace(i+1);
    let j = (early && lastworki) ? lastworki : i;
    let text;
    if (ult === penult) {
      
      text = makePlace(ult, i);
    } else {
      let dir = ult-penult;
      text = "Hunt "+dirname(dir);
    }
    if (pbs && nextlh === i+1) {
      text += "; become "+placeName(ult,true)+" place bell";
    }
    addInstruct(j, text);
  }
  
  function addInstruct(j, text) {
    if (rowArr[j].instruction) {
      rowArr[j].instruction += "; "+ text.toLowerCase();
    } else {
      rowArr[j].instruction = text;
    }
    
  }
  
  
  function getPlace(j) {
    return rowArr[j] ? rowArr[j].bells.indexOf(bell)+1 : null;
  }
  
  function getBell(row, place) {
    return rowArr[row].bells[place-1];
  }
  
  function checkPlace(row, value) {
    return getPlace(row) === value;
  }
  
  function checkbtwn(lhi,i,j) {
    return lhi >= i && lhi <= j;
  }
}

function describe(rowArray, bell, stage, hunts, early) {
  rowArray[0].description = true;
  let i = 0;
  
  let work = [];
  let placearr = rowArray.map(r => r.bells.indexOf(bell)+1);
  //console.log(placearr);
  let wtreble = false;
  
  //place bells
  if (hunts && hunts.length && !hunts.includes(bell)) {
    rowArray.forEach((r, i) => {
      if (r.name === "leadhead" && r.rowNum > 0) {
        let p = getPlace(r.rowNum);
        let text = "Become "+placeName(p)+" place bell";
        if (early) {
          rowArray[i-1].instruction = text;
        } else {
          r.instruction = text;
        }
      }
    });
  }
  
  while (i < rowArray.length-2) {
    let s = getPlace(i);
    let t = getPlace(i+1);
    let u = getPlace(i+2);
    
    if (t == s && u == s) {
      //console.log("3+ blows");
      if (i > 0 && hunts.length && hunts[0] === 1) {
        let dir = s-placearr[i-1];
        let treble = rowArray[i-1].bells[s-1] === 1;
        if (treble) {
          if (rowArray[i-1].instruction) {
            rowArray[i-1].instruction += ",";
            rowArray[i-1].instruction2 = "pass treble in "+(s-dir)+"-"+s;
          } else {
            rowArray[i-1].instruction = "Pass treble in "+(s-dir)+"-"+s;
          }
        }
      }
      let count = 3;
      while (checkPlace(i+count, s)) {
        count++;
      }
      work.push(count + " blows in " + placeName(s));
      let text = count + " blows in " + placeName(s);
      if (rowArray[i].instruction) {
        rowArray[i].instruction += ", ";
        rowArray[i].instruction2 = text;
      } else {
        rowArray[i].instruction = text;
      }
      
      i += count-1;
    } else if (t == s) {
      //console.log("Make place");
      if (i > 0 && hunts.length && hunts[0] === 1) {
        let dir = s-placearr[i-1];
        let treble = rowArray[i-1].bells[s-1] === 1;
        if (wtreble) {
          wtreble = false;
        } else if (treble) {
          console.log("make place");
          if (rowArray[i-1].instruction) {
            rowArray[i-1].instruction += ",";
            rowArray[i-1].instruction2 = "pass treble in "+(s-dir)+"-"+s;
          } else {
            rowArray[i-1].instruction = "Pass treble in "+(s-dir)+"-"+s;
          }
        }
      }
      let text = makePlace(s, rowArray[i].rowNum);
      work.push(text);
      if (rowArray[i].instruction) {
        rowArray[i].instruction += ", ";
        rowArray[i].instruction2 = text;
      } else {
        rowArray[i].instruction = text;
      }
      i++;
    } else if (t-s == u-t) {
      //console.log("Hunt");
      let dir = t-s;
      let dirName = dirname(dir);
      let text = "Hunt " + dirName;
      if (rowArray[i].instruction) {
        rowArray[i].instruction += ", "+text;
      } else {
        rowArray[i].instruction = text;
      }
      let treble, place;
      if (hunts.length && hunts[0] === 1) {
        place = s;
        let j = 0;
        while (j < 2) {
          treble = rowArray[i+j].bells[place-1+dir] === 1;
          if (treble) {
            if (j === 0) {
              rowArray[i].instruction += ",";
              rowArray[i].instruction2 = "pass treble in "+s+"-"+t;
              if (s === 1 && t === 2) {
                rowArray[i].instruction2 += " (treble takes you off lead)";
              } else if (s === stage && t === stage-1) {
                rowArray[i].instruction2 += " (treble takes you off the back)";
              }
            } else {
              rowArray[i+j].instruction = "Pass treble in "+place+"-"+(place+dir);
            }
          }
          place += dir;
          j++;
        }
      }
      place = u;
      while (getPlace(i+3)-place == dir) {
        i++;
        place+=dir;
        if (hunts.length && hunts[0] === 1) {
          treble = getBell(i+1, place) === 1;
          if (treble) {
            rowArray[i+2].instruction = "Pass treble in "+placearr[i+1]+"-"+placearr[i+2];
          }
        }
      }
      
      
      work.push("Hunt " + dirName);
      i++;
      //console.log("i is now "+i);
    } else if (t == u) {
      //console.log("also make place");
      if (hunts.length && hunts[0] === 1) {
         
        
        let treble = rowArray[i].bells[t-1] === 1;
        if (wtreble) {
          wtreble = false;
        } else if (treble) {
          let j = early ? i : i+1;
          let key = rowArray[j].instruction ? "instruction2" : "instruction";
          //console.log("also make place");
          rowArray[j][key] = "Pass treble in "+s+"-"+t;
          if (s === 2 && t === 1) {
            rowArray[j][key] += " (take treble off lead)";
          } else if (s === 1 && t === 2) {
            rowArray[j][key] += " (treble takes you off lead)";
          } else if (s === stage-1 && t === stage) {
            rowArray[j][key] += " (take treble off the back)";
          } else if (s === stage && t === stage-1) {
            rowArray[j][key] += " (treble takes you off the back)";
          }
        }
        
        
      }
      
      let last = i > 0 ? work[work.length-1] : "";
      let x = (last.indexOf("Point") == -1 && last.indexOf("Fish") == -1 && early) ? i : i+1;
      let v = rowArray[i+3] ? getPlace(i+3) : null;
      if (v != u) {
        let text = makePlace(t, rowArray[x].rowNum);
        work.push(text);
        if (rowArray[x].instruction) {
          rowArray[x].instruction2 = text;
        } else {
          rowArray[x].instruction = text;
        }
        i+=2;
      } else {
        let count = 3;
        while (checkPlace(i+count+1, t)) {
          count++;
        }
        let text = count + " blows in " + placeName(t);
        work.push(text);
        if (rowArray[x].instruction) {
          rowArray[x].instruction2 = text;
        } else {
          rowArray[x].instruction = text;
        }
        i += count;
      }
    } else {
      //point, fishtail, or dodge
      let dir1 = t-s;
      let v = rowArray[i+3] ? getPlace(i+3) : null;
      
      if (v == u || v-u != dir1) {
        let stroke = rowArray[i+1].rowNum % 2 == 1 ? " at hand" : " at back";
        let text = "Point " + placeName(t) + stroke;
        work.push(text);
        let j = early ? i : i+1;
        if (rowArray[j].instruction) {
          //if the point happens in the leadhead row, it needs to come before the new place bell
          rowArray[j].instruction2 = rowArray[j].instruction;
          rowArray[j].instruction = text;
        } else {
          rowArray[j].instruction = text;
        }
        rowArray[j].with = getBell(i+1,s);
        i+=2;
      } else {
        let count = 1;
        let starti = i;
        let j = early ? i : i+1;
        i+=3;
        while (getPlace(i) == t && getPlace(i+1) == s) {
          count++;
          i+=2;
        }
        if (getPlace(i) == s || getPlace(i) == s+dir1*-1) {
          let points = count > 2 ? ", " + count + " points " + placeName(t) : "";
          let places = s > t ? t + "-" + s : s + "-" + t;
          let text = "Fishtail " + places + points;
          work.push(text);
          if (rowArray[j].instruction) {
            rowArray[j].instruction2 = text;
          } else {
            rowArray[j].instruction = text;
          }
          rowArray[j].with = getBell(starti+1,s);
          i--;
        } else if (getPlace(i+1) == t || getPlace(i+1) == t+dir1 || getPlace(i+1) == null) {
          let places = s > t ? t + "-" + s : s + "-" + t;
          let text = dodgeNum(count) + places + " " + dirname(dir1);
          work.push(text);
          if (!early) j += 1;
          if (rowArray[j].instruction) {
            if (rowArray[starti+2].name === "leadhead") {
              rowArray[j].instruction2 = rowArray[j].instruction;
              rowArray[j].instruction = text;
            } else {
              rowArray[j].instruction2 = text;
            }
          } else {
            rowArray[j].instruction = text;
          }
          rowArray[j].with = getBell(starti+1,s);
          if (rowArray[j].with === 1) {
            wtreble = true;
          }
        }
        
      }
      
    }
  }
  
  let penult = getPlace(rowArray.length-2);
  let ult = getPlace(rowArray.length-1);
  
  if (i == rowArray.length-2) {
    let dir = ult-penult;
    if (dir != 0 && !work[work.length-1].startsWith("Hunt")) {
      work.push("Hunt " + dirname(dir));
      rowArray[rowArray.length-2].instruction = "Hunt " + dirname(dir);
    } else if (ult == penult) {
      work.push(makePlace(ult));
      rowArray[rowArray.length-2].instruction = makePlace(ult);
    }
  }
  
  //Stedman whole turns
  i = 0;
  while (i < rowArray.length-6) {
    let set = placearr.slice(i, i+7);
    let opt0 = [set[0],set[1],set[3],set[4]];
    let opt1 = [set[1],set[2],set[4],set[5]];
    if (opt0.every(n => n === set[0])) {
      let p = set[0];
      let j = i+3;
      let c = 0;
      let three = set[2];
      while (three != p) {
        c++;
        if (placearr[j] === p && placearr[j+1] === p) {
          three = placearr[j+2];
        } else {
          three = p;
        }
        j += 3;
      }
      
      if (c === 2) {
        let instruct = " (Stedman whole turn";
        if (![1,stage].includes(set[0])) {
          instruct += " " + set[0] + "-" + set[2];
        }
        instruct += ")";
        let j = i;
        let n = 0;
        do {
          if (rowArray[j].instruction) {
            rowArray[j].instruction2 = instruct;
            n++;
          }
          j++;
        } while (n < 3 && j < i+6);
        i += 6;
      } else {
        i = j;
      }
    } else if (opt1.every(n => n === set[1]) && set[0] != set[1]) {
      let p = set[1];
      let j = i+4;
      let c = 0;
      let three = set[3];
      while (three != p) {
        c++;
        if (placearr[j] === p && placearr[j+1] === p) {
          three = placearr[j+2];
        } else {
          three = p;
        }
        j += 3;
      }
      if (c === 2) {
        let instruct = " (Stedman whole turn";
        if (![1,stage].includes(set[1])) {
          instruct += " " + set[1] + "-" + set[3];
        }
        instruct += ")";
        let j = i+1;
        let n = 0;
        do {
          if (rowArray[j].instruction) {
            rowArray[j].instruction2 = instruct;
            n++;
          }
          j++;
        } while (n < 3 && j < i+6);
        i += 6;
      } else {
        i = j;
      }
    } else {
      i++;
    }
    
    
  }
  //console.log(work);
  
  function getPlace(j) {
    return rowArray[j] ? rowArray[j].bells.indexOf(bell)+1 : null;
  }
  
  function getBell(row, place) {
    return rowArray[row].bells[place-1];
  }
  
  function checkPlace(row, value) {
    return getPlace(row) === value;
  }
  
  
  
  
}

function makePlace(num, rownum) {
  if (num == 1 && rownum % 2 == 0) return "Lead wrong";
  else if (num == 1 ) return "Lead full";
  else if (num == stage) return "Lie behind";
  else return "Make " + placeName(num);
}

function dodgeNum(num) {
  if (num == 1) return "Dodge ";
  else if (num == 2) return "Double dodge ";
  else return num + " dodges ";
}

function dirname(dir) {
  let val = dir == 1 ? "up" : "down";
  return val;
}

function placeName(num, pb) {
  //console.log("num to place " + num);
  if (num === 1 && pb) {
    return "1st";
  } else if (0 < num && num < 4) {
    return placeNames[num-1].name;
  } else {
    return num + "ths";
  }
}
