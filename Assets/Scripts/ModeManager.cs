using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ModeManager : MonoBehaviour
{
    GameObject P1Win, P2Win;
    public GameObject player1, player2;

    private void Awake() {
        P1Win = GetComponent<GameManager>().endMenu.transform.Find("P2 Wins").gameObject;
        P2Win = GetComponent<GameManager>().endMenu.transform.Find("P1 Wins").gameObject;
        PlayerLoadBlocks[] players = FindObjectsOfType<PlayerLoadBlocks>();
        /*foreach (var item in players)
        {
            if(item.right)
                player2 = item.gameObject;
            else
                player1 = item.gameObject;
        }*/
    }

    public void SetWin(bool right)
    {
        GameManager.instance.endMenu.SetActive(true);
        (right? P1Win : P2Win).SetActive(false);
        Time.timeScale = 0;
    }
}
