function [newPositions] = force(step,plane,K,m)
%   Ber�knar nya positioner [newPositions] f�r alla punkter, samt lagrar en iteration
%   bak�t av geometrin. Ber�knas med Verletintegration.


[sX,sY] = size(plane);
newPositions = plane;




    for i = 1:sX
        for j = 1:sY
            newPositions(i,j).x = newPositions(i,j).x;
            newPositions(i,j).y = newPositions(i,j).y;
            newPositions(i,j).z = newPositions(i,j).z;
        end
    end

    
    

end