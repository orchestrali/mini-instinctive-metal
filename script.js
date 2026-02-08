//bell places
const places = "1234567890ETABCD";
//holds stages.json; stage number and name and classes within
var stages;
//sorted list of method names
var methodNameList;
//full method collection
var bigmethodarr;
//holder for jquery/svg functions
var svg;
//staff things
const sharps = ['G', 'D', 'A', 'E', 'B', 'F♯'];
const flats = ['F', 'B♭', 'E♭', 'A♭', 'D♭', 'G♭'];
const sharpy = [19, 34, 14, 29, 44, 24];
const dyPenta = [0, 5, 10, 20, 25, 35, 40, 45, 55, 60];
//type of display: grid, graph, staff, practice, simulator
var type = "grid";
//grid display options: basic-lines, everyline, bellgroups
//now gridline, gridgrid
var gridtype = "gridline";

//empty/default form values
var formstart = {
  type: "grid",
  lookup: "lookupname",
  gridtype: "gridtypeline",
  numbers: "show",
  gridcolors: "colordiff",
  gap: "yes",
  includeTime: "yes",
  keysig: "C"
};
//gridcolors: "colors" // not actually default because gridline is default!
//form inputs
const selects = ["stage", "methodClass", "blueBell", "keysig", "actTenor"];
const texts = ["methodName", "placeNotation"];
const numtexts = ["tenors"];
const radios = ["lookup", "type", "gridtype", "gridcolors", "timesig"];
const checked = ["numbers", "describe", "pn", "gap", "includeTime", "onlyblue", "mobile"];
const formkeys = {
  selects: selects,
  texts: texts,
  numbers: numtexts,
  radios: radios,
  checks: checked
};
const oldformkeys = {
  selects: ["huntBellw", "blueBellw", "blueGroup1", "blueGroup1w", "blueGroup2w", "blueGroup2", "bell1w"],
  texts: ["bobPlaceNot", "singlePlaceNot", "otherLeadhead", "comp", "huntColor", "blueBellc", "blueGroup1c", "blueGroup2c", "bell1c"],
  numbers: ["complibid", "callLoc", "numrounds", "hours", "minutes"],
  radios: ["callType", "leadhead", "quantity", "touchType", "sounds"],
  checks: ["pagination", "huntbells", "rowzero", "keepscore", "drawLH", "tutorial", "player", "highlight"]
};
const keysforall = ["stage", "lookup", "methodClass", "methodName", "placeNotation", "type"];
const typekeys = {
  grid: ["gridtype", "pn", "numbers", "blueBell", "describe", "gridcolors"],
  staff: ["blueBell", "tenors", "gap", "includeTime", "timesig", "keysig", "actTenor", "onlyblue", "mobile"]
};

//strategies for choosing method/comp
//default "name", others "pn" and "complib"
var lookup = "name";
//method stage and class set by form
var stage = null;
//stage plus tenors
var numbells;
var checkedClass;


//set of method names matching selected stage and class
let methodList;

//form submission
var queryobj;

var method;
var rowArray;
//individual bell (number) for gridline with describe; may be array otherwise
var blueBell;

//simulator items
//objects with sounds and other info
var bells = [
  {bell: "F4",type: "tower"},{bell: "G4",type: "tower"},{bell: "A4",type: "tower"},{bell: "Bf4",type: "tower"},{bell: "C5",type: "tower"},{bell: "D5",type: "tower"},{bell: "E5",type: "tower"},{bell: "F5",type: "tower"},{bell: "G5",type: "tower"},{bell: "A5",type: "tower"},{bell: "Bf5",type: "tower"},{bell: "C6",type: "tower"}
];
//sally course order
var sallycolors = ["#000080","#1a1ad6","#5c5ced","#758de6","#9198bf","#babfdb","#c8e6ce","#a4e0b0","#71d184","#3fa654","#007317"];
//holder for current sounds
var currentbells = [];
//audio setup
var audioCtx;
var gainNode;
//all the options
var simopts = {
  zoom: 0,
  volume: 0.75,
  duration: 1.3,
  hours: 3,
  minutes: 0,
  handgap: 1,
  roundsrows: 8,
  stopatrounds: true,
  nthrounds: 1,
  waitforgaps: false,
  solidme: false,
  solidtreble: false,
  cosallies: false,
  highlightunder: false,
  fadeabove: false,
  displayplace: false,
  placebells: false,
  standbehind: false,
  melouder: false,
  instructions: false,
  feedback: false
};
//time for one row
var speed = 2.3;
//time between one bell and the next
var delay;
//
var playing = false;
//zero-indexed
var ringingplace = 0;
var nextBellTime = 0.0;
var ringingstroke = 1;
var timeout;
var animrequest;
var lookahead = 5.0;
var schedule = 0.02;
var waiting;
var rownum = 0;
var roundscount = 0;
//a call given in the first row, not the first call whenever it happens
var firstcall;
var currentcall;
var callqueue = [];
var lastcall = "";
var lastcallrow = 0;
var thatsall;
//for the visualization of striking
//objects have: place in whole pull, time, mybell (boolean), diff
//
var soundqueue = [];
//just alternates between 1 and 2, determines which of the two sound lines is currently in use
var soundrow = 1;
var soundplace;

var mybells = [];
var mbells = [];
var keysdown = [];
var listeners = [
  {id: "hand15b", event: "endEvent", f: endpull},
  {id: "back14b", event: "endEvent", f: endpull},
  {id: "sally", event: "mouseover", f: pointer},
  {id: "sally", event: "click", f: emitring},
  {id: "tail", event: "mouseover", f: pointer},
  {id: "tail", event: "click", f: emitring},
  {id: "hand", event: "touchstart", f: emitring},
  {id: "back", event: "touchstart", f: emitring},
  {id: "hand", event: "touchend", f: prevent},
  {id: "back", event: "touchend", f: prevent}
];



$(function(){
  
  window.location.hash = "";
  //disable gridgrid input elements
  changegridtype();
  getlists();
  
  $("#container").svg({onLoad: (o) => {
    svg = o;
    svg.configure({xmlns: "http://www.w3.org/2000/svg", "xmlns:xlink": "http://www.w3.org/1999/xlink", width: 0, height: 0});
  }});

  //prevent typing in inputs from triggering a bell ring
  $("body").on("keydown", "input", function(e) {
    e.stopPropagation();
  });

  //nav toggle
  $("#nav-options").click(function() {
    $("#nav-options ul").slideToggle(600, "swing");
    $("#nav-options .arrow").toggleClass("rotate");
  });
  //simulator toggle
  $("#simulatormenu").on("click", () => {
    $("#simulatormenu .arrow").toggleClass("rotate");
    $("#options").slideToggle(600, "swing");
  });
  
  $("#stage").change(stagechange);

  $("#lookupstrat").change(changestrategy);
  
  $("#placeNotation").on("keyup", pnkeyup);
  
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

  $("#type").change(typechange);
  $("#type li").on("click", typeliclick);
  $("#gridtype").change(changegridtype);

  $("#blueBell").change(gridbluechange);

  $("#keysig").change(toggleKey);
  $("#time-sig").change(toggleTime);
  $("#handstroke-gap").change(adjustTime);
  $("#stenors").change(stafftenors);
  
  $("#submit").on("click", submitform);
  $("#clearform").on("click", resetform);

  //simulator
  $("#start").on("click", playpauseclick);
  $("#reset").on("click", resetsimulator);
  $("body").on("keydown", keyring);
  $("body").on("keyup", updatekeysdown);
  $("#simulatorcontainer input").on("change", simoptionschange);
  $("#myrope").on("change", myropechange);

  //prevent duplication in keyboard commands
  $("#options").on("keypress", "input.keyboard", function(e) {
    if (mbells.find(o => o.keys.includes(e.key))) {
      e.preventDefault();
    }
  });

  
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
        getqueryparams();
        //set up sounds for simulator already
        for (let i = 0; i < bells.length; i++) {
          bells[i].url = "/sounds/" + bells[i].bell + ".wav";
        }
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.75;
        $("body").on("click", () => {
          if (audioCtx.state === 'suspended') {
            audioCtx.resume();
          }
        });
        setupSample(0);
      });
      
    });
  });
}

//fetch a sound file
async function getFile2(audioContext, filepath) {
  try {
    const response = await fetch(filepath);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
  } catch (error) {
    console.log(error.message);
    //alert("Sorry, there has been a problem accessing the sound files.");
    return null;
  }
}

//create sound buffers for all the bells
async function setupSample(i) {
  let arrayBuffer = await getFile2(audioCtx, bells[i].url);
  if (arrayBuffer) {
    audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
      bells[i].buffer = buffer;
      if (i < bells.length-1) {
        i++;
        setupSample(i);
      } else {
        console.log("finished getting sounds");
      }
    }, (e) => { console.log(e) });
  }
}

function getqueryparams() {
  let q = new window.URLSearchParams(window.location.search);
  let obj = {};
  let oldobj = {};
  let params = 0;
  let oldparams;
  //p[0] key, p[1] value
  for (let p of q) {
    //check if the key is one of the known formkeys
    let key = Object.keys(formkeys).find(k => formkeys[k].includes(p[0]));
    if (key && p[1].length) { 
      params++;
      obj[p[0]] = p[1];
    } else {
      let oldkey = Object.keys(oldformkeys).find(k => oldformkeys[k].includes(p[0]));
      let line = p[0].startsWith("bell") && ["w", "c"].includes(p[0].slice(-1)) && Number(p[0].slice(4,-1)) > 0;
      if (oldkey || line) {
        oldparams = true;
        if (p[1].length) {
          oldobj[p[0]] = p[1];
        }
      }
    }
  }
  //console.log(obj);
  if (params > 0) checkqueryparams(obj, oldobj);
}

//two issues: a search that I can't handle yet, and one with not enough info
//third issue: too much info! conflicting info!
//not enough info needs to be handled generally
//filling the form should be separate from submitting it
function checkqueryparams(obj, oldobj) {
  let problem;
  //currently only grid or staff type
  if (!obj.type || !["grid", "staff"].includes(obj.type)) {
    //can't do this (yet)
    problem = "type";
    
  } else if (!obj.stage || Number(obj.stage) < 4) {
  //need stage
    //okay but this is just not enough info
    //well but I need stage for anything else
    problem = "stage";
  } else if (obj.complibid) {
    //no complibid yet
    problem = "complib";
  } else if (obj.quantity === "touch") {
    //no quantity touch yet
    problem = "touch";
  } else {
    $('#stage option[value="'+obj.stage+'"]').prop("selected", true);
    stagechange();
  //need methodClass and methodName, or placeNotation
    if (obj.placeNotation) {
      $('#lookupstrat input[value="pn"]').prop("checked", true);
      changestrategy();
      obj.lookup = "pn";
      
    } else if (obj.methodClass && obj.methodName) {
      obj.lookup = "name";
      obj.methodName = splittitle(obj.methodName);
    } else {
      //not enough info
      problem = "not enough info";
    }
  
  //staff options pretty much same?
  //grid options a bit different
    //had a version based on old gridtypes, but those weren't added to the query!!!
    if (obj.type === "grid" && !obj.gridtype) {
      if (obj.numbers || obj.describe || obj.blueBell) {
        obj.gridtype = "gridline";
        if (!obj.blueBell) obj.blueBell = "auto";
      } else if (oldobj.blueGroup1 || oldobj.blueGroup2) {
        obj.gridtype = "gridgrid";
        obj.gridcolors = "0";
      } else if (oldobj.bell1w) {
        obj.gridtype = "gridgrid";
        obj.gridcolors = "colors";
      }
    }
    
  }
  //if it's okay, fill things in and then just use the regular form submit??
  if (!problem) {
    fillform(obj);
    submitform();
  } else {
    console.log(problem);
    if (history) {
      //console.log("setting history");
      history.pushState('', '', '/');
    }
    //apologies(problem, obj);
  }
}

function apologies(problem, obj) {
  let text;
  switch (problem) {
    case "touch":
      text = "Apologies, currently this website cannot display touches. Please try again in the future!";
      break;
    case "complib":
      text = "Apologies, searching by complib ID is currently unavailable. Try again another day!";
      break;
    case "type":
      if (obj.type && !["grid", "staff"].includes(obj.type)) {
        text = "Apologies, "+obj.type+" mode is in the process of being rebuilt. Try again another day!";
      }
      break;
  }
  if (text) {
    $("#container").append(`<h4>${text}</h4>`);
  }
}

//only send an obj here if it has keys
function fillform(obj) {

  //need to do the text numbers too
  
  selects.forEach(s => {
    //dealing with stage earlier 
    if (s != "stage" && obj[s]) {
      //assumes selects have same name and id
      //what about blueBell
      //maybe only some selects need to trigger a function?
      $(`select[name="${s}"] option[value="${obj[s]}"]`).prop("selected", true);
      if (["methodClass", "keysig"].includes(s)) {
        $("#"+s).change();
      }
    }
  });

  texts.forEach(t => {
    if (obj[t]) {
      //also assumes same name and id but that might be correct here
      $("#"+t).val(obj[t]);
      if (t === "placeNotation") {
        $("#placeNotation").trigger("keyup");
      }
    }
  });

  numtexts.forEach(t => {
    if (t === "tenors" && obj[t]) {
      //currently only staff
      //obj.type (var type won't be set correctly yet)
      $("#stenors").val(obj[t]).change();
    }
  });

  checked.forEach(c => {
    $(`input[name="${c}"]`).prop("checked", obj[c]);
    if (["gap", "includeTime"].includes(c)) {
      $(`input[name="${c}"]`).change();
    }
  });

  //dealing with lookup earlier
  radios.forEach(r => {
    if (r === "gridcolors") {
      let id = obj[r] ? "#colordiff" : "#colorsame";
      $(id).prop("checked", true);
    } else if (r != "lookup" && obj[r]) {
      //is this really enough to get the correct thing????
      
      $(`input[value="${obj[r]}"]`).prop("checked", true);
      if (["type", "gridtype"].includes(r)) {
        $("#"+r).change();
      }
      //type gridtype
      //for "lookup" the id is "lookupstrat" but currently I'm dealing with that earlier
    }
  });
}

function resetform() {
  //selects
  $("#stage option:first-child").prop("selected", true);
  $("#keysig").val("C");
  $('#methodClass,#actTenor,select[name="blueBell"]').children().remove();
  //texts
  $('#methodName,#placeNotation,#complibid').val("");
  $('input[name="tenors"]').val("0");
  //timesig stuff
  $("div#timeOpts").addClass("hidden");
  $("div#timeOpts > fieldset > ul > li").remove();
  //radio
  radios.forEach(w => {
    if (formstart[w]) {
      $('#'+formstart[w]).prop("checked", true);
    }
  });
  changestrategy();
  //trigger type change
  typechange();
  changegridtype();
  //checkboxes
  checked.forEach(w => {
    $(`input[name="${w}"]`).prop("checked", formstart[w]);
  });

  //overall reset
  stage = null;
  $(".searchstrategy").find(":input").prop("disabled", true);
}

// FORM ADJUSTMENTS - METHOD INFO

function stagechange() {
  stage = Number($('select#stage option:checked').val());
  //console.log("stage: ", stage);
  checkedClass = "";

  $("div#searchby"+lookup).find(":input").prop("disabled", stage === null);
  typeinputs();
  
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
  $('<option></option>').appendTo('select#sblueBell');
  $('<option>auto</option>').appendTo('select.blueBell');
  $("select.blueBell option:first-child").prop("selected", true);
  blueBell = null;

  blueBellOpts(stage);
  //gridhandbellpair
  blueBellPairs(stage, stage, "#blueBell");
  //add handbell pairs to staff bluebell options
  //will be done in the staff tenors function

  //tenors behind
  $('input[name="tenors"]').attr("max", 16-stage);
  
  //update staff options
  stafftenors();
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

function gridbluechange() {
  let val = $("#blueBell option:checked").val();
  $("#describe").prop("disabled", val.includes("-"));
}


function stafftenors() {
  numbells = Number($("input#stenors").val()) + stage;
  if (numbells > 12) {
    $('select#keysig option:nth-child(-n+6)').prop("disabled", true);
  } else {
    $('select#keysig option:disabled').prop("disabled", false);
  }
  let keysig = $("select#keysig option:checked").val();
  adjustTime();
  tenOpts(keysig, numbells);
  $('option.bluepair').remove();
  blueBellPairs(stage, numbells, "#sblueBell");
}

//switch between method name, pn, or complib
function changestrategy() {
  let prev = lookup;
  lookup = $("#lookupstrat input:checked").val();
  
  $("div.searchstrategy").find(":input").prop("disabled", true);
  $("div#searchby"+lookup).find(":input").prop("disabled", stage === null);

  $("div#searchby"+prev).addClass("hidden");
  $("div#searchby"+lookup).removeClass("hidden");
  //$("div#searchby"+prev).slideUp(600, () => {
  //  $("div#searchby"+lookup).slideDown(600);
  //});
}

function typeliclick(e) {
  let id = $(e.currentTarget).find("input").attr("id");
  $("#"+id).prop("checked", true);
  typechange();
}

function typeinputs() {
  $("div.type").find(":input").prop("disabled", true);
  
  if (type === "grid") {
    //can choose line or grid
    $("#gridtype input,#show-pn").prop("disabled", false);
    //only enable one of the grid types!
    changegridtype();
    //toggleGridTypes();
    // if it's a touch, don't allow showing pn
    if ($("#touch").is(":checked")) {
      $("#show-pn").prop("disabled", true);
    }
  } else {
    $("div#"+type+"opts").find(":input").prop("disabled", stage === null);
  }
}

function typechange() {
  type = $("#type input:checked").attr("id");
  $("#type li").removeClass("selected");
  $("#type input:checked").parent("li").addClass("selected");
  
  // disable/enable form inputs
  typeinputs();
  
  
  
  $(".type").addClass("hidden");
  $("div#"+type+"opts").removeClass("hidden");
  
  //remove higher stages for graph and simulator
  //I don't appear to be dealing with people having selected one of those stages
  $("#stage option:nth-child(n+11)").prop("disabled", ["graph", "simulator"].includes(type));
}

function changegridtype() {
  let prev = gridtype;
  gridtype = $('input[name="gridtype"]:checked').val();
  $("div.gridtype").find(":input").prop("disabled", true);
  $("div#"+gridtype).find(":input").prop("disabled", false);

  $("div#"+prev).addClass("hidden");
  $("div#"+gridtype).removeClass("hidden");
  //$("div#"+prev).slideUp(400, () => {
  //  $("div#"+gridtype).slideDown(400);
  //});
}

function pnkeyup() {
  $("#pnerrors").text("");
  let allowed = ".,x-&+";
  let errs = [];
  let val = $(this).val();
  let chars = $(this).val().split("").map(c => {
    if ("etabcd".includes(c)) {
      return c.toUpperCase();
    } else if (c === "X") {
      return "x";
    } else {
      return c;
    }
  });

  //stage needs to be specified
  if (!stage) {
    //shouldn't be possible
    errs.push("make sure to select a stage!");
  } else {
    allowed += places.slice(0,stage);
  }
  //unrecognized character, includes places outside stage
  if (chars.find(c => !allowed.includes(c))) {
    errs.push("unrecognized character in place notation");
  }
  //no x or - on odd stages
  let cross = chars.includes("x") ? "x" : chars.includes("-") ? "-" : null;
  if (stage%2 === 1 && cross) {
    errs.push(cross + " not allowed on odd stages");
  }
  //consecutive x or - okay but no other consecutives
  let pairs = chars.slice(0, chars.length-1);
  for (let i = 0; i < pairs.length; i++) {
    pairs[i] += chars[i+1];
  }
  let filter = pairs.filter(p => p[0] === p[1] && !["x","-"].includes(p[0]));
  if (filter.length) {
    errs.push("repeated "+filter[0][0]+" not allowed");
  }
  //first character can't be , or .
  if ([",","."].includes(chars[0])) {
    errs.push("can't begin with "+chars[0]);
  }

  if (errs.length) {
    //display them
    errs.forEach(e => {
      $("#pnerrors").append(`<p>${e}</p>`);
    });
  } else {
    let res = pnlexer(chars.join(""));
    //shouldn't be any errors...
    let next = pnNumJoin(res[1]);
    if (next[0]) {
    //display errors
      $("#pnerrors").append(`<p>${next[0]}</p>`);
    }
  }
  
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

  //includes something not a-z, a space, or 0-9
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
  let lstr = "áàäâāåčçéèëêēe̊íìïîīñóòöôōo̊øṟřšśúùüûūůæ₃₁²™";
  let letters = {
    a: "áàäâāå",
    ae: "æ",
    c: "čç",
    e: "éèëêēe̊",
    i: "íìïîī",
    n: "ñ",
    o: "óòöôōo̊ø",
    r: "ṟř",
    s: "šś",
    u: "úùüûūů",
    tm: "™",
    "1": "₁",
    "2": "²",
    "3": "₃",
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
  } while (n < howMany && methods.length > 0);
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

//search json methodNames file, returns array with methods
function methodNames(stage, checkedClass) {
  let classMethods = [];
  if (checkedClass == "Plain") {
    var plainClasses = ["Bob", "Place"];
    
    for (let i = 0; i < plainClasses.length; i++) {

      let methods = methodNameList.find(o => o.stage == stage).classes.find(o => o.class == plainClasses[i]).methods;
      classMethods.push(...methods);
    }
    //console.log("length of classMethods", classMethods.length);
    
  } else {
    classMethods = methodNameList.find(o => o.stage == stage).classes.find(o => o.class == checkedClass).methods;
    
  }
  return classMethods;
}

//hopefully now works with plain array of method names???
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
    
    let numMethods = methodList.length;
    
    
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
        let text = methodList[j].substring(0,methodList[j].length-1-stageName.length);
        methods.push(text);
        if (checkname(text.toLowerCase(), value)) {
          numMatch++;
        }
      }
    } else {
      //if there are ≥16 methods, make an array of those that match search
      
        for (var k = 0; k < methodList.length; ++k) {
          let method = methodList[k].substring(0,methodList[k].length-1-stageName.length);
          if (checkname(method.toLowerCase(), value)) {
            methods.push(method);
            numMatch++;
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
        $("#methodName").val($("#methodList li.selected").text());

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

function blueBellPairs(stage, numbells, id) {
  let max = stage%2 === 0 ? stage : numbells > stage ? stage+1 : stage-1;
  for (let i = 1; i < max; i+=2) {
    let val = [i,i+1].join("-");
    let c = id === "#sblueBell" ? ` class="bluepair"` : "";
    $(`<option${c}></option>`).text(val).val(val).appendTo(id);
  }
}

// staff form options


function toggleTime() {
  if (!$("#time-sig").is(":checked")) {
    $("div#timeOpts").addClass("hidden");
    $("div#timeOpts > fieldset > ul > li").remove();
    //$("div#timeOpts").slideUp(1000, "swing");
  } else if (stage > 0) {
    adjustTime();
  }
}


//
function adjustTime() {
  //remove previous options
  $("div#timeOpts > fieldset > ul > li").remove();
  //set vars
  stage = Number($('select#stage option:checked').val());
  numbells = Number($('input#stenors').val()) + stage;
  //handstroke gap?
  let gap;
  if ($("#handstroke-gap").is(":checked")) {
    gap = true;
    //console.log("include handstroke gap");
  }
  
  //top numbers
  let handTS = buildTime(numbells);
  let backTS = gap ? buildTime(numbells+1) : [];
  
  //actually add the stuff
  if ($("#time-sig").is(":checked")) {
    $("div#timeOpts > fieldset > ul").append(timeOpts(handTS, backTS));
    //$("div#timeOpts").slideDown(1000, "swing");
    $("div#timeOpts").removeClass("hidden");
  }
}

//inputs are arrays of options for top number of timesig
//if there is no handstroke gap, "back" will be empty
function timeOpts(hand, back) {
  let length = Math.max(hand.length, back.length);
  let options = "";
  let denoms = ["4", "2", "1"];
  let ids = ["quarter", "half", "whole"];
  
  //hand has at least one number, which can go with 4 on the bottom
  for (let i = 0; i < length; i++) {
    let j = hand[i] ? i : 0;
    let handT = hand[j];
    let handB = denoms[j];
    let nums = [handT, handB];
    let backT, backB;
    let b = back[i] ? i : back[0] ? 0 : -1;
    if (b > -1) {
      backT = back[b];
      backB = denoms[b];
      nums.push(backT, backB);
    }
    let value = nums.join("-");
    //why did I think this needed updating? line break?
    let dispvalh = `${handT} <br/> ${handB}`;
    let dispvalb = backT && backB ? `${backT} <br/> ${backB}` : "";
    
    options += `<li class="time">
    <label for="${ids[i]}">
      <ul class="row">
        <li>
          <input type="radio" id="${ids[i]}" name="timesig" value="${value}" />
        </li>
        <li>
          ${dispvalh}
        </li>
        <li>
          ${dispvalb}
        </li>
      </ul>
    </label>
    </li>`;
  }
  return options;
}

//options for top number of time sig
function buildTime(num) {
  let options = [num];
  if (num % 2 === 0) {
    options.push(num/2);
  }
  if (num % 4 === 0) {
    options.push(num/4);
  }
  return options;
}

function toggleKey() {
  stage = Number($("select#stage option:checked").val());
  let numBells = Number($("input#stenors").val()) + stage;
  let keysig = $("select#keysig option:checked").val();
  
  if (stage > 0) {
    tenOpts(keysig, numBells);
  }
}

//given keysig (there is always one selected) and numbells (includes tenors behind), offer options for tenor note—equivalent to different modes
function tenOpts(keysig, numBells) {
  //remove previous options
  $("select#actTenor > option").remove();
  //order of scale degrees that will have a flat
  const sds = [4, 1, 5, 2, 6, 3, 7];
  //distinction at 12 bells
  let big = numBells > 12;
  //given stage, how many tenor options are there
  let numChoices = big ? 1 : Math.min(13-numBells, 7);
  //is the keysig in sharps or flats
  let numS = sharps.indexOf(keysig)+1;
  let numF = flats.indexOf(keysig)+1;
  
  let options = '';
  //start with highest option
  let letter = getChar(keysig, numChoices-1);
  for (let i = 0; i < numChoices; i++) {
    let selected = i === numChoices-1 ? "selected" : "";
    let sd = numChoices-i;
    let a = "";
    
    //if sharp key
    if (numS > 0) {
      if (sds.reverse().slice(0, numS).indexOf(sd) > -1) {
        a = "♯";
      }
      sds.reverse();
    }
    //if flat key
    if (numF > 0 && sds.slice(0, numF).indexOf(sd) > -1) {
      a = "♭";
    }
    
    options += `
    <option value="${letter}" ${selected}>${letter}${a}</option>`;
    letter = getChar(letter, -1);
  }
  if (numBells < 11) {
    options += `
    <option value="${keysig[0]}P">${keysig} pentatonic</option>`;
  }
  
  $("select#actTenor").append(options);
}

//get next or previous letter of musical alphabet
function getChar(char, dir) {
  let current = char.charCodeAt(0);
  let next = current + dir;
  
  while (next < 65) {
    next += 7;
  }
  while (next > 71) {
    next -= 7;
  }
  
  return String.fromCharCode(next);
}


// BASIC SUBMIT

//click submit
function submitform() {
  $(".results,.chute").remove();
  window.location.hash = "";
  method = null;
  blueBell = null;
  let form = document.getElementById("formform");
  let data = new FormData(form);
  queryobj = {};
  let queryarr = [];
  
  for (let key of data.entries()) {
    switch (key[0]) {
      case "stage": case "tenors":
        queryobj[key[0]] = Number(key[1]);
        break;
      case "gridcolors":
        if (key[1] === "colors") queryobj.gridcolors = true;
        break;
      default:
        if (key[1].length) {
          queryobj[key[0]] = key[1];
        }
        
    }
    
  }

  if (queryobj.type === "grid" && queryobj.gridtype === "gridgrid") {
    queryobj.quantity = "onelead";
  }

  if (!queryobj.stage) {
    $("#container").append(`<h4>Pick a stage to search for a method!</h4>`);
  } else if (queryobj.lookup === "name" && (!queryobj.methodClass || !queryobj.methodName)) {
    $("#container").append(`<h4>Enter a method name to view it</h4>`);
  } else if (queryobj.lookup === "pn" && !queryobj.placeNotation) {
    $("#container").append(`<h4>Enter place notation for the method you want to view</h4>`);
  } else {
    resultsrouter(queryobj);
  }
  
  
}

//two steps: build row array, then display it
function resultsrouter(obj) {
  //console.log(obj);
  $("#container").contents().remove();
  $("#simulatorcontainer").hide();
  let queryarr = Object.keys(obj).map(k => encodeURIComponent(k)+"="+encodeURIComponent(obj[k]).replace(/%20/g, "+"));
  //get row array
  let title;
  //different process for method name or place notation
  switch (obj.lookup) {
    case "name":
      title = routermethod(obj);
      break;
    case "pn":
      title = routerpn(obj);
      break;
  }
  //do stuff with it
  
  
  if (title) {
    //console.log(method.hunts);
    //$("#anchorcontainer").append(`<a name="svgs"></a>`);
    switch (obj.type) {
      case "grid":
        routergrid(obj, title);
        break;
      case "staff":
        drawstaff(title);
        break;
      case "simulator":
        routersimulator(title);
        break;
    }
    
    window.location.hash = 'svgs';
    if (history) {
      //console.log("setting history");
      history.pushState('', '', '/?'+queryarr.join("&")+"#svgs");
    }
    
  } else {
    window.location.hash = 'svgs';
    if (history) {
      //console.log("setting history");
      history.pushState('', '', '/#svgs');
    }
    let text = obj.lookup === "name" ? "Method not found" : "Problem with place notation";
    $("#container").append(`<h4>${text}</h4>`);
  }
}

//step two: display
function routergrid(obj, title) {
  //different grid display options
  $("#container").append("<h1>"+title+"</h1>");

  switch (obj.gridtype) {
    case "gridline":
      if (obj.blueBell != "auto") {
        //gridhandbellpair
        //blueBell = Number(obj.blueBell);
      }
      let pbs = !method.stedman && method.leadLength > 3;
      drawgrid(pbs);
      break;
    case "gridgrid":
      drawgridgrid();
      break;
  }
}

//step one: build rows
function routermethod(obj) {
  method = findmethod(obj);
  let title;
  if (method) {
    let stagename = getStageName(obj.stage);
    if (method.name === "Stedman "+stagename) {
      method.stedman = true;
    }
    title = method.name; //+ " - plain course";
    buildrowarr();
  }
  return title;
}

//step one: build rows
function routerpn(obj) {
  let res = parsePN(obj.placeNotation, obj.stage);
  let title;
  //console.log(res);
  if (res[0]) {
    //error
  } else {
    let pn = res[1];
    let m = findbypn(pn, obj.stage);
    if (m) {
      method = m;
      title = method.name;
    } else {
      method = {
        stage: obj.stage,
        leadLength: pn.length,
        plainPN: pn,
        hunts: findhunts(pn, obj.stage),
        pbOrder: buildpborder(pn, obj.stage)
      };
      title = obj.placeNotation;
    }
    buildrowarr();
  }
  return title;
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
      rowArray = buildRows(rounds(method.stage), method.plainPN, 1);
      rowArray.unshift({rowNum: 0, bells: rounds(method.stage)});
      break;
    case "touch":
      // stuff here later
      break;
    default:
      buildplaincourse(method.stage, method.plainPN);
  }
  
  if (method.stedman) {
    addLHs(6, 3, "new six");
  }
  addLHs(method.leadLength, 0, "leadhead");

  if (queryobj.tenors) {
    let tenors = [];
    for (let i = 0; i < queryobj.tenors; i++) {
      tenors.push(stage+1+i);
    }
    rowArray.forEach(r => {
      r.bells.push(...tenors);
    });
    
  }
  numbells = rowArray[0].bells.length;
}

//should probably do something with title?
function routersimulator(title) {
  $("#simulatorcontainer h1").text(title);
  $("#myrope option").remove();
  for (let i = 1; i <= numbells; i++) {
    $("#myrope").append(`<option value="${i}">${i}</option>`);
  }
  //build row array in needed format
  //actually just modify the row array I'm already building
  rowArray.forEach(o => {
    o.row = o.bells.map(n => [n]);
  });
  //need to add extra rounds row and go call
  let zero = rowArray[0];
  if (rowArray[0].rowNum === 0) {
    let extra = {rowNum: -1, row: zero.row, bells: zero.bells};
    let call = "Go "+(method.name && method.name.length ? method.name : "next time");
    extra.call = call;
    rowArray.unshift(extra);
  }
  for (let i = 0; i < simopts.roundsrows-2; i++) {
    let o = {rowNum: -2-i, row: zero.row, bells: zero.bells};
    rowArray.unshift(o);
  }
  firstcall = rowArray[0].call || null;
  //markers
  $(".sound.marker").remove();
  placemarkers();
  //set of sounds/bell objects to use
  buildcurrentbells("tower", numbells);
  //set peal speed
  setpealspeed();
  calcspeed();
  //set "mybell" if auto?
  if (!queryobj.blueBell || queryobj.blueBell === "auto") {
    let blue = chooseworking(1);
    blueBell = blue[0];
  } else {
    blueBell = Number(queryobj.blueBell);
  }
  $("#myrope option:nth-child("+blueBell+")").attr("selected", true);
  //add ropes
  //position ropes
  //connect sounds to ropes
  buildtower(blueBell, numbells);
  let perspective = "63% 40%";
  switch (numbells) {
    case 12:
      perspective = "55% 40%";
      break;
    case 10:
      perspective = "57% 40%";
      break;
  }
  $("#bells").css("-webkit-perspective-origin", perspective);
  //assign bell
  assign(blueBell);
  //set up coursing order
  if (method.leadHeadCode && method.hunts.length === 1) {
    let co = homecourseorder(method.stage);
    co.unshift(method.stage);
    method.courseorder = co;
  }
  method.courseorder ? $("#li-cosallies").show() : $("#li-cosallies").hide();
  //which things need resetting?
  $("#simulatorcontainer").show();
}




/* ***** SIMULATOR SETUP ***** */

function setpealspeed() {
  let minutes = 150 + numbells*5;
  let h = Math.floor(minutes/60);
  let m = minutes % 60;
  $("#hours").val(h);
  $("#minutes").val(m);
}

//take peal speed values and calculate row and blow duration
function calcspeed() {
  let h = Number($("#hours").val());
  let m = Number($("#minutes").val());
  savesimspeed(h,m);
  let minutes = h*60 + m;
  let wholepull = minutes / 2520;
  delay = wholepull * 60 / (numbells*2+1);
  speed = delay*numbells;
  $("#sound-line1,#sound-line2").css("transition", "width "+(speed*2-delay)+"s linear");
}

//take speed and calculate delay and peal speed
function calcpealspeed() {
  delay = speed/numbells;
  let wholepull = speed*2+delay; //add handstroke gap
  let minutes = Math.round(wholepull * 2520 / 60);
  let h = Math.floor(minutes/60);
  let m = minutes % 60;
  $("#hours").val(h);
  $("#minutes").val(m);
  savesimspeed(h,m);
  $("#sound-line1,#sound-line2").css("transition", "width "+(speed*2-delay)+"s linear");
}

function savesimspeed(h, m) {
  simopts.hours = h;
  simopts.minutes = m;
}

function buildcurrentbells(type, n) {
  currentbells = [];
  let filter = bells.filter(o => o.type === type);
  for (let i = 0; i < n; i++) {
    let model = filter[i];
    let o = {
      num: n-i,
      buffer: model.buffer,
      stroke: 1
    };
    currentbells.push(o);
  }
}

//add markers
function placemarkers() {
  let left = -8;
  for (let i = 0; i < numbells*2; i++) {
    $("#sound-line1,#sound-line2").append(`<div class="sound marker" style="left: ${left}px;"></div>`);
    if (i%numbells === 0) $(".sound.marker:last-child").addClass("first");
    left += 660/(2*numbells-1);
  }
}

//reset marker position when they're already there
function positionmarkers() {
  let left = -8;
  for (let i = 1; i <= numbells; i++) {
    $(".sound.marker:nth-child("+i+")").css("left", left+"px");
    $(".sound.marker:nth-child("+(i+numbells)+")").css("left", (left+360)+"px");
    left += 660/(2*numbells-1);
  }
}
//reset one line of markers
function positionlinemarkers(id) {
  let left = -8;
  let distance = 660/(2*numbells-1);
  for (let i = 1; i <= numbells*2; i++) {
    $(id+" .sound.marker:nth-child("+i+")").css("left", left+"px");
    left += distance;
  }
  console.log(left-distance);
}

//set up all the ropes
//start is the center/user rope, n is numbells
function buildtower(start, n) {
  //start with closest rope and go clockwise
  for (let i = 0; i < n; i++) {
    let num = start + i;
    if (num > n) num -= n;
    let j = n - num;
    
    addrope(num);
    position(i,num);
    //attach sounds to animation
    let handstroke = document.getElementById("hand9b"+num);
    handstroke.addEventListener("beginEvent", ring);
    let backstroke = document.getElementById("back11b"+num);
    backstroke.addEventListener("beginEvent", ring);
  }
}

//copied from bellmaster, some differences
function position(i, num) {
  let radius = 270; //update this for non-div by 4 stages
  let zrad = 270; //diff ????
  let angle = 2*Math.PI/numbells*i;
  //adjustment here for user ringing two bells
  let left = radius - radius * Math.sin(angle);
  let z = Math.cos(angle*-1) * zrad - zrad/2; //diff
  let bell = currentbells.find(b => b.num === num);
  bell.left = left;
  bell.z = z;
  $("#chute"+num).css({"left": left+"px", transform: "translateZ("+z+"px)"});
}

function addrope(num) {
  let div = `<div class="chute" id="chute${num}">
    <span class="bellnum">${num}</span>
    <span class="placebell"></span>
  </div>`;
  //then append the div
  $("#bells").append(div);
  let rope = svg.svg($("#chute"+num), null, null, 60, 500, {id: "rope"+num, class: "rope", viewBox: "0 0 60 500", xmlns: "http://www.w3.org/2000/svg", "xmlns:xlink": "http://www.w3.org/1999/xlink"});
  let defs = svg.defs(rope);
  let pattern = svg.pattern(defs, "sallypattern", 0, 0, 1, 0.13);
  let patternpaths = [{stroke: "blue", d: "M -2 4 l 5 -5"}, {stroke: "red", d: "M -2 8 l 9 -9"}, {stroke: "skyblue", d: "M -2 12 l 12 -12"}, {stroke: "blue", d: "M 1 13 l 9 -9"}, {stroke: "red", d: "M 5 13 l 5 -5"}];
  patternpaths.forEach(o => {
    svg.path(pattern, o.d, {"stroke-width": 3.2, stroke: o.stroke});
  });

  svg.rect(rope, 30, -90, 3, 260, {fill: "#dddddd", "stroke-width": 1, stroke: "#aaaaaa"});
  svg.rect(rope, 30, 255, 3, 60, {fill: "#dddddd", "stroke-width": 1, stroke: "#aaaaaa"});

  let hand = svg.svg(rope, null, null, null, null, {class: "hand", id: "hand"+num});
  svg.rect(hand, 0, 170, 29, 90, {fill: "transparent"});
  svg.rect(hand, 35, 170, 29, 90, {fill: "transparent"});
  svg.rect(hand, 27, 170, 9, 90, 7, null, {fill: "url(#sallypattern)", class: "sally", id: "sally"+num});

  let back = svg.svg(rope, null, null, null, null, {class: "back", id: "back"+num});
  svg.rect(back, 0, 315, 29, 61, {fill: "transparent"});
  svg.rect(back, 33, 315, 29, 61, {fill: "transparent"});
  let tail = svg.svg(back, null, null, null, null, {class: "tail", id: "tail"+num});
  svg.rect(tail, 30, 315, 5, 61, {fill: "white"});
  svg.path(tail, "M31.5,310 v30 l2,2 v30 l-1,2 h-2 l-1,-2 v-28 l4,-5 v-20 l-6,-3", {"stroke-width": 3, stroke: "#dddddd", fill: "none"});
  svg.path(tail, "M30,290 v50 l2,2 v30 l-1,2 l-1,-2 v-28 l5,-5 v-20 l-6,-3", {stroke: "#aaaaaa", "stroke-width": 1, fill: "none"});
  svg.path(tail, "M33,290 v50 l2,2 v30 l-2,3 h-4 l-2,-2 v-28 l6,-7 v-17 l-6,-3 l1.2,-2", {stroke: "#aaaaaa", "stroke-width": 1, fill: "none"});
  svg.rect(tail, 30.5, 315, 2, 9, {fill: "#dddddd"});
  svg.path(tail, "M31,342 l3,-3", {stroke: "#dddddd", fill: "none", "stroke-width": 1});

  let yy = [0, -6.2, -17, -37.22, -55.2, -37.11, -9.74, 23, 56.35, 89.125, 116.15, 135.04, 149.42, 159.65, 170.1, 173.7];
  ["hand", "back"].forEach(s => {
    for (let i = 0; i < yy.length-1; i++) {
      let j = s === "hand" ? i+1 : i;
      let y = s === "hand" ? yy[j] : yy[yy.length-i-2] ;
      let dur = setdur(s,i);
      let begin = i === 0 ? "indefinite" : s + (j-1) +"b"+num + ".endEvent";
      svg.other(rope, "animate", {id: s+j+"b"+num, attributeName: "viewBox", to: "0 "+y+" 60 500", dur: dur, begin: begin, fill: "freeze"});
    }
  });
}

//calculate duration for a portion of the bellrope animation
function setdur(s,i) {
  let n = simopts.duration/21;
  let dur = [0,14].includes(i) ? 3*n : [1,13].includes(i) ? 2*n : n;
  return dur;
}



/* ***** RUN THE SIMULATOR ***** */

function resetsimulator() {
  if (!$("#reset").hasClass("disabled")) {
    $("#reset").addClass("disabled");
    $("#display,#callcontainer,.instruct").text("");
    
    //set bells at hand
    for (let i = 1; i <= numbells; i++) {
      pull({bell: i, stroke: -1},audioCtx.currentTime+i*delay);
    }
    //reset things
    rownum = 0;
    ringingplace = 0;
    roundscount = 0;
    lastcall = "";
    ringingstroke = 1;
    thatsall = false;
    currentcall = null;
    soundrow = 1;
    soundplace = 0;
    callqueue = [];
    soundqueue = [];
    resetsoundline(1);
    resetsoundline(2);
    //course order sally stuff
  }
}

function playpauseclick() {
  if (!playing) {
    treblesgoing();
  } else {
    thatisall();
  }
}

//start
function treblesgoing() {
  playing = true;
  $("#start").text("Stop");
  $("#reset").addClass("disabled");
  //need to distinguish already-disabled inputs
  //disable everything
  //$("#options input").prop("disabled", true);

  //set values
  nextBellTime = audioCtx.currentTime;
  if (rownum === 0 && (!mybells.includes(1) || simopts.standbehind)) {
    ringingplace = -2;
  }
  //actually go
  animrequest = requestAnimationFrame(animater);
  if (rownum === 0 && mybells.includes(1) && !simopts.standbehind) {
    console.log("waiting in treblesgoing");
    waiting = true;
  } else {
    console.log("starting");
    waiting = false;
    scheduler();
  }
  
}

function calcnextdelay(stroke) {
  let currentfraction = stroke === 1 ? 11 : 14;
  let currentdiff = currentfraction/21 * simopts.duration;
  let nextsound = currentdiff + delay;
  let nextfraction = stroke === 1 ? 14 : 11;
  let nextstart = nextsound - nextfraction/21*simopts.duration;
  if (stroke === -1) nextstart += delay*simopts.handgap; //handstroke gap
  return nextstart;
}

//advance a place in the scheduling
function nextPlace() {
  ringingplace++;
  if (ringingplace < numbells) nextBellTime += delay;
  
  if (ringingplace === 1) {
    //schedule call
    if (currentcall) {
      callqueue.push({call: currentcall, time: nextBellTime, rownum: rownum});
    }
    //stuff to do if showing placebells and/or sally coursing order
  }
  //end of row
  if (ringingplace === numbells) {
    //console.log("end of row "+rownum);
    nextBellTime += calcnextdelay(ringingstroke);
    if (ringingstroke === -1) {
      //schedule soundline reset - sort of
      let o = {place: numbells*2+1, time: nextBellTime-delay};
      if (rownum === rowArray.length-1 && thatsall) {
        o.thatsall = true;
      }
      soundqueue.push(o);
      
    } 
    ringingplace = 0;
    ringingstroke *= -1;
    rownum++;
    currentcall = rowArray[rownum] && rowArray[rownum].call ? rowArray[rownum].call : " ";

    if (rownum === rowArray.length-2) {
      //nearing end
      roundscount++;
      if ((roundscount === simopts.nthrounds && simopts.stopatrounds) || comp) {
        thatsall = true;
        if (currentcall === " ") currentcall = "That's all!";
      }
    }

    if (rownum === rowArray.length && !thatsall) {
      //repeat the rowArray
      //resetting of bells rung required???
      rownum = simopts.roundsrows;
    }

    
  }
}

//p is ringingplace, t is nextBellTime
function scheduleRing(p, t) {
  if (p > -1) {
    let arr = rowArray[rownum].row[p];
    let bell = arr && arr.length;
    let mine = bell ? mybells.includes(arr[0]) : null;

    if (bell) {
      if (!mine || simopts.standbehind) pull({bell: arr[0], stroke: ringingstroke}, t);
      //put an object into soundqueue even if it's mybell
      //first place of handstrokes needed to start the line
      let o = {
        place: p+1,
        time: t,
        mybell: mine
      };
      if (ringingstroke === -1) {
        o.place += numbells;
        o.time += 13*simopts.duration/21;
      } else {
        o.time += 9*simopts.duration/21;
      }
      soundqueue.push(o);
    }
    //clear "treble's going"
    if (rownum === 0 && p === 0) {
      console.log("first bell");
      callqueue.push({call: "", time: t, rownum: rownum});
    }
    //schedule first call
    if (rownum === simopts.roundsrows-2 && p === 1 && firstcall) {
      callqueue.push({call: firstcall, time: t, rownum: rownum});
    }
    //wait or move to next place
    if ((mine && !simopts.standbehind) && simopts.waitforgaps && (!arr || !arr[1])) {
      waiting = t;
      console.log("waiting in schedulering");
    } else {
      nextPlace();
    }
  } else {
    let call = p === -2 ? "Look to" : "Treble's going";
    callqueue.push({call: call, time: t, rownum: rownum});
    nextPlace();
  }
}

function scheduler() {
  while (nextBellTime < audioCtx.currentTime + schedule && rowArray[rownum] && !waiting) {
    scheduleRing(ringingplace, nextBellTime);
  }
  !waiting && rowArray[rownum] ? timeout = setTimeout(scheduler, lookahead): clearTimeout(timeout);
}

function animater() {
  let call = lastcall;
  let callrow = lastcallrow;
  let currentTime = audioCtx.currentTime;

  while (callqueue.length && callqueue[0].time < currentTime) {
    call = callqueue[0].call;
    callrow = callqueue[0].rownum;
    callqueue.shift();
  }
  if (call != lastcall || callrow != lastcallrow) {
    $("#callcontainer").text(call);
    lastcall = call;
    lastcallrow = callrow;
  }
  //feedback stuff
  let soundmark = soundplace;
  let ending;
  if (soundqueue[0] && soundqueue[0].time < currentTime) {
    soundmark = soundqueue[0].place;
    ending = soundqueue[0].thatsall;
    if (soundqueue[0].mybell) {
      let marker = $("#sound-line"+soundrow+" .sound.marker:nth-child("+soundmark+")");
      marker.addClass("mymarker");
    }
    soundqueue.shift();
  }
  if (soundmark != soundplace) {
    let soundline = "#sound-line"+soundrow;
    if (soundmark > (numbells*2) ) {
      if (ending) {
        thatisall();
      } else {
        let other = soundrow === 1 ? 2 : 1;
        soundrow = other;
        resetsoundline(soundrow);
      }
    } else {
      $(soundline+" .sound.marker:nth-child("+soundmark+")").show();
    }
    soundplace = soundmark;

    if (soundmark === 1) {
      $(soundline).css("width", "660px");
    }
  }

  if (playing) {
    animrequest = requestAnimationFrame(animater);
  }
}

function thatisall() {
  console.log("ending play");
  playing = false;
  waiting = false;
  clearTimeout(timeout);
  cancelAnimationFrame(animrequest);
  $("#start").text("Start");
  $("#reset").removeClass("disabled");
  //enable inputs again...
}



/* ***** SIMULATOR USE ***** */

//ring with keyboard
function keyring(e) {
  let bell = mbells.find(o => o.keys.includes(e.key));
  if (bell && !bell.ringing && !keysdown.includes(e.key) && !simopts.standbehind) {
    keysdown.push(e.key);
    let stroke = currentbells.find(b => b.num === bell.num).stroke;
    let o = {bell: bell.num, stroke: stroke};
    pull(o);
  }
}

function updatekeysdown(e) {
  let i = keysdown.indexOf(e.key);
  if (i > -1) {
    keysdown.splice(i, 1);
  }
}

//emit ring from a click
function emitring(e) {
  let num = this.id.startsWith("sally") ? Number(this.id.slice(5)) : Number(this.id.slice(4));
  let bell = currentbells.find(b => b.num === num);
  let o = {bell: bell.num};
  if ((this.id.startsWith("sally") || this.id.startsWith("hand")) && bell.stroke === 1) {
    o.stroke = 1;

  } else if ((this.id.startsWith("tail") || this.id.startsWith("back")) && bell.stroke === -1) {
    o.stroke = -1;
  }

  pull(o);
}

//adjust cursor on bell rope
function pointer(e) {
  let num = this.id.startsWith("sally") ? Number(this.id.slice(5)) : Number(this.id.slice(4));
  let bell = currentbells.find(b => b.num === num);
  if ((this.id.startsWith("sally") && bell.stroke === 1) || (this.id.startsWith("tail") && bell.stroke === -1)) {
    this.style.cursor = "pointer";
  } else {
    this.style.cursor = "auto";
  }
}

function prevent(e) {
  e.preventDefault();
}

function endpull(e) {
  let bellnum = Number(this.id.slice(7));
  let bell = mbells.find(o => o.num === bellnum);
  if (bell) {
    bell.ringing = false;
  }
}


//ring a bell
//obj has: bell (number), stroke (1 or -1)
//if user has triggered the pull, no t
function pull(obj, t) {
  if (currentbells.length) {
    let now = audioCtx.currentTime;
    let id = (obj.stroke === 1 ? "hand1b" : "back0b") + obj.bell;
    let bell = currentbells.find(b => b.num === obj.bell);

    if (bell && bell.stroke === obj.stroke) { //if strokes are consistent
      //stuff to do if it's my bell

      
      //actually pull the rope
      t ? document.getElementById(id).beginElementAt(t-now) : document.getElementById(id).beginElement();
      
      bell.stroke = obj.stroke * -1;
    }

    if (waiting) {
      //either user has the treble and needs to start everything, or "wait for human" is on and they are late
      nextBellTime = Math.max(audioCtx.currentTime, nextBellTime); //waiting === true ? now+delay : 
      waiting = false;
      scheduler();
    }
  }
}

//given animation event find the buffer to play
function ring(e) {
  let stroke = this.id.startsWith("hand") ? 1 : -1;
  let bellnum = Number(this.id.startsWith("hand") ? this.id.slice(6) : this.id.slice(7));
  let bell = currentbells.find(b => b.num === bellnum);
  if (bell) {
    let pan = [];
    let x = (bell.left - 270)/135;
    let z = (bell.z)/100;
    pan.push(x, 10, z);
    if (simopts.melouder) {
      let multiplier = mybells.includes(bellnum) ? 1.2 : 0.75;
      gainNode.gain.value = simopts.volume * multiplier;
    }
    let buffer = bell.buffer;
    playSample(audioCtx, buffer, pan);
  }
}

//play sound
function playSample(audioContext, audioBuffer, pan) {
  //console.log("playSample called");
  //console.log(audioBuffer);
  const sampleSource = audioContext.createBufferSource();
  sampleSource.buffer = audioBuffer;
  const panner = audioContext.createPanner();
  panner.panningModel = 'equalpower';
  if (pan) {
    panner.setPosition(...pan);
    sampleSource.connect(panner).connect(gainNode).connect(audioContext.destination);
  } else {
    sampleSource.connect(gainNode).connect(audioContext.destination);
  }
  //sampleSource.connect(audioContext.destination);
  sampleSource.start();
  return sampleSource;
}

//reset so it can start again
function resetsoundline(n) {
  let id = "#sound-line"+n;
  $(id+" .sound.marker").hide();
  $(id+" .sound.marker").removeClass("mymarker");
  positionlinemarkers(id);
  let line = $(id).detach();
  line.css("width", "0");
  $("#visuals li:nth-child("+n+")").append(line);
}




/* ***** SIMULATOR ADJUSTMENTS ***** */


function myropechange(e) {
  let n = Number($("#myrope option:selected").val());
  console.log(n);
  assign(n);
}

//assign bell to user
function assign(n) {
  //remove existing listeners
  listeners.forEach(l => {
    mybells.forEach(b => {
      document.getElementById(l.id+b).removeEventListener(l.event, l.f);
    });
    if (n && !simopts.standbehind) {
      document.getElementById(l.id+n).addEventListener(l.event, l.f);
    }
  });
  if (n) {
    mybells = [n];
    //update keyboard controls
    let str = "1234567890-=";
    let keys = str[n-1];
    keys += "j";
    mbells = [{num: n, keys: keys}];
    $("#mykeys").val(keys);

    //rotate ropes
    let diff1 = blueBell - n;
    let diff2 = n - blueBell;
    if (diff1 < 0) diff1 += numbells;
    if (diff2 < 0) diff2 += numbells;
    let dir = diff1 <= diff2 ? 1 : -1;
    let diff = dir === 1 ? diff1 : diff2;
    if (diff > 0) {
      $("#myrope").prop("disabled", true);
      rotate(dir);
      diff--;
      let timer = setInterval(function() {
        if (diff > 0) {
          rotate(dir);
          diff--;
        } else {
          $("#myrope").prop("disabled", false);
          centerrope = [n];
          clearTimeout(timer);
        }
      }, 700);
    }
    //instructions
    //co sally stuff
  }
}

//rotate rope circle
function rotate(dir) {
  let pos = [];
  for (let i = 1; i <= numbells; i++) {
    let bell = currentbells.find(b => b.num === i);
    let o = {
      left: bell.left,
      z: bell.z
    }
    pos.push(o);
  }

  dir === 1 ? pos.push(pos.shift()) : pos.unshift(pos.pop());
  for (let i = 1; i <= numbells; i++) {
    let bell = currentbells.find(b => b.num === i);
    $("#chute"+i).css({"left": pos[i-1].left+"px", transform: "translateZ("+pos[i-1].z+"px)"});
    bell.left = pos[i-1].left;
    bell.z = pos[i-1].z;
  }
}


function simoptionschange(e) {
  let inputtype = $(this).attr("type");
  if (inputtype === "checkbox") {
    simopts[this.id] = $(this).is(":checked");
  } else if (this.id != "mykeys") {
    simopts[this.id] = Number($(this).val());
  }
  /*
    options simply set and used:
    "handgap"
    "stopatrounds", "nthrounds"
    "waitforgaps"
    "standbehind"
    "melouder"
  */
  switch (this.id) {
    case "volume":
      //make a change
      gainNode.gain.value = simopts.volume;
      break;
    case "duration":
      //update animations
      //should this trigger a speed change?
      adjustanimduration();
      break;
    case "hours": case "minutes":
      //update speed
      calcspeed();
      break;
    case "roundsrows":
      //adjust row array
      adjustroundsrows();
      break;
    case "cosallies": case "solidme": case "solidtreble":
      //apply sally colors
      sallycolor();
      break;
    case "highlightunder": case "fadeabove":
      //fade ropes, disable the other
      break;
    case "displayplace": case "instructions":
      //setup
      break;
    case "mykeys":
      //need to add keyboard controls adjustments
      let b = mbells[0]; //should be exactly one item in mbells
      b.keys = $(this).val();
      break;
    case "feedback":
      //need to actually add this???
      break;
    case "left-right": case "up-down": case "zoom": case "depth":
      //adjust perspective
      break;
  }
}


function sallycolor() {
  if (simopts.cosallies) {
    let courseorder = method.courseorder;
    let n = courseorder.includes(mybells[0]) ? mybells[0] : courseorder[0];
    $("#sally"+n).attr("fill", sallycolors[0]);
    let i = courseorder.indexOf(n);
    for (let j = 1; j <= Math.floor(courseorder.length/2); j++) {
      let next = i+j;
      if (next >= courseorder.length) next -= courseorder.length;
      $("#sally"+courseorder[next]).attr("fill", sallycolors[j]);
      if (courseorder.length%2 === 1 || j < Math.ceil(courseorder.length/2)) {
        let before = i-j;
        if (before < 0) before += courseorder.length;
        $("#sally"+courseorder[before]).attr("fill", sallycolors[sallycolors.length-j]);
      }
    }
  } else {
    for (let b = 1; b <= numbells; b++) {
      $("#sally"+b).attr("fill", simopts.solidme && mybells.includes(b) ? "darkred" : simopts.solidtreble && b===1 ? "red" : "url(#sallypattern)");
    }
  }
}


function adjustroundsrows() {
  rowArray = rowArray.filter(o => o.rowNum > -2);
  let zero = rowArray[0];
  for (let i = 0; i < simopts.roundsrows-2; i++) {
    let o = {rowNum: -2-i, row: zero.row, bells: zero.bells};
    rowArray.unshift(o);
  }
  firstcall = rowArray[0].call || null;
}


function adjustanimduration() {
  for (let n = 1; n <= numbells; n++) {
    for (let i = 0; i < 15; i++) {
      ["hand", "back"].forEach(s => {
        let j = s === "hand" ? i+1 : i;
        let id = ["#",s,j,"b",n].join("");
        let dur = setdur(s,i)+"s";
        $(id).attr("dur", dur);
      });
    }
  }
}





/* **** GRID(?) DISPLAY STUFF **** */

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

function drawPath(arr, bell, x, parent, yinc) {
  let g = drawElement("group", [parent, {style: "stroke:"+bell.color+"; stroke-width:"+bell.weight+"; fill:none;"}]);
  let num = bell.bell;
  svg.group(parent, "placebell"+num, {style: "stroke:"+bell.color+"; stroke-width:1; fill:none;"});
  svg.group(parent, "placebelltext"+num, {style: "fill:"+bell.color+"; font-family: Arial; font-size: 8pt; text-anchor: middle;"});
  let current = arr[0].bells.indexOf(num);
  let path = "M "+(current*16+x)+" "+(yinc/2);
  for (let i = 1; i < arr.length; i++) {
    let index = arr[i].bells.indexOf(num);
    if (index === current) {
      path += " v ";
    } else if (index > current) {
      path += " l 16 ";
    } else if (index < current) {
      path += " l -16 ";
    }
    path += yinc;
    current = index;
  }
  drawElement("path", [g, path]);
}

//stage, huntbells, whether working bells should be different colors
function buildgridpaths(n,hunts,color) {
  let colors = gridcolorsets(n-hunts.length);
  let r = rounds(n);
  let i = 0;
  let arr = r.map(b => {
    let p = {
      bell: b,
      weight: hunts.includes(b) ? 1 : 2,
      color: hunts.includes(b) ? "red" : "blue"
    };
    if (color && !hunts.includes(b)) {
      p.color = colors[i];
      i++;
    }
    return p;
  });
  return arr;
}

function gridcolorsets(n) {
  let colors = ["a4e0b0", "#71d184", "#3fa654", "#007317", "teal", "lightseagreen", "#8adfef", "#6ab9ef", "#658de6", "#4c5ced", "#1a1ad6", "#000080", "indigo", "#8a2be2", "#9f7be2"];
  let order = [6,0,8,1,13,4,11,7,2,5,14,12];
  let remove = order.slice(0,15-n).sort((a,b) => b-a);
  remove.forEach(e => {
    colors.splice(e, 1);
  });
  return colors;
}

//arrange the paths to draw for gridline
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
  let i = 0;
  bb.forEach((b) => {
    if (!used.includes(b)) {
      let path = {
        bell: b,
        weight: 2,
        color: colors[i]
      };
      i++;
      paths.push(path);
      if (i === colors.length) i = 0;
    }
  });
  return paths;
}



function drawgridgrid() {
  let width = rowArray[0].bells.length*16 + 38;
  let x = 40;
  let add = adjustwidth();
  width += add;
  x += add;
  let paths = buildgridpaths(queryobj.stage, method.hunts, queryobj.gridcolors);
  //console.log(paths);
  drawgridsvg(rowArray, paths, width, x);
}

//adjust in case of displaying place notation
function adjustwidth() {
  let add = 0;
  if (queryobj.pn && queryobj.quantity != "touch") {
    let max = Math.max(...method.plainPN.filter(e => e != "x").map(e => e.length));
    if (max > 3) {
      add = (max-3)*9;
    }
  }
  return add;
}


function drawgrid(pbs) {
  let width = rowArray[0].bells.length*16 + 38;
  let x = 40;
  let add = adjustwidth();
  width += add;
  x += add;
  
  let blue;
  if (queryobj.blueBell === "auto") {
    let n = queryobj.describe ? 1 : 2;
    blue = chooseworking(n);
    blueBell = blue[0];
  } else if (queryobj.blueBell.includes("-")) {
    blue = queryobj.blueBell.split("-").map(s => Number(s));
  } else {
    blueBell = Number(queryobj.blueBell);
    //gridhandbellpair
    blue = [blueBell];
  }
  
  let paths = buildpaths2(blue);
  
  if (queryobj.describe && blueBell) {
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

//big display function
let shadebackstrokes = false;
function drawgridsvg(arr, paths, width, x) {
  let xinc = 16;
  let yinc = 20;
  if (!queryobj.numbers && !arr[0].description) {
    yinc = 12;
  }
  let height = arr.length * yinc;
  let gridwidth = (arr.some(r => r.method) || arr[0].description) ? width+500 : width+100;
  $("#container").append('<div class="grid"></div>');
  let grid = svg.svg($("div.grid:last-child"), null, null, gridwidth, height, {class: "grid", xmlns: "http://www.w3.org/2000/svg", "xmlns:xlink": "http://www.w3.org/1999/xlink"});

  if (shadebackstrokes && gridtype === "gridgrid") {
    let group = svg.group(grid, {fill: "#eeeeee"});
    for (let i = 0; i < arr.length; i+=2) {
      let y = 1+i*yinc;
      svg.rect(group, x-2, y, width-x+2, 10);
    }
  }
  
  //draw numbers
  if (queryobj.numbers) {
    drawNumbers(arr, x, grid);
  }
  //draw lines
  for (let i = 0; i < paths.length; i++) {
    drawPath(arr, paths[i], x+5, grid, yinc);
  }

  //draw place notation
  if (queryobj.pn && arr[0].rowNum < method.leadLength && queryobj.quantity != "touch") {
    let points = checkpalindrome(method.plainPN);
    let top = yinc + (yinc === 12 ? 3 : 4);
    let style = "font-family: Verdana, sans-serif; fill: #000; font-size: ";
    style += gridtype === "gridline" ? "12px;" : "8px;";
    let pngroup = svg.group(grid, {style: style});
    let i = arr[0].rowNum;
    let j = 0;
    while (i < method.leadLength && j < arr.length) {
      let pn = convertpna(method.plainPN[i]);
      let color;
      if (points && (points[0] === 0 || points[1] === method.leadLength-1)) {
        let change = points[0] === 0 ? points[1] : i === method.leadLength-1 ? method.leadLength : points[0];
        if (i > change) {
          color = {fill: "#999999"};
        }
      }
      let text = svg.text(pngroup, 5, top+j*yinc, pn);
      if (color) {
        $(text).attr(color);
      }
      i++, j++;
    }
  }
  
  //draw LH lines
  //indicate calls
  let text = svg.group(grid, {style: "font-family: Verdana, sans-serif; fill: #000; font-size: 14px;"});
  let lines = svg.group(grid, {style: "stroke: #111; stroke-width:1;"});
  svg.line(lines, x-2, yinc, width, yinc);
  let stedman = arr.find(r => r.name === "new six");
  let filtered = paths.filter(o => o.color != "red");
  if (filtered.length && !queryobj.describe && !stedman && gridtype === "gridline") {
    drawplacebells(width+20, yinc-6, filtered, arr[0].bells);
  }
  
  for (let i = 1; i < arr.length; i++) {
    let y = arr[i].rowNum * yinc;
    if (arr[i].name === "new six") {
      svg.line(lines, x-2, y, width, y);
    }
    if (arr[i].name === "leadhead" && !stedman) {
      svg.line(lines, x-2, y, width, y);
      if (filtered.length && !queryobj.describe && gridtype === "gridline") {
        drawplacebells(width+20, y-6, filtered, arr[i].bells);
      }
    }
    if (["b", "s"].includes(arr[i].type)) {
      let t = arr[i].type === "b" ? "-" : "s";
      svg.text(text, 24, y+yinc, t);
    }
    if (arr[i].method) {
      let textx = x+(stage+1)*16;
      svg.text(text, textx, y+yinc, arr[i].method);
    }
  }
  
  //add description
  if (arr[0].description) {
    drawdescript(text, x);
  }
  
}


function drawplacebells(x, y, paths, row) {
  for (let i = 0; i < paths.length; i++) {
    let num = paths[i].bell;
    let place = row.indexOf(num);
    svg.circle($("#placebell"+num), x+i*12, y-4, 6);
    svg.text($("#placebelltext"+num), x+i*12, y, places[place]);
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




/* ***** drawing staff things ***** */

function drawstaff(title) {
  $("#container").append("<h1>"+title+"</h1>");
  let width = Math.floor(window.visualViewport.width/100)*100;
  //console.log("width", width);
  let numbars;
  let numsystems;
  let lastsystem;
  //handbellpair
  let blue;
  if (queryobj.blueBell === "auto") {
    blue = chooseworking(1);
    //blue = b[0];
    blueBell = blue;
  } else if (queryobj.blueBell) {
    blue = queryobj.blueBell.split("-").map(s => Number(s));
  }
  
  //don't include rowzero in these calculations
  if (queryobj.mobile) {
    numbars = 1;
    numsystems = rowArray.length-1;
    lastsystem = 1;
  } else {
    numbars = Math.max(Math.floor(width/((numbells+2)*30)),1); //prevent numbars from being zero
    numsystems = Math.ceil((rowArray.length-1)/numbars);
    lastsystem = (rowArray.length-1)%numbars === 0 ? numbars : (rowArray.length-1)%numbars;
  }

  let start = [{rowNum: -1, bells: rowArray[0].bells},{rowNum: 0, bells: rowArray[0].bells}];
  //width doesn't need to be calculated each time!
  //but it is actually the width of the staff lines
  let w; 
  let tenor = queryobj.keysig;
  if (sharps.includes(tenor)) {
    w = 65 + sharps.indexOf(tenor)*10;
  } else if (flats.includes(tenor)) {
    w = 68 + flats.indexOf(tenor)*10;
  } else {
    w = 60;
  }
  let firstwidth = w;
  let timewidth = 0;
  if (queryobj.includeTime && queryobj.timesig) {
    timewidth += 27;
    if (queryobj.timesig.split("-").length > 2) {
      timewidth += 28;
    }
  }
  firstwidth += timewidth;
  firstwidth += numbells*30-8;
  let first = true;
  if (queryobj.mobile || numbars === 1) {
    //starting leadhead handstroke
    drawstaffsvg([start[0]], firstwidth+5, true, false, blue);
    firstwidth -= timewidth;
    first = false;
    start.shift();
  } else {
    firstwidth += numbells*30 + 10;
  }
  let lastwidth = w + (numbells*30-8)*lastsystem + (lastsystem-1)*18;
  w += (numbells*30-8)*numbars + (numbars-1)*18;
  let w2 = w;
  if (queryobj.gap) {
    firstwidth += 30;
    w += Math.floor(numbars/2)*30;
    w2 += Math.ceil(numbars/2)*30;
    if (lastsystem%2 === 0) {
      lastwidth += lastsystem/2 * 30;
    } else {
      let last = rowArray.slice(-lastsystem).map(o => o.rowNum).filter(n => n%2 === 0);
      lastwidth += last.length * 30;
    }
  }
  //draw starting leadhead as own system - hand and back, or just back if hand has already been drawn
  drawstaffsvg(start, firstwidth+5, first, false, blue);

  //console.log("numsystems");
  //console.log(numsystems);
  //if numbars is odd and there's a handstroke gap, width alternates
  for (let i = 0; i < numsystems; i++) {
    let sw = i === numsystems-1 ? lastwidth : i%2 === 0 ? w : w2;
    drawstaffsvg(rowArray.slice(i*numbars+1, (i+1)*numbars+1), sw+5, false, i === numsystems-1, blue);
  }
}


function drawstaffsvg(arr, width, first, last, blue) {
  let system = svg.svg($("#container"), null, null, width, 120, {class: "staff", xmlns: "http://www.w3.org/2000/svg", "xmlns:xlink": "http://www.w3.org/1999/xlink"});
  let clef = svg.group(system, {style: "stroke:black; stroke-width:1; fill:black;"});
  //build clef
  svg.circle(clef, 15, 80, 3);
  svg.path(clef, "M12,80 a 5 5 0 0 0 11 0 l -5 -50", {fill: "none"});
  svg.path(clef, "M 18 30 c -1 -8, -1 -12, 5 -18 l 2 4 c -5 6, -7 6, -7 14 m 7 -14 c 1 2.5, 5 20, -5 26 c -14 9, -12 26, 1 28 c -19 0, -16 -27, -2 -33 c 11 -9, 5 -18.5, 6 -21 m -4 53 a 8 8 0 1 0 -5 -4 a 10 10 0 1 1 5 4");
  //build staff lines
  let staff = svg.group(system, {style: "stroke:black; stroke-width:1; fill:none;"});
  for (let i = 0; i < 5; i++) {
    let y = i*10+30;
    svg.line(staff, 2, y, width-5, y);
  }
  let startx = drawkey(queryobj.keysig, system);
  if (first && queryobj.includeTime && queryobj.timesig) {
    startx = drawtime(queryobj.timesig, system, startx);
  }
  let barends = drawnotes(arr, system, startx, blue);
  //draw barlines
  for (let i = 0; i < barends.length; i++) {
    if (last && i === barends.length-1) {
      svg.path(clef, "M "+(barends[i]+1)+" 29.5 v 41", {"stroke-width": 3});
      svg.path(clef, "M "+(barends[i]-3)+" 30 v 40");
    } else {
      svg.path(clef, "M "+barends[i]+" 30 v 40");
    }
  }
  //draw bar number
  svg.text(system, 2, 10, arr[0].rowNum.toString(), {style: "font-family:Verdana; font-size:10px;"});
}

function drawkey(tenor, system) {
  let type;
  let g = svg.group(system, {style: "stroke:black; stroke-width:1; fill:black;"});
  let startx;

  if (sharps.indexOf(tenor) > -1) {
    type = 's';
  } else if (flats.indexOf(tenor) > -1) {
    type = 'f';
  } else if (tenor === "C") {
    startx = 60;
  }

  if (type === 's') {
    startx = 65 + sharps.indexOf(tenor)*10;
    for (let i = 0; i < sharps.indexOf(tenor)+1; i++) {
      let path = ["M", 40+i*10, sharpy[i], "v 24 m 4 -25 v 24 m -6 -14 l 8 -3 v -2 l -8 3 m 0 12 l 8 -3 v -2 l -8 3"];
      svg.path(g, path.join(" "));
    }
  } else if (type === "f") {
    startx = 68 + flats.indexOf(tenor)*10;
    for (let i = 0; i < flats.indexOf(tenor)+1; i++) {
      let y = i*2.5 + 32.5 + (i%2)*-17.5;
      let path = ["M", 40+i*10, y, "v 23.5 m 0 -10 c 6 -4 10 0 5 6 l -5 4 c 6 -4 6 -13 0 -10"];
      svg.path(g, path.join(" "));
    }
  }
  return startx;
}

function drawtime(timesig, system, startx) {
  let nums = timesig.split("-");
  let plus = ['5','8','9'];
  let g = svg.group(system, {style: "font-family:Helsinki; fill:black; font-size:35px; text-anchor:middle;"});

  for (let i = 0; i < nums.length; i++) {
    let x = i < 2 ? startx-1 : startx+29;
    if (plus.indexOf(nums[i]) > -1) x++;
    let y = 40 + (i%2)*20;
    svg.text(g, x, y, nums[i]);
  }
  
  startx += 27;
  if (nums.length > 2) {
    startx += 28;
  }
  return startx;
}

function quarterrest(parent, x) {
  svg.path(parent, "M "+x+" 35 l 6 8 c -4 7 -4 7 2 15 l -10 -11 c 6 -7 5 -7 2 -12 m 8 23 a 4.0311 5 -55 0 0 -4 7 a 4.032 5 -52 0 1 0 -11");
}

function quarternote(parents, cx, cy) {
  svg.ellipse(parents.noteheads, cx, cy, 6, 4, {transform: "rotate(-35 "+cx+" "+cy+")"});
  //stem
  let stemx, stemdir;
  if (cy <= 50) {
    stemx = cx-5;
    stemdir = 'v 35';
  } else {
    stemx = cx+5;
    stemdir = 'v -35';
  }
  if (cy == 10 || cy >= 90) {
    stemdir = 'V 50';
  }
  svg.path(parents.stems, ["M", stemx, cy, stemdir].join(" "));
  //ledger lines
  if (cy >= 80) {
    for (let k = 80; k <= cy; k += 10) {
      svg.path(parents.ledgers, ["M", cx-11, k, "h 22"].join(" "));
    }
  } else if (cy <= 80) {
    for (let k = 20; k >= cy; k -= 10) {
      svg.path(parents.ledgers, ["M", cx-11, k, "h 22"].join(" "));
    }
  }
}

//returns array of x-coordinates for barlines
function drawnotes(rows, system, startx, blue) {
  let actTenor = queryobj.actTenor;
  //set y coord of tenor
  let tenY = 90 - (actTenor.charCodeAt(0)-65)*5;
  if (["A", "B"].includes(actTenor[0]) && numbells < 9) {
    if (!actTenor.includes("P") || numbells < 7) {
      //move it an octave up to avoid ledger lines
      tenY -= 35;
    }
  }
  let y;
  let barends = [];

  if (actTenor.indexOf('P') > -1) {
    let ys = dyPenta.slice(0, numbells).map(x => tenY-x).reverse();
    y = function (bell) {
      return ys[bell-1];
    };
  } else {
    let b = tenY - numbells*5;
    y = function (bell) {
      return 5*bell + b;
    };
  }

  let noteheads = svg.group(system, {style: "stroke:black; stroke-width:1; fill:black;"});
  let stems = svg.group(system, {style: "stroke:black; stroke-width:1.5; fill:none;"});
  let ledgers = svg.group(system, {style: "stroke:black; stroke-width:1.2; fill:none;"});
  //group to hold grey rests in case of onlyblue
  let fade = svg.group(system, {style: "stroke:grey; stroke-width:1; fill:grey;"});
  let barend;
  let groups = {
    noteheads: noteheads,
    stems: stems,
    ledgers: ledgers
  };
  let keys = {
    noteheads: 1,
    stems: 1.5,
    ledgers: 1.2
  };
  let bgroups = {};
  let ggroups = {};
  //handbellpair
  for (let key in keys) {
    let fill = key === "noteheads" ? "blue;" : "none;";
    let gfill = fill === "blue;" ? "green;" : "none;";
    bgroups[key] = svg.group(system, {style: "stroke:blue; stroke-width:"+keys[key]+"; fill:"+fill});
    ggroups[key] = svg.group(system, {style: "stroke:green; stroke-width:"+keys[key]+"; fill:"+gfill});
  }

  for (let i = 0; i < rows.length; i++) {
    /*
    if (blue && queryobj.onlyblue) {
      //combine rests
      let j = rows[i].bells.indexOf(blue);
      let cx = startx + j*30;
      let cy = y(blue);
      quarternote(groups, cx, cy);
      let x = startx;
      let before = j;
      while (before >= 4) {
        //starting y is probably wrong...
        svg.path(groups.noteheads, "M "+x+" 55 h 12 v 4 h -12 v -4");
        x += 30*3;
        before -= 4;
      }
    } else {
    */
      for (let j = 0; j < numbells; j++) {
        let current = rows[i].bells[j];
        //if the current bell is highlighted, make it blue
        //if only the current bell is being shown, just make it black
        let gg;
        if (blue && blue.length === 2) {
          gg = current === blue[0] ? bgroups : current === blue[1] ? ggroups : groups;
        } else {
          gg = (blue && blue.includes(current) && !queryobj.onlyblue) ? bgroups : groups;
        }
        let drawnote = (blue && queryobj.onlyblue) ? blue.includes(current) : true;
        
        if (drawnote) {
          let cx = startx + j*30;
          let cy = y(current);
          quarternote(gg, cx, cy);
          
        } else {
          let x = startx + j*30 - 4;
          //wait this should only ever be fade
          let p = (blue && queryobj.onlyblue) ? fade : noteheads; 
          quarterrest(p, x);
        }
        
      }
    //}
    if (queryobj.gap && rows[i].rowNum%2 === 0) {
      let x = startx + numbells*30 -4;
      quarterrest(noteheads, x);
      barend = startx+numbells*30+22;
    } else {
      barend = startx+numbells*30-8;
    }
    barends.push(barend);
    startx = barend+18;
  }
  return barends;

}






/* ***** BELLRINGING FUNCTIONS ***** */

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
function rowstring(row) {
  let str = row.map(n => places[n-1]).join("");
  return str;
}

function getLH(pn, pnstage) {
  let start = rounds(pnstage);
  let lead = buildRows(start, pn, 1);
  let last = lead[lead.length-1].bells;
  return last;
}

//given pn find hunt bells
function findhunts(pn, pnstage) {
  let last = getLH(pn, pnstage);
  let hunts = [];
  for (let i = 0; i < pnstage; i++) {
    if (last[i] === i+1) {
      hunts.push(i+1);
    }
  }
  return hunts;
}

//if the title ends with a stagename, remove that
function splittitle(title) {
  let res = {};
  let words = title.split(" ");
  let last = words.pop();
  let stagename;
  if (stages.find(o => o.name === last)) {
    stagename = last;
  }
  return stagename ? words.join(" ") : title;
}

function buildpborder(pn, pnstage) {
  let pborder = [];
  let lh = getLH(pn, pnstage);
  let working = lh.filter((n,i) => n != i+1);
  let pbs = [];
  let working2 = working;
  while (working2.length > 0) {
    pbs.push(working2.shift());
    let last = pbs[pbs.length-1];
    let next = lh.indexOf(last)+1;
    do {
      pbs.push(next);
      let i = working2.indexOf(next);
      working2.splice(i, 1);
      last = next;
      next = lh.indexOf(last)+1;
    } while (!pbs.includes(next));

    pborder.push(pbs);
    pbs = [];
  }
  return pborder;
}

//build plain bob course order
//does not include tenor
function homecourseorder(stage) {
  let home = [];
  for (let b = 2; b < stage; b+=2) {
    home.push(b);
    if (b < stage-1) home.unshift(b+1);
  }
  return home;
}

//categorize tokens in supposed place notation
function pnlexer(pn, pnstage) {
  let stagepp = places.slice(0,pnstage);
  let tokens = [];
  let err;
  
  for (let i = 0; i < pn.length; i++) {
    let token = {
      value: pn[i]
    };
    switch (pn[i]) {
      case "&": case ",": case "+":
        token.type = "grouping token";
        break;
      case ".":
        token.type = "separator";
        break;
      case "x": case "-":
        token.value = "x";
        token.type = "all change";
        break;
      default:
        if (stagepp.includes(pn[i])) token.type = "number";
    }
    if (token.type) {
      tokens.push(token);
    } else {
      err = "invalid character";
    }
  }
  
  return [err, tokens];
}

function pnNumJoin(tokens) {
  let arrnj = [];
  let prevtype = "all change";
  let prev = "x";
  let err;

  //add tokens except separator to new array; if consecutive numbers combine them
  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i].type;
    if (t === "number" && prevtype === "number") {
      let diff = places.indexOf(tokens[i].value) - places.indexOf(prev);
      if (arrnj[arrnj.length-1].value.includes(tokens[i].value)) {
        err = "repeated place????";
      } else if (places.indexOf(tokens[i].value) < places.indexOf(prev)) {
        err = "numbers out of order";
      } else if (diff > 2 && diff%2 === 0) {
        err = "missing internal place?";
      }
      arrnj[arrnj.length-1].value += tokens[i].value;
      prev = tokens[i].value;
    } else if (t === "separator") {
      prevtype = "separator";
      prev = ".";
    } else {
      arrnj.push(tokens[i]);
      prevtype = t;
      prev = tokens[i].value;
    }
  }

  return [err, arrnj];
}

function pnNumAbbr(tokens, pnstage) {
  //do stuff with the objects of type 'number'
  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i];
    if (t.type === "number") {
      //turn value string into array of characters, convert strings in array to numbers
      let numArr = t.value.split("").map(n => places.indexOf(n)+1);

      //odd AND even bell methods:
        //if the value begins with an even number, add 1 to beginning
      if (numArr[0] % 2 === 0) {
        numArr.unshift(1);
      }
        //if consecutive places only have one place between, add that place
      if (numArr.length > 1) {
        for (let j = numArr.length-2; j > -1; j--) {
          if (numArr[j+1] - numArr[j] === 2) {
            numArr.splice(j+1, 0, numArr[j]+1);
          }
        }
      }
      
      //if the value ends with the opposite quality from the stage, add stage to end
      if (stage%2 != numArr[numArr.length-1] % 2) {
        numArr.push(pnstage);
      }
      t.value = numArr;
    }
  }
}


function pngrouping(tokens) {
  let groupingString = tokens.filter(t => t.type === "grouping token").map(t => t.value).join("");

  if (!["","+"].includes(groupingString)) {
    let groupingTokens = [];
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "grouping token") {
        groupingTokens.push({index: i, token: tokens[i].value});
      }
    }
    let mirrorStart;
    let mirrorEnd = 0;
    let insertIndex;
    let numToReplace;
    let toBeReversed;
    switch (groupingString) {
      case ",":
        let greater = groupingTokens[0].index > 1;

        mirrorStart = greater ? 0 : 2;
        mirrorEnd = greater ? groupingTokens[0].index-1 : tokens.length-1;
        insertIndex = greater ? groupingTokens[0].index+1 : tokens.length;
        break;
      case "&,": case "&,+":
        mirrorStart = groupingTokens[0].index+1;
        mirrorEnd = groupingTokens[1].index-1;
        insertIndex = mirrorEnd+2;
        break;
      case "+,": case "+,&":
        let j = groupingString === "+," ? 1 : 2;
        mirrorStart = groupingTokens[j].index+1;
        mirrorEnd = tokens.length - 1;
        insertIndex = tokens.length;
        break;
    }

    if (mirrorEnd === 0) {
      toBeReversed = tokens.slice(mirrorStart);
    } else {
      toBeReversed = tokens.slice(mirrorStart, mirrorEnd);
    }

    toBeReversed.reverse();

    for (let j = 0; j < toBeReversed.length; j++) {
      tokens.splice(insertIndex+j, 0, toBeReversed[j]);
    }
  }
}

function parsePN(pn, pnstage) {
  let res = pnlexer(pn, pnstage);

  if (res[0]) {
    return res;
  } else {
    res = pnNumJoin(res[1]);
    if (res[0]) {
      return res;
    } else {
      let tokens = res[1];
      pnNumAbbr(tokens, pnstage);
      pngrouping(tokens);
      return [null, tokens.filter(t => t.type !== "grouping token").map(t => t.value)];
    }
  }
}

//take my processed pn and make a string
function pnstring(pn) {
  let str = "";
  let nums;
  pn.forEach(e => {
    if (e === "x") {
      str += "-";
      nums = false;
    } else {
      if (nums) str += ".";
      str += rowstring(e);
      nums = true;
    }
  });
  return str;
}

//take a change of place notation and return it in string form
function convertpna(e) {
  return e === "x" ? e : rowstring(e);
}

function checkpalindrome(pn) {
  let strarr = pn.map(e => convertpna(e));
  let count = 0;
  let symmetrical;
  let mod = pn.length;
  let point = pn.length-1;
  let other = point - Math.floor(mod/2);
  while (!symmetrical && count < pn.length-1) {
    let ii = [];
    let jj = [];
    for (let i = 1; i <= Math.ceil(mod/2)-1; i++) {
      ii.push((point-i)%mod);
      jj.push((point+i)%mod);
    }
    symmetrical = ii.every((n,i) => strarr[n] === strarr[jj[i]]);
    point--;
    other--;
    count++;
  }
  let points = [other+1, point+1];
  return symmetrical ? points : null;
}

function findbypn(pn, pnstage) {
  let pnstr = pnstring(pn);
  let possible = bigmethodarr.filter(m => m.stage === pnstage && m.leadLength === pn.length);
  let match = possible.find(m => pnstring(m.plainPN) === pnstr);
  return match;
}

//choose one or more working bells to display lines for
//n will be 1 if description is being shown, otherwise 2
//allows one working bell from each cycle if there is more than one working cycle
//attempts to choose palindromic bell
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
  let roundstr = rowstring(start);
  rowArray = [{rowNum: 0, bells: start}];
  let lastrow = rounds(stage);
  let laststr;
  let lead;
  let num = 1;
  do {
    lead = buildRows(lastrow, pn, num);
    lead.forEach(o => rowArray.push(o));
    lastrow = rowArray[rowArray.length-1].bells;
    laststr = rowstring(lastrow);
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
