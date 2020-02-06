function [newPositions] = forcefield(t,dt,step,plane,ks,kd,R,m)
%   Ber�knar nya positioner [newPositions] f�r alla punkter, samt lagrar en iteration
%   bak�t av geometrin. Ber�knas med Verletintegration.


%planeSize = size(plane);


paddedPlane = padPlane(plane);
paddedSize = size(paddedPlane);    

newPositions = plane;

counterX = 1;
counterY = 1;

    for i = 2:paddedSize(1)-1
        counterY = 1;
        for j = 2:paddedSize(2)-1
            
            totPointForce = applyForceKernel(paddedPlane,i,j,ks,kd,R,m);
            
            a = totPointForce*m;
            
            v = paddedPlane(i,j).prevVel + dt*a;
            p = [paddedPlane(i,j).x paddedPlane(i,j).y paddedPlane(i,j).z] + dt*paddedPlane(i,j).prevVel;
            paddedPlane(i,j).prevVel = v;
            newPositions(counterX,counterY).x = p(1);
            newPositions(counterX,counterY).y = p(2);
            newPositions(counterX,counterY).z = p(3);
            
            counterY = counterY+1;
        end
        counterX = counterX+1;
    end
    

end