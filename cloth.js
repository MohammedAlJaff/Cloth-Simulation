
//Size of window and cloth, note that a square cloth is needed
var height = 900;
var width = 1200;
var col = 14;
var row = 14;
var Area = col*row;
var FPS = 60;
var offsetX = 200;
var offsetY = 100;
var DIST = 30;
var MASS_SIZE = 7;

//Simulation constants
var stiffness = -700;
var damping = -2;
var k_air = 0.002;
var mass = 0.2;
var ts = 0.001; //Euler timestep (note that smaller than 0.001 needed for stability)
var gravityInfluenceFactor = 1;
var gravity = [0, -9.81*gravityInfluenceFactor, 0];

//Displaying particles and vareraction
var chosenParticle = (0, 0);
var chosen = false;
var renderParticles = true;

// Wind
var windActive;
var windFactor = 0;

// Background and GUI
var renderBackground = false;
var s = "CLOTH SIMULATION";
var info = "This is an interactive simulation of a cloth. The calculations are based on a mass-damper system that is solved using Euler's method";
var instruction = "Press and drag with the left mouse button on a mass to move it. Press TAB to fixate/unfixate a chosen mass.";
var moreInfo = "Change the values of the spring and damping coefficient in order to change the appearance of the cloth. Note that some values may cause an unstable behavior.";
var about = "More info can be found at: \nhttp://github.com/jklintan/Cloth-Simulation.";

var textureIm;
var im1; 
var im2;
var im3;
var im4;
var nTextures = 1;
var renderTexture = false;
var heavyFactor = 3;

let massSlider, dampingSlider, stiffnessSlider, windSlider;

//************************** PARTICLE CLASS ******************************* //

class particle {

  //Constructor
  constructor(row, col, dist, fix) {
    this.index = [row, col];
    this.initialpos = [(row-1)*dist, (col-1)*dist, 0.0];
    this.pos = (this.initialpos);
    this.oldpos = (this.initialpos);
    this.isfixed = fix;
    this.force = [0, 0, 0];
    this.vel = [0, 0, 0];
  }

  isFixed() {
    return this.isfixed;
  }

  setPos(x, y) {
    this.pos.set(x, y);
  }

  //Draw the particle 
  display() {
    fill(255);
    ellipse(this.pos[0]+offsetX, this.pos[1]+ offsetY, MASS_SIZE, MASS_SIZE);
  }

  getPos() {
    return this.pos;
  }
}

// Storing of the particle
var k = 0;
var theparticles = []


//************************** SETUP FUNCTIONS ******************************* //

function settings(){

  //Initialize the grid of particles
  theparticles = [];
  for(var i = 0; i < row; i++){
    for(var j = 0; j < col; j++){
      if(i == 0 && j == 0 || i == 0 && j == col-1){
        theparticles.push(new particle(j, i, DIST, true));
        k = k + 1;
      }else{
        theparticles.push(new particle(j, i, DIST, false));
        k = k + 1;
      }

    }
  }
}
   

function setup() {
  createCanvas(windowWidth, windowHeight);

  for(var i = 0; i < row; i++){
    for(var j = 0; j < col; j++){
      if(i == 0 && j == 0 || i == 0 && j == col-1){
        theparticles.push(new particle(j, i, DIST, true));
        k = k + 1;
      }else{
        theparticles.push(new particle(j, i, DIST, false));
        k = k + 1;
      }
    }
  }

  // GUI BUTTONS AND SLIDERS
  buttonDispMass = createButton("Display Masses");
  buttonDispMass.position(windowWidth-450, windowHeight*0.85);
  buttonDispMass.mousePressed(RenderMasses);
  buttonDispMass.style('background-color: green');
  buttonDispMass.style('color: white');
  buttonDispMass.style('height: 40px');
  buttonDispMass.style('width: 85px');
  buttonDispMass.style('text-align: 12px');

  buttonWind = createButton("Toggle wind");
  buttonWind.position(windowWidth-350, windowHeight*0.85);
  buttonWind.mousePressed(toggle);
  buttonWind.style('background-color: red');
  buttonWind.style('color: white');
  buttonWind.style('height: 40px');
  buttonWind.style('width: 85px');
  buttonWind.style('text-align: 12px');
  
  reset = createButton("Reset");
  reset.position(windowWidth-250, windowHeight*0.85);
  reset.mousePressed(Reset);
  reset.style('background-color: rgb(28, 38, 53)');
  reset.style('color: white');
  reset.style('height: 40px');
  reset.style('width: 85px');
  reset.style('text-align: 12px');

  massSlider = createSlider(5, 15, 7);
  massSlider.position(windowWidth-450, windowHeight*0.47);
  massSlider.style('height: 30px');
  massSlider.style('width: 285px');

  dampingSlider = createSlider(0, 14.9, 12);
  dampingSlider.position(windowWidth-450,  windowHeight*0.67);
  dampingSlider.style('height: 30px');
  dampingSlider.style('width: 285px');

  stiffnessSlider = createSlider(10, 3000, 700);
  stiffnessSlider.position(windowWidth-450,  windowHeight*0.57);
  stiffnessSlider.style('height: 30px');
  stiffnessSlider.style('width: 285px');

  windSlider = createSlider(-3000, 3000, 0);
  windSlider.position(windowWidth-450,  windowHeight*0.77);
  windSlider.style('height: 30px');
  windSlider.style('width: 285px');
}

//****************************** RENDERING LOOP ******************************* //

function draw() {

  windFactor = windSlider.value();
  MASS_SIZE = massSlider.value();
  damping = -(15-dampingSlider.value());
  stiffness = - stiffnessSlider.value();

  //Background clear
  stroke(0);
  background(color(11, 13, 18));
  fill(color(11, 13, 18));
  rect(2, 2, 1196, 896);

  //Draw the lattice
  theparticles = drawLattice(theparticles);
  theparticles = updateParticles(theparticles); //Update forces acting on particles and positions according to Euler

  //GUI info
  fill(255);
  rect(windowWidth-500, 0, 400, windowHeight);
  fill(color(11, 13, 18));
  textSize(28.7);
  text(s, windowWidth-450, windowHeight*0.05, 350, 100); 
  textSize(12);
  text(info, windowWidth-450, windowHeight*0.12, 280, 100); 
  text(instruction, windowWidth-450, windowHeight*0.22, 280, 100); 
  text(moreInfo, windowWidth-450, windowHeight*0.32, 280, 100); 
  text("Stiffness", windowWidth-450, windowHeight*0.55, 280, 100); 
  text("Damping", windowWidth-450, windowHeight*0.65, 280, 100); 
  text("Mass Size", windowWidth-450, windowHeight*0.45, 280, 100); 
  text("Wind Strength and Direction", windowWidth-450, windowHeight*0.75, 280, 100); 
  textSize(10);
  text(about, windowWidth-450, windowHeight*0.95, 280, 200); 

  stroke(255);
}

//********************* Create the lattice **********************//
function createLattice(theparticles) {
  for (var rows=0; rows<row; rows++) {
    for (var cols=0; cols<col; cols++) {
      if ((rows == 0 && cols == 0) || rows == 0 && cols == col-1) {
        theparticles[cols][rows] = new particle(cols, rows, DIST, true);
      } else {
        theparticles[cols][rows] = new particle(cols, rows, DIST, false);
      }
    }
  }
}

// Draw lattice
function drawLattice(theparticles) {
  if (!renderTexture) {
   fill(255);
   strokeWeight(1);
   stroke(255);
  }

  for (var y=0; y<row; y++) {
    if (renderTexture) {
      noStroke();
      noFill();
      beginShape(QUAD_STRIP);
      texture(textureIm);
    }
    for (var x=0; x<col; x++) {
      if(theparticles != null){
        if (renderParticles && !renderTexture) {       
          theparticles[x + y*col].display();
        }

      if (renderTexture) {
        if (y < row-1 && x != col && y != row-1) {
          var index = x + y * col;
          var x1 = theparticles[index].pos[0] + offsetX;
          var y1 = theparticles[index].pos[1]+ offsetY;
          var u = map(x, 0, col-1, 0, 1);
          var v1 = map(y, 0, row-1, 0, 1);
          vertex(x1, y1, u, v1);
          index = x + (y+1)* col;
          var x2 = theparticles[index].pos[0] + offsetX;
          var y2 = theparticles[index].pos[1]+ offsetY;
          var v2 = map(y+1, 0, row-1, 0, 1);
          vertex(x2, y2, u, v2);
        }
      }

      if (!renderTexture) {
        var index = x + y * col;
        var index2 = x + (y+1) * col;
        var index3 = (x-1) + y * col;
        var index4 = x + (y-1) * col;
         if (x == 0 && y >= 0 && y < row-1) {
           line(theparticles[index].pos[0] + offsetX, theparticles[index].pos[1]+ offsetY, theparticles[index2].pos[0] + offsetX, theparticles[index2].pos[1]+ offsetY);
         }
         if (y >= 0 && x >= 1) {        
           line(theparticles[index].pos[0] + offsetX, theparticles[index].pos[1]+ offsetY, theparticles[index3].pos[0] + offsetX, theparticles[index3].pos[1]+ offsetY);  

           if (y >= 1) {
             line(theparticles[index].pos[0] + offsetX, theparticles[index].pos[1]+ offsetY, theparticles[index4].pos[0] + offsetX, theparticles[index4].pos[1]+ offsetY);
           }
         }
       }
    }
    }

    if (renderTexture) {
      endShape();
    }
  }
  return theparticles;
}

//************************* Update particles **************************//
function updateParticles(theparticles) {
  var fs1;
  var fs2;
  var fs3; 
  var fs4;
  var fs5;
  var fs6;
  var fs7;
  var fs8;
  var fb1;
  var fb2;
  var fb3;
  var fb4;
  var fb5;
  var fb6;
  var fb7;
  var fb8;
  var xij;
  var norm_xij;
  var L; 

  var xoff = 0;
  for (var r = 0; r < row; r++) {
    var yoff = 0;
    for (var c = 0; c < col; c++) {

      var nois = noise(xoff, yoff); //Wind noise

      // Stiffnes forces
      fs1 = [0.0, 0.0];
      fs2 =  [0.0, 0.0];
      fs3 =  [0.0, 0.0];
      fs4 =  [0.0, 0.0];
      fs5 =  [0.0, 0.0];
      fs6 =  [0.0, 0.0];
      fs7 =  [0.0, 0.0];
      fs8 =  [0.0, 0.0];

      // Damping forces
      fb1 =  [0.0, 0.0];
      fb2 =  [0.0, 0.0];
      fb3 =  [0.0, 0.0];
      fb4 =  [0.0, 0.0];
      fb5 =  [0.0, 0.0];
      fb6 = [0.0, 0.0];
      fb7 =  [0.0, 0.0];
      fb8 =  [0.0, 0.0];

      L = 10; //Initial link

      //Update forces for 4-neighbours (stretching forces)
      //Update forces for 8-neighbours (shearing forces)
      //Spring force according to Hook's law 
      //Damping force according to linear damping of velocity

      var ind = r + c * col;
      var ind2 = (r+1) + c * col;
      var ind3 = r + (c+1)*col;
      var ind4 = (r-1)+(c+1)*col;
      var ind5 = (r-1) + c *col;
      var ind6 = r + (c-1)*col;
      var ind1 = (r+1) + (c-1)*col;
      var ind7 = (r+1) + (c+1)*col;
      var ind8 = (r-1) + (c-1)*col;

      // Mass below
      if (r < row-1) {
         L = Math.sqrt( Math.pow((theparticles[ind].initialpos[0]-theparticles[ind2].initialpos[0]), 2) + Math.pow((theparticles[ind].initialpos[1]-theparticles[ind2].initialpos[1]), 2) );

         xij = [theparticles[ind].pos[0]-theparticles[ind2].pos[0], theparticles[ind].pos[1]-theparticles[ind2].pos[1], 0];
        norm_xij = Math.sqrt(Math.pow(xij[0],2) + Math.pow(xij[1],2));
        var s = norm_xij - L;
        var t = -stiffness*s;
        var j = [xij[0]/norm_xij, xij[1]/norm_xij, 0];
        fs2 = [j[0]*t, j[1]*t, 0];
        var n =[theparticles[ind].vel[0]-theparticles[ind2].vel[0], theparticles[ind].vel[1]-theparticles[ind2].vel[1], 0];
        fb2 = [n[0]*(-damping), n[1]*(-damping), 0];
      }

      // // Mass to the right
      if (c < col-1) {
        L = Math.sqrt( Math.pow((theparticles[ind].initialpos[0]-theparticles[ind3].initialpos[0]), 2) + Math.pow((theparticles[ind].initialpos[1]-theparticles[ind3].initialpos[1]), 2) );

        xij = [theparticles[ind].pos[0]-theparticles[ind3].pos[0], theparticles[ind].pos[1]-theparticles[ind3].pos[1], 0];
       norm_xij = Math.sqrt(Math.pow(xij[0],2) + Math.pow(xij[1],2));
       var s = norm_xij - L;
       var t = -stiffness*s;
       var j = [xij[0]/norm_xij, xij[1]/norm_xij, 0];
       fs3 = [j[0]*t, j[1]*t, 0];
       var n =[theparticles[ind].vel[0]-theparticles[ind3].vel[0], theparticles[ind].vel[1]-theparticles[ind3].vel[1], 0];
       fb3 = [n[0]*(-damping), n[1]*(-damping), 0];
      }

      // // Mass above
      if (r > 0) {
        L = Math.sqrt( Math.pow((theparticles[ind].initialpos[0]-theparticles[ind5].initialpos[0]), 2) + Math.pow((theparticles[ind].initialpos[1]-theparticles[ind5].initialpos[1]), 2) );

        xij = [theparticles[ind].pos[0]-theparticles[ind5].pos[0], theparticles[ind].pos[1]-theparticles[ind5].pos[1], 0];
       norm_xij = Math.sqrt(Math.pow(xij[0],2) + Math.pow(xij[1],2));
       var s = norm_xij - L;
       var t = -stiffness*s;
       var j = [xij[0]/norm_xij, xij[1]/norm_xij, 0];
       fs5 = [j[0]*t, j[1]*t, 0];
       var n =[theparticles[ind].vel[0]-theparticles[ind5].vel[0], theparticles[ind].vel[1]-theparticles[ind5].vel[1], 0];
       fb5 = [n[0]*(-damping), n[1]*(-damping), 0];
      }

      // // Mass to the left
      if (c > 0) {
        L = Math.sqrt( Math.pow((theparticles[ind].initialpos[0]-theparticles[ind6].initialpos[0]), 2) + Math.pow((theparticles[ind].initialpos[1]-theparticles[ind6].initialpos[1]), 2) );

        xij = [theparticles[ind].pos[0]-theparticles[ind6].pos[0], theparticles[ind].pos[1]-theparticles[ind6].pos[1], 0];
        norm_xij = Math.sqrt(Math.pow(xij[0],2) + Math.pow(xij[1],2));
        var s = norm_xij - L;
        var t = -stiffness*s;
        var j = [xij[0]/norm_xij, xij[1]/norm_xij, 0];
        fs6 = [j[0]*t, j[1]*t, 0];
        var n =[theparticles[ind].vel[0]-theparticles[ind6].vel[0], theparticles[ind].vel[1]-theparticles[ind6].vel[1], 0];
        fb6 = [n[0]*(-damping), n[1]*(-damping), 0];
      }

      // // Mass diagonal, top right
      if (r > 0 && c < col-1) {
        L = Math.sqrt( Math.pow((theparticles[ind].initialpos[0]-theparticles[ind4].initialpos[0]), 2) + Math.pow((theparticles[ind].initialpos[1]-theparticles[ind4].initialpos[1]), 2) );
        xij = [theparticles[ind].pos[0]-theparticles[ind4].pos[0], theparticles[ind].pos[1]-theparticles[ind4].pos[1], 0];
        norm_xij = Math.sqrt(Math.pow(xij[0],2) + Math.pow(xij[1],2));
        var s = norm_xij - L;
        var t = -stiffness*s;
        var j = [xij[0]/norm_xij, xij[1]/norm_xij, 0];
        fs4 = [j[0]*t, j[1]*t, 0];
        var n =[theparticles[ind].vel[0]-theparticles[ind4].vel[0], theparticles[ind].vel[1]-theparticles[ind4].vel[1], 0];
        fb4 = [n[0]*(-damping), n[1]*(-damping), 0];
      }

      // // Mass diagonal, down left
      if (r < row-1 && c > 0) {
        L = Math.sqrt( Math.pow((theparticles[ind].initialpos[0]-theparticles[ind1].initialpos[0]), 2) + Math.pow((theparticles[ind].initialpos[1]-theparticles[ind1].initialpos[1]), 2) );

        xij = [theparticles[ind].pos[0]-theparticles[ind1].pos[0], theparticles[ind].pos[1]-theparticles[ind1].pos[1], 0];
        norm_xij = Math.sqrt(Math.pow(xij[0],2) + Math.pow(xij[1],2));
        var s = norm_xij - L;
        var t = -stiffness*s;
        var j = [xij[0]/norm_xij, xij[1]/norm_xij, 0];
        fs1 = [j[0]*t, j[1]*t, 0];
        var n =[theparticles[ind].vel[0]-theparticles[ind1].vel[0], theparticles[ind].vel[1]-theparticles[ind1].vel[1], 0];
        fb1 = [n[0]*(-damping), n[1]*(-damping), 0];
      }

      // // Mass diagonal, down right
      if (r < row-1 && c < col-1) {
        L = Math.sqrt( Math.pow((theparticles[ind].initialpos[0]-theparticles[ind7].initialpos[0]), 2) + Math.pow((theparticles[ind].initialpos[1]-theparticles[ind7].initialpos[1]), 2) );

        xij = [theparticles[ind].pos[0]-theparticles[ind7].pos[0], theparticles[ind].pos[1]-theparticles[ind7].pos[1], 0];
        norm_xij = Math.sqrt(Math.pow(xij[0],2) + Math.pow(xij[1],2));
        var s = norm_xij - L;
        var t = -stiffness*s;
        var j = [xij[0]/norm_xij, xij[1]/norm_xij, 0];
        fs7 = [j[0]*t, j[1]*t, 0];
        var n =[theparticles[ind].vel[0]-theparticles[ind7].vel[0], theparticles[ind].vel[1]-theparticles[ind7].vel[1], 0];
        fb7 = [n[0]*(-damping), n[1]*(-damping), 0];
      }

      // //// Mass diagonal, top left
      if (r > 0 && c > 0) {
        L = Math.sqrt( Math.pow((theparticles[ind].initialpos[0]-theparticles[ind8].initialpos[0]), 2) + Math.pow((theparticles[ind].initialpos[1]-theparticles[ind8].initialpos[1]), 2) );

        xij = [theparticles[ind].pos[0]-theparticles[ind8].pos[0], theparticles[ind].pos[1]-theparticles[ind8].pos[1], 0];
        norm_xij = Math.sqrt(Math.pow(xij[0],2) + Math.pow(xij[1],2));
        var s = norm_xij - L;
        var t = -stiffness*s;
        var j = [xij[0]/norm_xij, xij[1]/norm_xij, 0];
        fs8 = [j[0]*t, j[1]*t, 0];
        var n =[theparticles[ind].vel[0]-theparticles[ind8].vel[0], theparticles[ind].vel[1]-theparticles[ind8].vel[1], 0];
        fb8 = [n[0]*(-damping), n[1]*(-damping), 0];
      }

      var windx = map(noise(yoff, xoff), 0, 1, 0, 10);
      var windy = map(noise(yoff + 3000, xoff+3000), -100, 1, -100, 0);
      var wind = [0, 0];

      if (windActive){
      wind = [windx*windFactor/heavyFactor, windy*windFactor/heavyFactor];
      }

      var index = r + c*col;
      var AirResistance =  [-theparticles[index].vel[0]*k_air*Area, -theparticles[index].vel[1]*k_air*Area, 0];
      theparticles[index].force = [0-fs1[0]-fb1[0]-fs2[0]-fb2[0]-fs3[0]-fb3[0]-fs4[0]-fb4[0]-fs5[0]-fb5[0]-fs6[0]-fb6[0]-fs7[0]-fb7[0]-fs8[0]-fb8[0]+AirResistance[0]+wind[0], 9.81*70-fs1[1]-fb1[1]-fs2[1]-fb2[1]-fs3[1]-fb3[1]-fs4[1]-fb4[1]-fs5[1]-fb5[1]-fs6[1]-fb6[1]-fs7[1]-fb7[1]-fs8[1]-fb8[1]+AirResistance[1]+wind[1], 0];

      xoff += 10;
    }
    yoff += 10;
  }

  ////Position, velocity, and accelleration update for all nodes
  for (var r = 0; r < row; r++) {      
    for (var c = 0; c < col; c++) {
      var index = c + r*col;
      if (!theparticles[index].isfixed) {  //Upate all nodes except the fixed ones 

        theparticles[index].acc = [theparticles[index].force[0]/mass, theparticles[index].force[1]/mass, 0];
        theparticles[index].vel = [xtEuler(theparticles[index].vel[0], theparticles[index].acc[0], ts), xtEuler(theparticles[index].vel[1], theparticles[index].acc[1], ts), 0];
        theparticles[index].pos = [xtEuler(theparticles[index].pos[0], theparticles[index].vel[0], ts), xtEuler(theparticles[index].pos[1], theparticles[index].vel[1], ts), 0];
      }
    }
  }
  
  return theparticles;
}

//**************************  EULERS METHOD ********************************//
function xtEuler(xt, xtPrim,  h) {
  return xt + h*xtPrim;
}

//**************************  USER INTERACTION ********************************//

//Fix and unfix particles
function keyPressed() {
  if (keyPressed && keyCode == TAB) {
    if (chosen == true) {
      if (theparticles[chosenParticle].isFixed()) {
        theparticles[chosenParticle].isfixed = false;
      } else {
        theparticles[chosenParticle].isfixed = true;
      }
    }
  }
}

//Chose a specific particle
function mousePressed() { 
  if (mousePressed && mouseButton == LEFT) {
    var mousePos = [mouseX, mouseY];
    for (var r = 0; r < row; r++) {
      for (var c = 0; c < col; c++) {
        var index = r + c * col;  
        if (abs(theparticles[index].pos[0] - (mousePos[0]-offsetX)) < 15 && abs(theparticles[index].pos[1] - (mousePos[1]-offsetY)) < 15) {
          chosenParticle = r + c *col;
          chosen = true;
          return;
        }
      }
    }
  }
}

function mouseReleased() {
  chosen = false;
}

//Move the current particle
function mouseDragged() {
  if (chosen) {
    theparticles[chosenParticle].pos = [mouseX-200, mouseY-100, 0];
  }
}

//******************************* GUI HANDLING ********************************//

function Stiffness(ks) {
  stiffness = -ks;
}

function Damping(kd) {
  damping = -(15-kd);
}

function MassSize(size) {
  MASS_SIZE = size;
}

function Gravity(g) {
  gravityInfluenceFactor = g;
}

function SwitchText() {
  if (renderTexture) {
    if (nTextures == 1) {
      textureIm = im2;
      nTextures += 1;
      heavyFactor = 1;
    } else if (nTextures == 2) {
      textureIm = im3;
      nTextures += 1;
      heavyFactor = 20;
    } else if (nTextures == 3) {
      textureIm = im4;
      nTextures += 1;
      heavyFactor = 2;
    } else if (nTextures == 4) {
      textureIm = im1;
      nTextures = 1;
      heavyFactor = 3;
    }
  }
}

function WindStrength(w) {
  windFactor = w;
}

function RenderMasses() {
  if (renderParticles == false){
    renderParticles = true;
    buttonDispMass.style('background-color: green');
}else{
    renderParticles = false;
    buttonDispMass.style('background-color: red');
  }
}

function RenderTexture() {
  if (renderTexture == false)
    renderTexture = true;
  else
    renderTexture = false;
}

function Reset() {
  renderParticles = true;
  renderTexture = false;
  windActive = false;
  windFactor = 0;
  nTextures = 1;
  windSlider.value(0);
  massSlider.value(7);
  dampingSlider.value(12);
  stiffnessSlider.value(700);
  buttonDispMass.style('background-color: green');
  RenderMasses = true;
  buttonWind.style('background-color: red');
  windActive = false;
  settings();
}

function toggle() {

  if(windActive == true){
    windActive = false;
    buttonWind.style('background-color: red');
  }else{
    windActive =true;
    buttonWind.style('background-color: green')
  }
}

function toggleTexture(theFlag) {
  if (theFlag==true) {
    renderTexture = true;
    colorT2 = color(42, 117, 28);
  } else {
    colorT2 = color(143, 53, 50);
    renderTexture = false;
  }
}

function toggleMasses(theFlag) {
  if (theFlag==true) {
    renderParticles = true;
    colorT3 = color(42, 117, 28);
  } else {
    colorT3 = color(143, 53, 50);
    renderParticles = false;
  }
}
