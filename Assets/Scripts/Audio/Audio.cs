using UnityEngine.Audio;
using UnityEngine;

[System.Serializable]
public class Audio
{
    public string name;
    public AudioClip clip;
    [Range(0,1)]
    public float volume;
    public float pitch;
    public bool loop;
    public AudioSource source;
    public bool mute;
    public AudioMixerGroup mixer;
}
