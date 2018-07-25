import React, { Component } from 'react';
import './style.css'
import config from '../../constants/config'
import helper from './helper'
import {togglePlay} from '../../helpers/player'
import {setSongDetails,setCurrentSong,setIsPlaying} from "../../redux/albums/actions/index";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return { song: state.song,
    audio : state.audio,
    songs:state.songs,
    shuffle:state.shuffle,
    songIndex:state.songIndex,
};
};
const mapDispatchToProps = dispatch => {
return {
  setSongDetails: albums => dispatch(setSongDetails(albums)),
  setCurrentSong: song => dispatch(setCurrentSong(song)),
  setIsPlaying: song => dispatch(setIsPlaying(song)),

};
};
let noArtworkImage = config.baseURL + 'default.jpg'

class Player extends Component {
  constructor(props){
    super(props)
    this.state = {
      elapsed: '00:00',
      total: '00:00',
      position : 0 
  }
  }
  componentDidMount(){
    let {audio} = this.props
    let progress = helper.progressBar()
    audio.addEventListener('timeupdate',(event)=>{
      // console.log(event)
      let width = (audio.currentTime / audio.duration) * 100 + '%'
      progress.style.width = width
      this.handleSongPlaying(audio)
    })
    audio.addEventListener('ended',(event)=>{
      this.setState({
        elapsed: '00:00',
        total: '00:00',
        position : 0 
      })
      
      this.NextSong()
    
    })
    document.querySelector('#middle-bar').addEventListener('mousedown',(e)=>{
      let {audio} = this.props
    let clickedPos = e.clientX - e.target.offsetLeft
    let newTime = (clickedPos  / e.target.offsetWidth) * audio.duration
    console.log(newTime ,'timer')
    audio.currentTime = newTime
    })
    let volumeDom = document.querySelector('.volume-slider')
    let volumeChd = document.querySelector('.volume')
    volumeDom.addEventListener('mousedown',(e)=>{
      console.log(e)
      let {audio} = this.props
    let clickedPos = e.clientX - e.target.offsetLeft
    volumeChd.style.width = (clickedPos) + '%'
    let volume = clickedPos  / e.target.offsetWidth
    
    audio.volume = clickedPos / 100
    
    
    },false)
  }
  PreviousSong = () => {
    let { songs, songIndex,audio } = this.props
    const songsLength = songs.length
    songIndex -= 1
    if (songIndex == -1) {
      songIndex = 0
    }
    let song = songs[songIndex]
    let songPath = song.fullPath
    let songURL = `${config.baseURL}songs/play?path=${encodeURIComponent(songPath)}`
    audio.src=songURL
    audio.play()
    this.setTitle(song)
    this.props.setSongDetails({
      songIndex: songIndex,
      songURL: songURL
    })
    this.props.setCurrentSong(song)
  }
  setTitle = (song) => {
    let artist 
    if(Array.isArray(song.artist)){
      artist = song.artist[0]
    }else{
      artist = song.artist
    }
    document.title = `${song.title || 'Unknown'} - ${artist || 'Unknown'}`
  }
  NextSong = () => {
    
    let {audio ,  songs, songIndex , shuffle} = this.props
    audio.pause()
    console.log(songIndex,'indexxxxxxxxxxxxxxxxxxx')
    const songsLength = songs.length
    // songIndex = parseInt(songIndex)
    songIndex += 1
    if (songIndex >= songsLength) {
      if(shuffle){
        songIndex = 0
      }
      
    }

    if(songIndex >= songsLength) {
      this.props.setIsPlaying(0)
      helper.resetProgressBar()
      return 
    }

    let song = songs[songIndex]
    // console.log(song,'aaaa')
    let songPath = song.fullPath
    let songURL = `${config.baseURL}songs/play?path=${encodeURIComponent(songPath)}`
    audio.src = songURL
    this.setTitle(song)
    this.props.setSongDetails({
      songIndex: songIndex,
      songURL: songURL,
      songId: song.id,
    })
    this.props.setCurrentSong(song)
    audio.play()
  }
  setEplapsed = (elapsed,total,position)=>{
        this.setState({
        elapsed: elapsed,
        total: total,
        position : position
    })
  }
  formatTime = (time) =>{
    return time < 10 ? '0' + time.toString().trim() : time
  }

  handleSongPlaying = (audio) => {
    let currentMinutes = this.formatTime(Math.floor(audio.currentTime / 60))
    let currentSeconds = this.formatTime(Math.floor(audio.currentTime % 60))
    let totaltMinutes = this.formatTime(Math.floor(audio.duration / 60))
    let totalSeconds = this.formatTime(Math.floor(audio.duration / 60))
    let elapsed = currentMinutes + ':' + currentSeconds
    let total = totaltMinutes + ':' + totalSeconds
    this.setEplapsed(elapsed,total,audio.position)
    
  }
  moveSong = (e)=>{
    let {audio} = this.props
    let clickedPos = e.clientX - e.target.offsetLeft
    let newTime = (clickedPos  / e.target.offsetWidth) * audio.duration
    console.log(newTime ,'timer')
      audio.currentTime = 1
    
   
  }
  render(){
     const {audio,isPlaying,song,album,position}=this.props
     const {total,elapsed} = this.state
     let progressBar = (position / audio.duration) * 100 
      
    return (
    <div id="player">
      <div className="columns">
        <div className="column is-2">
          <div id="currently-playing">
            <div id="currently-cover">
            <img src={album.artwork ? config.baseURL + album.artwork : noArtworkImage} alt="" />
            </div>
            <div id="currently-text">
              <span><a href="" className="link">{song.title}</a></span>
              <h1>{song.artist}</h1>
            </div>
            <div id="add-to-favaorite">
              <i className="fa fa-plus"></i>
            </div>
            
          </div>
        </div>
        <div className="column is-8">
          <div id="player-controller">
            <div id="player-controls">
                <i className="link fa fa-random" onClick={this.props.shuffle}></i>
                  <i className="link fa fa-step-backward"  onClick={this.PreviousSong}></i>
                    <i className={(isPlaying == 1 ? 'link fa fa-pause' : 'link fa fa-play')} onClick={()=>togglePlay(this.props)} ></i>
                      <i className="link fa fa-step-forward" onClick={this.NextSong} ></i>
                        <i className="link fa fa-redo-alt"></i>
            </div>
            <div id="progress-bar-container">
              <span className="link">{elapsed}</span>
              <div id="progress-bar">
                <div id="middle-bar">
                

                  <div id="player-position" style={{width:progressBar + '%'}}>
                  
                  </div>
                  
                </div>
              </div>
              <span className="link">{total}</span>
            </div>
          </div>
        </div>
        <div className="column is-2">
          <div id="sound">
             <i className="link fa fa-volume-up"></i>
             <i className="link fa fa-volume-down"></i>
                    <i className="link fa fa-volume-off"></i>
                    <i className="link fa fa-volume-down"></i> 
                    <div  className="volume-slider" >
                      <div className="volume"></div>
                    </div>
          </div>
        </div>
      </div>
      
    </div>
    )
  }
}
export default connect(mapStateToProps, mapDispatchToProps,null,{ withRef: true })(Player);