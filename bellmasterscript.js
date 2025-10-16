var numbells = 6;
var soundurl = "sounds/"; //need to get this
//objects with bell sound info (eventually)
var bells = [{bell: "F4"},{bell: "G4"},{bell: "A4"},{bell: "Bf4"},{bell: "C5"},{bell: "D5"},{bell: "E5"},{bell: "F5"}];
//,{bell: "G5"},{bell: "A5"},{bell: "Bf5"},{bell: "C6"}
//length of bell rope animation
var duration = 1.3;
//assigned bell
var mybell = 3;
//which stroke
var mystroke = 1;
var myrow = 0;
//which game level
var level = 0;
//holders
var audioCtx;
var gainNode;
var svg;
var instructions;
var rowArr = [];

//time for one row
var speed = 2.3;
var delay = speed/numbells;

let lookahead = 5.0;
let schedule = 0.02;

//state of ringing
var rownum = 0;
var place = 0;
var stroke = 1;
var playing = false;
var thatsall = false;

var nextBellTime = 0.0;
var mynexttime = 0.0;
var myqueue = [];
var timeout;

var callqueue = [];
var placequeue = [];
var soundqueue = [];
var lastplace = -1;
var soundplace;
var waitgaps;
var waiting = false;
var lastcall;
var lastcallrow;
var roundscount = 0;
var stoprounds = 1;
var numrounds = 0;
var ringtiming;
var feedback = true;
var displayplace = false;
var diffs = [];
var keepgoing = false;

for (let i = 0; i < bells.length; i++) {
  bells[i].type = "tower";
  bells[i].url = soundurl + bells[i].bell + ".wav";
}

$("#startbutton").hide();

$(function() {
  console.log("hello world :o");
  $("body").svg({onLoad: (o) => {
    svg = o;
  }});
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  gainNode = audioCtx.createGain();
  gainNode.gain.value = 0.75;
  setupSample(0);
  setupRopes(numbells);
  $.getJSON("levels.js", function(data) {
    instructions = data;
    console.log(instructions.length);
  }).fail(function( jqxhr, textStatus, error ) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
  });
  
  positionmarkers();
  
  $("#startbutton").on("click", function() {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    $("#beginning").hide();
    $("#container").show();
  });
  
  $("#nextbutton").on("click", function() {
    level++;
    if (instructions[level]) levelup();
  });
});








async function getFile(audioContext, filepath) {
  try {
    const response = await fetch(filepath);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
  } catch (error) {
    console.error(error.message);
  }
}

async function setupSample(i) {
  let arrayBuffer = await getFile(audioCtx, bells[i].url);
  if (arrayBuffer) {
    audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
      bells[i].buffer = buffer;
      if (i < bells.length-1) {
        i++;
        setupSample(i);
      } else {
        $("#startbutton").show();
        console.log("finished setting up");
      }
    }, (e) => { console.log(e) });
  }
}

var listeners = [
  //{id: "hand15b", event: "endEvent", f: endpull},
  //{id: "back14b", event: "endEvent", f: endpull},
  {id: "sally", event: "mouseover", f: pointer},
  {id: "sally", event: "click", f: triggerpull},
  {id: "tail", event: "mouseover", f: pointer},
  {id: "tail", event: "click", f: triggerpull},
  {id: "hand", event: "touchstart", f: triggerpull},
  {id: "back", event: "touchstart", f: triggerpull},
  {id: "hand", event: "touchend", f: prevent},
  {id: "back", event: "touchend", f: prevent},
  {id: "hand15b", event: "endEvent", f: hidefeedback},
  {id: "back14b", event: "endEvent", f: hidefeedback}
];

//also setup very beginning
function setupRopes(n) {
  let start = 3;
  
  for (let i = 0; i < n; i++) {
    let num = start + i;
    if (num > n) num -= n;
    let j = n - num;
    
    bells[j].num = num;
    bells[j].stroke = 1;
    addrope(bells[j]);
    position(i,num);
    
    let handstroke = document.getElementById("hand8b"+num);
    handstroke.addEventListener("beginEvent", ring);
    let backstroke = document.getElementById("back11b"+num);
    backstroke.addEventListener("beginEvent", ring);
    document.getElementById("hand15b"+num).addEventListener("endEvent", endpull);
    document.getElementById("back14b"+num).addEventListener("endEvent", endpull);
    
  }
  listeners.forEach(o => {
    document.getElementById(o.id+"3").addEventListener(o.event, o.f);
  });
  $("body").on("keydown", function(e) {
    if (e.key === "j") {
      pull(mybell);
    }
  });
  $("#chute3 > .bellnum").detach();
  $("#bells").append('<span id="mybellnum">3</span>', '<div id="callcontainer"></div>', '<div id="instruct"></div>', '<div id="feedback"></div>');
  $("#instructions p").text('Welcome to bell master! Ring the number 3 bell by clicking on the sally (the colorful part), then on the tail (the looped part at the bottom of the rope), OR hitting the "j" key on your keyboard.');
}


function stagechange(n) {
  let start = mybell;
  
  bells.forEach(b => {
    delete b.num;
  });
  $(".chute").remove();
  
  for (let i = 0; i < n; i++) {
    let num = start + i;
    if (num > n) num -= n;
    let j = n - num;
    
    bells[j].num = num;
    bells[j].stroke = 1;
    addrope(bells[j]);
    position(i,num);
    
    let handstroke = document.getElementById("hand8b"+num);
    handstroke.addEventListener("beginEvent", ring);
    let backstroke = document.getElementById("back11b"+num);
    backstroke.addEventListener("beginEvent", ring);
    document.getElementById("hand15b"+num).addEventListener("endEvent", endpull);
    document.getElementById("back14b"+num).addEventListener("endEvent", endpull);
  }
  
  numbells = n;
  delay = speed/numbells;
}

//assign bell to user
function assign(n) {
  listeners.forEach(o => {
    if (document.getElementById(o.id+mybell)) document.getElementById(o.id+mybell).removeEventListener(o.event, o.f);
    document.getElementById(o.id+n).addEventListener(o.event, o.f);
  });
  $("#chute"+mybell).prepend('<span class="bellnum">'+mybell+'</span>');
  for (let i = 0; i < numbells; i++) {
    let num = n+i;
    if (num > numbells) num -= numbells;
    position(i, num);
  }
  $("#chute"+n+" > .bellnum").detach();
  $("#mybellnum").text(n);
  mybell = n;
}

function buildrows(o) {
  let rz = o.rowzero;
  let pn = o.placenotation;
  let arr = [{row: []}, {row: []}];
  if (o.stoprounds) {
    stoprounds = o.stoprounds;
  }
  if (o.numrounds) {
    numrounds = o.numrounds;
    for (let i = 2; i < o.numrounds; i++) {
      arr.push({row: []});
    }
  }
  arr.forEach(r => {
    for (let i = 0; i < numbells; i++) {
      r.row.push([rz[i][0]]);
    }
  });
  if (o.firstcall) {
    arr[arr.length-2].call = o.firstcall;
  }
  let row = rz;
  let l = 0;
  do {
    for (let i = 0; i < pn.length; i++) {
      let next = [];
      let dir = 1;
      for (let p = 0; p < numbells; p++) {
        if (pn[i] === "x" || !pn[i].includes(p+1)) {
          next.push([row[p+dir][0]]);
          dir *= -1;
        } else {
          next.push([row[p][0]]);
        }
      }
      arr.push({row: next});
      row = next;
      //console.log(next);
    }
    l++;
  } while (!arr[arr.length-1].row.every((a,i) => a[0] === i+1) && l < 12);
  rowArr = arr;
}

//really for changing level in any direction
function levelup() {
  $("h3").text("Level "+level);
  if (!instructions[level+1]) {
    $("#nextbutton").addClass("disabled");
  } else {
    $("#nextbutton").removeClass("disabled");
  }
  let o = instructions[level];
  if (o.numbells && o.numbells != numbells) {
    stagechange(o.numbells);
    assign(o.mybell || mybell);
  } else if (o.mybell && o.mybell != mybell) {
    assign(o.mybell);
  }
  if (o.rowArr) {
    rowArr = o.rowArr;
  }
  if (o.button) { //this is actually just when getting to level 1...
    if ($("#displayfeedback").length) {
      $('label[for="displayfeedback"]').remove();
    } else {
      $("#nextbutton").detach();
      $("#buttons").prepend(...o.button);
      $("#okbutton").on("click", function() {
        if (!playing) {
          if (mystroke === -1) {
            $("#callcontainer").text("Your bell is set at backstroke! Ring it once to set it at handstroke before beginning.");
          } else {
            $("#okbutton").addClass("disabled");
            $("#stopbutton").removeClass("disabled");
            treblesgoing();
          }
          
        }
      });
      $("#stopbutton").on("click", function() {
        if (playing) {
          thatisall();
        }
      });
      $("#backbutton").on("click", function() {
        level--;
        if (instructions[level]) {
          if (level === 0) {
            $("#backbutton,#okbutton,#stopbutton").detach();
          }
          levelup();
        }
      });
      $("#nextbutton").on("click", function() {
        if (level === 1) resetsoundline();
        level++;
        if (instructions[level]) levelup();
      });
    }
    
  }
  if (level === 2 && !$("#displayfeedback").length) {
    $("#instructions p").after('<label for="displayfeedback"><input type="checkbox" id="displayfeedback" name="displayfeedback" checked />show feedback</label>');
    $("#displayfeedback").on("click", function() {
      feedback = $("#displayfeedback").prop("checked");
      if (!feedback) {
        $("#visuals").hide();
      } else {
        $("#visuals").show();
      }
    });
  }
  if (level === 12 && !$("#displayplace").length) {
    $("#instructions p").after('<label for="displayplace"><input type="checkbox" id="displayplace" name="displayplace" />display the place to ring in in real time</label>');
    $("#displayplace").on("click", function() {
      displayplace = $("#displayplace").prop("checked");
    });
  }
  if (o.rowzero) {
    buildrows(o);
  }
  $("#instructions p").text(o.instructions);
}






function pointer(e) {
  let num = this.id.startsWith("sally") ? Number(this.id.slice(5)) : Number(this.id.slice(4));
  let bell = bells.find(b => b.num === num);
  if ((this.id.startsWith("sally") && bell.stroke === 1) || (this.id.startsWith("tail") && bell.stroke === -1)) {
    this.style.cursor = "pointer";
  } else {
    this.style.cursor = "auto";
  }
}

function prevent(e) {
  e.preventDefault();
}

function findplace(rn) {
  let p;
  if (rowArr[rn]) {
    p = rowArr[rn].row.findIndex(a => a[0] === mybell);
  }
  return p;
}




function treblesgoing() {
  //console.log("starting play");
  playing = true;
  nextBellTime = audioCtx.currentTime;
  
  if (level === 1) {
    resetsoundline();
  }
  
  if (rownum === 0 && mybell === 1) {
    waiting = true;
    requestAnimationFrame(animate);
  } else {
    waiting = false;
    mynexttime = audioCtx.currentTime + (mybell-1)*delay;
    if (rownum === 0) {
      place = -2, mynexttime += 2*delay;
      myqueue = [{stroke: 1, time: mynexttime, place: mybell-1, rownum: 0},{stroke: -1, time: mynexttime+speed-.23*duration, place: mybell-1, rownum: 1}];
    }
    scheduler();
    requestAnimationFrame(animate);
  }
}

function nextPlace() {
  nextBellTime += delay;
  place++;
  
  if (place === numbells) {
    //console.log("finished with row "+rownum);
    if (stroke === -1) {
      soundqueue.push({place: numbells, rownum: rownum, time: nextBellTime + .23*duration + 8*duration/21});
      nextBellTime += delay + .23*duration; //add handstroke gap
    }
    if (stroke === 1) nextBellTime -= .23*duration;
    place = 0;
    stroke *= -1;
    rownum++;
    let call = rownum < rowArr.length && rowArr[rownum].call ? rowArr[rownum].call : " ";
    
    if (rowArr[rownum+1] || [1,2,3].includes(level) || roundscount < stoprounds) {
      let p1 = [1,2,3].includes(level) ? mybell-1 : rowArr[rownum] ? findplace(rownum) : findplace(numrounds);
      let p2 = [1,2,3].includes(level) ? mybell-1 : rowArr[rownum+1] ? findplace(rownum+1) : rowArr[rownum] ? findplace(numrounds) : findplace(numrounds+1);
      let diff = p2 - p1;
      let time = myqueue[myqueue.length-1].time + speed + diff*delay - stroke*.23*duration;
      if (stroke === -1) time += delay;
      myqueue.push({stroke: stroke*-1, time: time, place: p2, rownum: stroke === 1 ? 1 : 0});
    }
    
    if (rownum === rowArr.length-2) {
      roundscount++;
      if (roundscount === stoprounds) {
        thatsall = true;
        call = "Stand";
      }
    }
    
    if (rownum === rowArr.length-1 && level === 1) {
      thatsall = true;
    }
    
    
    if (rownum === rowArr.length) {
      
      if (!thatsall) {
        if ([1,2,3].includes(level) && !keepgoing) {
          roundscount++;
          if (roundscount === 3) {
            thatsall = true;
            call = "Stand";
          }
        }
        rownum = numrounds;
        console.log(rownum);
        rowArr.forEach(o => {
          o.row.forEach(a => {
            a[1] = false;
          });
        });
      } else {
        call = "thatsall";
      }
    }
    
    callqueue.push({call: call, time: nextBellTime + delay, rownum: rowArr.length*roundscount + rownum});
    
  }
}


function scheduleRing(p, t) {
  if (p > -1) {
    let num = rowArr[rownum].row[p];
    let bell = num && num.length && num[0] != mybell;
    
    if (bell) {
      pull(num[0],t);
    }
    if (bell || (p === 0 && rownum%2 === 0)) {
      soundqueue.push({place: p, rownum: rownum, time: t+(stroke === 1 ? 8 : 13)*duration/21});
    }
    if (rownum === 0 && p === 0 && roundscount === 0) {
      callqueue.push({call: "", time: t, rownum: rownum});
    }
    
    
    if (!bell && waitgaps && (!num || !num[1])) {
      waiting = t;
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
  while (nextBellTime < audioCtx.currentTime + schedule && rowArr[rownum] && !waiting) {
    scheduleRing(place, nextBellTime);
  }
  !waiting && rowArr[rownum] ? timeout = setTimeout(scheduler, lookahead): clearTimeout(timeout);
}

function animate() {
  let currentTime = audioCtx.currentTime;
  let call = lastcall;
  let callrow = lastcallrow;
  let soundmark = soundplace;
  
  while (callqueue.length && callqueue[0].time < currentTime) {
    call = callqueue[0].call;
    callrow = callqueue[0].rownum;
    callqueue.shift();
  }
  if ((call != lastcall || callrow != lastcallrow) && call != "thatsall") {
    $("#callcontainer").text(call);
    lastcall = call;
    lastcallrow = callrow;
  }
  if (call === "thatsall") {
    thatisall();
  }
  if (myqueue[0] && myqueue[0].early && myqueue[0].time < currentTime) {
    myqueue.shift();
  }
  
  //this part is about the visualization
  while (soundqueue[0] && soundqueue[0].time < currentTime) {
    soundmark = soundqueue[0].place + (soundqueue[0].rownum%2 === 1 ? numbells+1 : 1);
    if (soundqueue[0].mybell) {
      $(".sound.marker:nth-child("+soundmark+")").addClass("mymarker");
      let left = ($(".sound.marker:nth-child("+soundmark+")").css("left"));
      left = Number(left.slice(0,-2));
      let d = 60*soundqueue[0].diff/delay;
      //console.log(left-d);
      $(".sound.marker:nth-child("+soundmark+")").css("left", (left-d)+"px");
    }
    soundqueue.shift();
  }
  if (soundmark != soundplace) {
    if (soundmark > numbells*2 && level > 1) {
      resetsoundline();
    } else if (soundmark <= numbells*2) {
      $(".sound.marker:nth-child("+soundmark+")").css("display", "block");
    }
    soundplace = soundmark;
  }
  if (soundmark === 1) {
    $("#sound-line").css("width", "660px");
  }
  
  requestAnimationFrame(animate);
  
}




//actual ringing
function triggerpull(e) {
  let n = this.id.startsWith("sally") ? Number(this.id.slice(5)) : Number(this.id.slice(4));
  let bell = bells.find(b => b.num === n);
  if ((bell.stroke === 1 && (this.id.startsWith("sally") || this.id.startsWith("hand"))) || (bell.stroke === -1 && (this.id.startsWith("tail") || this.id.startsWith("back")))) {
    pull(n);
  }
}

function pull(n, t) {
  let bell = bells.find(b => b.num === n);
  let now = audioCtx.currentTime;
  let rn = myrow+1;
  if (!bell.ringing) {
    let id = (bell.stroke === 1 ? "hand1b" : "back0b") + n;
    bell.ringing = true;
    bell.stroke *= -1;
    if (n === mybell) {
      mystroke = bell.stroke;
      if (!playing) $("#callcontainer").text("");
    }
    t ? document.getElementById(id).beginElementAt(t-audioCtx.currentTime) : document.getElementById(id).beginElement();
    
    
    let row = rowArr[myrow];
    if (row && mybell === n && playing) {
      
      if (mybell === 1 && waiting && rownum === 0) {
        myqueue = [{stroke: -1, time: now+speed-.23*duration, place: 0}];
        //make the sound line start!
      } else if (myqueue.length && feedback) {
        //console.log(myqueue[0]);
        let diff = myqueue[0].time - now;
        diffs.push(diff);
        if (diffs.length > 3 && diffs.slice(diffs.length-4).some(d => Math.abs(d) > .1)) {
          //keepgoing = true;
        } else {
          keepgoing = false;
        }
        soundqueue.push({time: now+(bell.stroke === -1 ? 8 : 13)*duration/21, place: myqueue[0].place, mybell: true, rownum: myqueue[0].rownum, diff: diff});
        if (Math.abs(diff) < .1) {
          ringtiming = "Good!";
          myqueue.shift();
        } else if (diff > 0) {
          ringtiming = "Early";
          myqueue[0].early = true;
        } else {
          ringtiming = "Late";
          myqueue.shift();
        }
        $("#feedback").text(ringtiming);
        $("#feedback").css("opacity", "1");
        //console.log(ringtiming);
      }
      let i = row.row.findIndex(a => a[0] === n);
      if (!row.row[i][1] && ((myrow%2 === 0 && bell.stroke === -1) || (myrow%2 === 1 && bell.stroke === 1))) {
        row.row[i][1] = true;
      } else if (rowArr[myrow+1] && ((myrow%2 === 0 && bell.stroke === 1) || (myrow%2 === 1 && bell.stroke === -1))) {
        let j = rowArr[myrow+1].row.findIndex(a => a[0] === n);
        if (j > -1 && !rowArr[myrow+1].row[j][1]) {
          rowArr[myrow+1].row[j][1] = true;
          rn += 1;
        }
      }
      if (displayplace) {
        if (rn === rowArr.length) rn = numrounds;
        console.log(rn);
        let p = findplace(rn);
        let text;
        switch (p) {
          case undefined:
            text = "???";
            break;
          case 0:
            text = "Lead";
            break;
          case 1:
            text = "2nd";
            break;
          case 2:
            text = "3rd";
            break;
          default:
            text = (p+1)+"th";
        }
        text += `<br/>` + (rn % 2 === 0 ? "handstroke" : "backstroke");
        $("#instruct").html(text);
      }
      myrow++;
      if (myrow === rowArr.length) myrow = numrounds;
    }
  }
  if (waiting) {
    waiting = false;
    nextBellTime = Math.max(audioCtx.currentTime, nextBellTime);
    scheduler();
  }
}




function positionmarkers() {
  let left = -8;
  for (let i = 1; i <= numbells; i++) {
    $(".sound.marker:nth-child("+i+")").css("left", left+"px");
    $(".sound.marker:nth-child("+(i+numbells)+")").css("left", (left+360)+"px");
    left += 360/numbells;
  }
}

function hidefeedback(e) {
  $("#feedback").css("opacity","0");
}

function endpull(e) {
  let bellnum = Number(this.id.slice(7));
  let bell = bells.find(o => o.num === bellnum);
  if (bell) {
    bell.ringing = false;
    if (!playing && bell.stroke !== stroke && bellnum !== mybell) {
      pull(bellnum);
    }
  }
}


//end ringing
function thatisall() {
  playing = false;
  waiting = false;
  clearTimeout(timeout);
  setTimeout(function() {
    standbells(1);
  }, 500);
  
  $("#okbutton").removeClass("disabled");
  $("#stopbutton").addClass("disabled");
  rownum = 0;
  place = 0;
  myrow = 0;
  roundscount = 0;
  thatsall = false;
  stroke = 1;
  soundqueue = [];
  rowArr.forEach(o => {
    o.row.forEach(a => {
      a[1] = false;
    });
  });
  $("#instruct").text(" ");
  if (level > 1) {
    resetsoundline();
  }
  
}

function resetsoundline() {
  $(".sound.marker").css("display", "none");
  $(".sound.marker").removeClass("mymarker");
  positionmarkers();
  let line = $("#sound-line").detach();
  line.css("width", "0");
  $("#visuals li:first-child").append(line);
}

function standbells(n) {
  if (bells) {
    for (let i = 1; i <= numbells; i++) {
      let bell = bells.find(b => b.num === i);
      if (bell.stroke !== n) {
        pull(i);
      }
    }
  }
}



//given animation event find the buffer to play
function ring(e) {
  //console.log(this.id);
  let bellnum = Number(this.id.startsWith("hand") ? this.id.slice(6) : this.id.slice(7));
  let bell = bells.find(b => b.num === bellnum);
  if (bell) {
    let pan = [];
    let x = (Number(bell.left) - 270)/135;
    let z = Number(bell.z)/100;
    pan.push(x, 10, z);
    
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
  panner.setPosition(...pan);
  sampleSource.connect(panner).connect(gainNode).connect(audioContext.destination);
  //sampleSource.connect(audioContext.destination);
  sampleSource.start();
  return sampleSource;
}


//I don't know why I made this variable
var width = 60;
function addrope(bell) {
  let div = `<div class="chute" id="chute${bell.num}">
    <span class="bellnum">${bell.num}</span>
  </div>`;
  //then append the div
  $("#bells").append(div);
  let rope = svg.svg($("#chute"+bell.num), null, null, 60, 500, 0, bell.stroke === 1 ? 0 : 173.7, 60, 500, {id: "rope"+bell.num, class: "rope", xmlns: "http://www.w3.org/2000/svg", "xmlns:xlink": "http://www.w3.org/1999/xlink"});
  let defs = svg.defs(rope);
  let pattern = svg.pattern(defs, "sallypattern", 0, 0, 1, 0.13);
  let patternpaths = [{stroke: "blue", d: "M -2 4 l 5 -5"}, {stroke: "red", d: "M -2 8 l 9 -9"}, {stroke: "skyblue", d: "M -2 12 l 12 -12"}, {stroke: "blue", d: "M 1 13 l 9 -9"}, {stroke: "red", d: "M 5 13 l 5 -5"}];
  patternpaths.forEach(o => {
    svg.path(pattern, o.d, {"stroke-width": 3.2, stroke: o.stroke});
  });

  svg.rect(rope, 30, -90, 3, 260, {fill: "#dddddd", "stroke-width": 1, stroke: "#aaaaaa"});
  svg.rect(rope, 30, 255, 3, 60, {fill: "#dddddd", "stroke-width": 1, stroke: "#aaaaaa"});

  let hand = svg.svg(rope, null, null, null, null, {class: "hand", id: "hand"+bell.num});
  svg.rect(hand, 0, 170, 29, 90, {fill: "transparent"});
  svg.rect(hand, 35, 170, 29, 90, {fill: "transparent"});
  svg.rect(hand, 27, 170, 9, 90, 7, null, {fill: "url(#sallypattern)", class: "sally", id: "sally"+bell.num});

  let back = svg.svg(rope, null, null, null, null, {class: "back", id: "back"+bell.num});
  svg.rect(back, 0, 315, 29, 61, {fill: "transparent"});
  svg.rect(back, 33, 315, 29, 61, {fill: "transparent"});
  let tail = svg.svg(back, null, null, null, null, {class: "tail", id: "tail"+bell.num});
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
      let begin = i === 0 ? "indefinite" : s + (j-1) +"b"+bell.num + ".endEvent";
      svg.other(rope, "animate", {id: s+j+"b"+bell.num, attributeName: "viewBox", to: "0 "+y+" 60 500", dur: dur, begin: begin, fill: "freeze"});
    }
  });
}

function setdur(s,i) {
  let n = duration/21;
  let dur = [0,14].includes(i) ? 3*n : [1,13].includes(i) ? 2*n : n;
  return dur;
}

function position(i, num) {
  let radius = 270; //update this for non-div by 4 stages
  let zrad = 270;
  let angle = 2*Math.PI/numbells*i;
  let left = radius - radius * Math.sin(angle);
  let z = Math.cos(angle*-1) * zrad - zrad/2;
  let bell = bells.find(b => b.num === num);
  bell.left = left;
  bell.z = z;
  $("#chute"+num).css({"left": left+"px", transform: "translateZ("+z+"px)"});
}
