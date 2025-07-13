using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Bounds : MonoBehaviour
{
    GameManager GM;
    void DrawBounds()
    {
        float[,] temp = {{-1,1}, {1, 1}, {1, -1}, {-1,-1}};
        LineRenderer lr = gameObject.AddComponent<LineRenderer>();
        lr.startWidth = lr.endWidth = .5f;
        lr.loop = true;
        lr.positionCount = 4;
        for(int i=0;i<4;i++)
        {
            lr.SetPosition(i, new Vector2(GM.WIDTH*temp[i, 0]/2, GM.HEIGHT*temp[i, 1]/2));
        }

    }
    private void Awake() {
        GM = FindObjectOfType<GameManager>();
        DrawBounds();
    }

}
