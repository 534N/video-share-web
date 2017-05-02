'use strict';

import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import CloudAPI from '../utils/api.js'
import Player from './Player.js';
import Camera from './Camera.js';
import moment from 'moment';


export default class extends Component {

  constructor(props) {
    super(props);

    // const client = new CloudAPI();
    this.state = {
      event: {
        details: {},
        fakeCameras: [],
        cameras: [],
      },
      playingIndex: 0,
    };
  }

  componentDidMount() {
    CloudAPI.parseToken().then(res => {
      res.fakeCameras = [
        {
          id: 'test1',
          name: "Cash 3",
          thumbnail: "https://i.ytimg.com/vi/TfO1WTIXYLs/hqdefault.jpg?custom=true&w=336&h=188&stc=true&jpg444=true&jpgq=90&sp=67&sigh=6RQWTWeMJBKiTQpH1sAEXL44YSY",
          streams: [{
            "id": "fcd4d123-c544-4b76-f953-6b2bd397a286",
            "name": "HD"
          }, {"id": "23174f8b-5d9c-4d32-bc9e-c39f5e813123", "name": "SD"}],
          snapshot_params: "time=1493311801000&precision=1&width=320",
          accessibleAddress: "https://83bfe160-13dd-11e7-8984-d57f2d83a0db.solink.direct:18080",
          deviceId: "83bfe160-13dd-11e7-8984-d57f2d83a0db"
        },
        {
          id: 'test2',
          name: "Cash 2",
          thumbnail: "https://i.ytimg.com/vi/txU-z4meCS4/hqdefault.jpg?custom=true&w=336&h=188&stc=true&jpg444=true&jpgq=90&sp=67&sigh=Wac06ms6Yk_PZjmAXWmc_ypL-_Q",
          streams: [{
            "id": "fcd4d123-c544-4b76-f953-6b2bd397a286",
            "name": "HD"
          }, {"id": "23174f8b-5d9c-4d32-bc9e-c39f5e813123", "name": "SD"}],
          snapshot_params: "time=1493311801000&precision=1&width=320",
          accessibleAddress: "https://83bfe160-13dd-11e7-8984-d57f2d83a0db.solink.direct:18080",
          deviceId: "83bfe160-13dd-11e7-8984-d57f2d83a0db"
        },
        {
          id: 'test3',
          name: "Cash 2",
          thumbnail: "https://i.ytimg.com/vi/txU-z4meCS4/hqdefault.jpg?custom=true&w=336&h=188&stc=true&jpg444=true&jpgq=90&sp=67&sigh=Wac06ms6Yk_PZjmAXWmc_ypL-_Q",
          streams: [{
            "id": "fcd4d123-c544-4b76-f953-6b2bd397a286",
            "name": "HD"
          }, {"id": "23174f8b-5d9c-4d32-bc9e-c39f5e813123", "name": "SD"}],
          snapshot_params: "time=1493311801000&precision=1&width=320",
          accessibleAddress: "https://83bfe160-13dd-11e7-8984-d57f2d83a0db.solink.direct:18080",
          deviceId: "83bfe160-13dd-11e7-8984-d57f2d83a0db"
        },
        {
          id: 'test4',
          name: "Cash 2",
          thumbnail: "https://i.ytimg.com/vi/txU-z4meCS4/hqdefault.jpg?custom=true&w=336&h=188&stc=true&jpg444=true&jpgq=90&sp=67&sigh=Wac06ms6Yk_PZjmAXWmc_ypL-_Q",
          streams: [{
            "id": "fcd4d123-c544-4b76-f953-6b2bd397a286",
            "name": "HD"
          }, {"id": "23174f8b-5d9c-4d32-bc9e-c39f5e813123", "name": "SD"}],
          snapshot_params: "time=1493311801000&precision=1&width=320",
          accessibleAddress: "https://83bfe160-13dd-11e7-8984-d57f2d83a0db.solink.direct:18080",
          deviceId: "83bfe160-13dd-11e7-8984-d57f2d83a0db"
        }
      ];

      this.setState({
        event: res,
      });
    });
  }

  render() {
    let url = '';
    if (this.state.event.fakeCameras.length > 0) {
      url = CloudAPI.getPlaylist(this.state.event.fakeCameras[this.state.playingIndex]);
    }

    return (
      <div className="App">
        <div className='container'>
          <div className="App-header">
            <div className='left'>
              <div className='title'>{this.state.event.title}</div>
              <div className='sub-title'>{this.state.event.subtitle}</div>
              <div className='description'>{this.state.event.details.description}</div>
            </div>
            <div className='right'>
              <div className='event-start'>START: {moment(this.state.event.startTime).format('L')} {moment(this.state.event.startTime).format('LTS')}</div>
              <div className='event-end'>END: {moment(this.state.event.endStart).format('L')} {moment(this.state.event.endTime).format('LTS')}</div>
            </div>
          </div>
          <div className='app-body'>
            {
              url.length > 0 &&
              <Player url={url} width={800} height={450} />
            }
          </div>
          <div className="App-intro">
            {
              this.state.event.fakeCameras.length > 0 &&
              <div className='cameras-panel'>
                {
                  this.state.event.fakeCameras.map((camera, idx) => {
                    return (
                      <Camera key={camera.id} camera={camera} active={idx === this.state.playingIndex} index={idx} onCameraChange={this._handleCameraChange.bind(this)}/>
                    )
                  })
                }
              </div>
            }
          </div>
        </div>
      </div>
    );
  }

  _handleCameraChange(index) {
    this.setState({
      playingIndex: index,
    });
  }
}


/*{
  "title": "Share",
  "subtitle": "Cash 3 @ Store #10141",
  "startTimeLocal": "2017-04-27T12:49:07-04:00",
  "startTime": "2017-04-27T16:49:07",
  "endTimeLocal": "2017-04-27T12:51:07-04:00",
  "endTime": "2017-04-27T16:51:07",
  "primaryCameraId": "WKoG2GICoc102ASD",
  "cameras": [{
    "id": "WKoG2GICoc102ASD",
    "name": "Cash 3",
    "thumbnail": "83bfe160-13dd-11e7-8984-d57f2d83a0db/Tue Apr 27  117 12:49:07 GMT-0400 (EDT).jpg",
    "streams": [{
      "id": "fcd4d123-c544-4b76-f953-6b2bd397a286",
      "name": "HD"
    }, {"id": "23174f8b-5d9c-4d32-bc9e-c39f5e813123", "name": "SD"}],
    "snapshot_params": "time=1493311801000&precision=1&width=320",
    "accessibleAddress": "https://83bfe160-13dd-11e7-8984-d57f2d83a0db.solink.direct:18080",
    "deviceId": "83bfe160-13dd-11e7-8984-d57f2d83a0db"
  }],
  "locationId": "83bfe160-13dd-11e7-8984-d57f2d83a0db",
  "ipAddress": "204.101.47.141",
  "username": "solink-local",
  "password": "__connect__",
  "videos": [],
  "details": {"description": "Share @ 12:50:07", "favourite": true, "favouritedBy": ["auth0|5644f96e6bf2a89f150109f1"]},
  "type": "bookmark"
}*/
