//FUNGERAR
Point[][] padPlane(Point plane[][],int row, int col)
{
  
  int padrow =row+2;
  int padcol =col+2;
  
  Point paddedPlane[][] = new Point[padrow][padcol]; //Skapa ett plan

for(int i = 0; i < padrow; i++)
{
    for(int j = 0; j < padcol; j++)
    {
        paddedPlane[i][j] = new Point(0,0,0);
        paddedPlane[i][j].ifPad = true;
    }
}

int counterX = 0; //NU HAR VI ÄNDRAT DEN HÄR FRÅN 1 TILL 0
int counterY = 0;


for(int i = 1; i < padrow-1 ; i++)
{
    counterY = 0;
    for(int j = 1; j < padcol-1;  j++)
    {   
        
        paddedPlane[i][j].x = plane[counterX][counterY].x;
        paddedPlane[i][j].y = plane[counterX][counterY].y;
        paddedPlane[i][j].z = plane[counterX][counterY].z;
        paddedPlane[i][j].ifPad = false;
        paddedPlane[i][j].prevVel = plane[counterX][counterY].prevVel;
        counterY = counterY+1;
    }
    
    counterX = counterX+1;
    
}

  return paddedPlane;
}


PVector applyForceKernel(Point paddedPlane[][],int x,int y,float ks,float kd, float R,float m)
{

PVector f1 = new PVector();
PVector f2 = new PVector();
PVector f3 = new PVector();
PVector f4 = new PVector();

PVector temp_1 = new PVector();
PVector temp_2 = new PVector();
PVector temp_3 = new PVector();
PVector temp_4 = new PVector();


if(paddedPlane[x][y+1].ifPad == false)
{
    
    PVector vec1 = new PVector(paddedPlane[x][y+1].x-paddedPlane[x][y].x, paddedPlane[x][y+1].y-paddedPlane[x][y].y, paddedPlane[x][y+1].z-paddedPlane[x][y].z);
    
    float vec1Length = vec1.mag();
    
    temp_1 = paddedPlane[x][y+1].prevVel;
    
    PVector vel1 = temp_1.sub(paddedPlane[x][y].prevVel);
   
    float stiff1 = (ks*(vec1Length-R));
   
    f1 = (vec1.div(vec1Length)).mult(stiff1).add(vel1.mult(kd));
    
    
}
else
{
    f1.set(0,0,0);
}

if(paddedPlane[x+1][y].ifPad == false)
{
    PVector vec2 = new PVector(paddedPlane[x+1][y].x-paddedPlane[x][y].x, paddedPlane[x+1][y].y-paddedPlane[x][y].y, paddedPlane[x+1][y].z-paddedPlane[x][y].z);
    
    float vec2Length = vec2.mag();
    
    temp_2 = paddedPlane[x][y+1].prevVel;
    
    PVector vel2 = temp_2.sub(paddedPlane[x][y].prevVel);
    
    float stiff2 = (ks*(vec2Length-R));
    
    f2 = (vec2.div(vec2Length)).mult(stiff2).add(vel2.mult(kd));
    
}   
else
{
    f2.set(0,0,0);
}
    
if(paddedPlane[x][y-1].ifPad == false)
{
    PVector vec3 = new PVector(paddedPlane[x][y-1].x-paddedPlane[x][y].x, paddedPlane[x][y-1].y-paddedPlane[x][y].y, paddedPlane[x][y-1].z-paddedPlane[x][y].z);
    
    float vec3Length = vec3.mag();
    
    temp_3 = paddedPlane[x][y+1].prevVel;
    
    PVector vel3 = temp_3.sub(paddedPlane[x][y].prevVel);
    
    float stiff3 = (ks*(vec3Length-R));
    
    f3 = (vec3.div(vec3Length)).mult(stiff3).add(vel3.mult(kd));
    
}   
else
{
    f3.set(0,0,0);
}

if(paddedPlane[x-1][y].ifPad == false)
{
    PVector vec4 = new PVector(paddedPlane[x-1][y].x-paddedPlane[x][y].x, paddedPlane[x-1][y].y-paddedPlane[x][y].y, paddedPlane[x-1][y].z-paddedPlane[x][y].z);
    
    float vec4Length = vec4.mag();
    
    temp_4 = paddedPlane[x][y+1].prevVel;
    
    PVector vel4 = temp_4.sub(paddedPlane[x][y].prevVel);
    
    float stiff4 = (ks*(vec4Length-R));
    
    f4 = (vec4.div(vec4Length)).mult(stiff4).add(vel4.mult(kd));
    
}   
else
{
    f4.set(0,0,0);
}

//float mg = -m*9.81;
PVector mg = new PVector(0,-m*9.82, 0);

//External forces
PVector added_f = new PVector(); 
added_f = f1.add(f2.add(f3.add(f4.add(mg))));
//added_f.set(0, mg, 0);

return added_f;

}




Point[][] forceField (float dt,Point[][] plane, float ks,float kd,float R,float m, int row, int col)
{
  //   Beräknar nya positioner [newPositions] för alla punkter, samt lagrar en iteration
  //   bakåt av geometrin. Beräknas med Verletintegration.

PVector totPointForce = new PVector();
PVector temp_1 = new PVector();
PVector temp_2 = new PVector();

int paddedrow = row+2;
int paddedcol = col+2;
Point paddedPlane[][] = new Point[paddedrow][paddedcol];
paddedPlane = padPlane(plane,row,col);


Point newPositions[][] = new Point[row][col];
//newPositions = plane;

int counterX = 0;
int counterY = 0;

    for(int i = 1; i < paddedrow-1; i++)
    {
        counterY = 0;
        
        for(int j = 1; j < paddedcol-1; j++)
        {
            temp_1 = paddedPlane[i][j].prevVel;
            temp_2 = paddedPlane[i][j].prevVel;
     //i == 1 && j == 1       
            if (1==0){
            totPointForce.set(0,0,0);
            newPositions[counterX][counterY] = new Point(0,0,0);
            }  
                
            else
            {
                totPointForce = applyForceKernel(paddedPlane,i,j,ks,kd,R,m);
                
                PVector a = totPointForce.div(m);
                
                PVector v = temp_1.add(a.mult(dt));
                
                PVector p1 = new PVector(paddedPlane[i][j].x, paddedPlane[i][j].y, paddedPlane[i][j].z);
                
                PVector p2 = (temp_2).mult(dt);
                
                PVector p = p1.add(p2);
                
                newPositions[counterX][counterY] = new Point(p.x,p.y,p.z);
                newPositions[counterX][counterY].prevVel = v;
                
                //newPositions[counterX][counterY].prevVel = v;
                //newPositions[counterX][counterY].x = p.x;
                //newPositions[counterX][counterY].y = p.y;
                //newPositions[counterX][counterY].z = p.z;
            }
            
            counterY = counterY+1;
        }
        counterX = counterX+1;
    }
    
    return newPositions;
}

void drawPlane(Point[][] plane, int row, int col)
{
  for(int i = 0; i < row; i++)
  {
    for(int j = 0; j < col; j++)
    {
      plane[i][j].display();
    }
  }
}
