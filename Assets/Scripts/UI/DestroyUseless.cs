using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DestroyUseless : MonoBehaviour
{
    void Start()
    {
        Destroy(GameObject.Find("GameManager"));
        Destroy(GameObject.Find("FunctionMemory"));
    }

}
