using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerMove : MonoBehaviour
{
    bool right;
    Rigidbody2D rb;

    float force;

    GameManager GM;
    float maxSizeY1;
    float maxSizeY2;
   // public bool pong;


    private void Awake()
    {
        right = GetComponent<PlayerLoadBlocks>().right;
        rb = GetComponent<Rigidbody2D>();
        GM = FindObjectOfType<GameManager>();
        force = GM.PlayerVelocity;
    }

    void PlayerController()
    {
        if ((Input.GetKey(KeyCode.UpArrow) && right) || (Input.GetKey(KeyCode.W) && !right))
        {
            rb.AddForce(force * Vector2.up);
        }
        if ((Input.GetKey(KeyCode.DownArrow) && right) || (Input.GetKey(KeyCode.S) && !right))
        {
            rb.AddForce(force * Vector2.down);
        }
        rb.velocity=new Vector2(0,Mathf.Clamp(rb.velocity.y, -13, 13));
        //if (pong == false)
        //{
        //    transform.position = new Vector2(transform.position.x, Mathf.Clamp(transform.position.y, -4, 4));
        //}
    }

    void GetBlockSizeY()
    {
        Blocks[] blocks = GetComponentsInChildren<Blocks>();
        maxSizeY1 = -GM.PlayerSize.y / 2;
        maxSizeY2 = GM.PlayerSize.y / 2;
        foreach (var block in blocks)
        {
            if (block.gameObject.transform.localPosition.y > maxSizeY1)
                maxSizeY1 = block.gameObject.transform.localPosition.y;
            if (block.gameObject.transform.localPosition.y < maxSizeY2)
                maxSizeY2 = block.gameObject.transform.localPosition.y;
        }
    }

    void testBound()
    {
        if (transform.position.y + maxSizeY1 > GM.HEIGHT / 2)
        {
            transform.position = new Vector2(transform.position.x, GM.HEIGHT / 2 - maxSizeY1);
        }
        if (transform.position.y + maxSizeY2 < -GM.HEIGHT / 2)
        {
            transform.position = new Vector2(transform.position.x, -GM.HEIGHT / 2 - maxSizeY2);
        }
    }

    private void FixedUpdate()
    {
        PlayerController();
        GetBlockSizeY();
        testBound();
    }
}
