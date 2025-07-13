using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Bound : MonoBehaviour
{
    public int score = 0;
    public bool right;

    public Text scoreNum;

    private void OnCollisionEnter2D(Collision2D collision)
    {
        GameObject obj = collision.gameObject;
        if (obj.GetComponent<Ball>() != null)
        {
            score ++;
            updateText();
        }
    }

    void updateText()
    {
        scoreNum.text = "" + score;
    }
}
