function [newPositions] = forcefield(step,plane,K,m)
%   Ber�knar nya positioner [newPositions] f�r alla punkter, samt lagrar en iteration
%   bak�t av geometrin. Ber�knas med Verletintegration.


%planeSize = size(plane);
newPositions = plane;

paddedPlane = padPlane(plane);
paddedSize = size(paddedPlane);    
    
counterX = 1;
counterY = 1;

    for i = 2:paddedSize(1)-1
        counterY = 1;
        for j = 2:paddedSize(2)-1
            
            totPointSpringForce = applyForceKernel(plane,[i,j]);
            
            
            
            newPositions(i,j).x = 0;
            newPositions(i,j).y = 0;
            newPositions(i,j).z = 0;
            counterY = counterY+1;
        end
        counterX = counterX+1;
    end
    

end