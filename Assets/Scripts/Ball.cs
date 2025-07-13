using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Ball : MonoBehaviour
{
    Rigidbody2D rb;
    GameManager GM;
    public Vector2 speed;
    public Animator CameraAnim;
    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        GM = FindObjectOfType<GameManager>();
        transform.localScale = new Vector3(GM.ballScale, GM.ballScale, 1f);
        transform.position = Vector3.zero;
        SetRandomVelocity();
    }

    private void ControlDirection()
    {
        transform.localEulerAngles = new Vector3(transform.localEulerAngles.x, transform.localEulerAngles.y, (rb.velocity.x >= 0) ? -Vector2.Angle(Vector2.up, rb.velocity) : Vector2.Angle(Vector2.up, rb.velocity));

    }

    void SetRandomVelocity()
    {
        float tempAngle = Random.Range(Mathf.Deg2Rad * 40f, Mathf.Deg2Rad * 60f);
        int temp = (int)Random.Range(0, 2);
        Vector2 dir = new Vector2((temp == 0 ? 1 : -1) * Mathf.Cos(tempAngle), Mathf.Sin(tempAngle));
        rb.velocity = dir * GM.ballVelocity;
    }


    private void OnCollisionEnter2D(Collision2D collision)
    {
//        Debug.Log(collision);
        CameraAnim.SetTrigger("Shake");
        GetComponent<Animator>().SetTrigger("Hit");       
    }

    void setAngle()
    {
        speed = rb.velocity;
        float angle = Vector2.Angle(speed.x>0?Vector2.right:Vector2.left, speed);
        if(angle > 0)
            angle = Mathf.Clamp(angle, GM.degreeMin, GM.degreeMax);
        else
            angle = Mathf.Clamp(angle, -GM.degreeMax, -GM.degreeMin);
        //Debug.Log(Mathf.Cos(angle*Mathf.Deg2Rad) + " " + Mathf.Sin(angle * Mathf.Deg2Rad));
        speed.x = Mathf.Sign(speed.x) * Mathf.Cos(angle*Mathf.Deg2Rad);
        speed.y = Mathf.Sign(speed.y) * Mathf.Sin(angle * Mathf.Deg2Rad);
        speed *= GM.ballVelocity;
        rb.velocity = speed;
        

    }
    private void Update() {
        ControlDirection();
        setAngle();

    }
}
