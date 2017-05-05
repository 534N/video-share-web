'use strict';

import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import CloudAPI from '../utils/api.js'
import Player from './Player.js';
import Camera from './Camera.js';
import moment from 'moment';
import Cookie from 'js-cookie';
import classNames from 'classnames';

export default class extends Component {

  constructor(props) {
    super(props);

    this.state = {
      event: {
        title: '.',
        subtitle: '.',
        startTime: '',
        endTime: '',
        details: {
          description: '.',
        },
        fakeCameras: [],
        shares: [],
        cameras: [
          {
            id: 'test2',
            name: 'Cash 2',
            thumbnail: 'https://i.ytimg.com/vi/txU-z4meCS4/hqdefault.jpg?custom=true&w=336&h=188&stc=true&jpg444=true&jpgq=90&sp=67&sigh=Wac06ms6Yk_PZjmAXWmc_ypL-_Q',
            streams: [{
              'id': 'fcd4d123-c544-4b76-f953-6b2bd397a286',
              'name': 'HD'
            }, {'id': '23174f8b-5d9c-4d32-bc9e-c39f5e813123', 'name': 'SD'}],
            snapshot_params: 'time=1493311801000&precision=1&width=320',
            accessibleAddress: 'https://83bfe160-13dd-11e7-8984-d57f2d83a0db.solink.direct:18080',
            deviceId: '83bfe160-13dd-11e7-8984-d57f2d83a0db'
          }
        ],
      },
      playingIndex: 0,
      dataReady: false,
    };
  }

  componentDidMount() {
    const { search } = this.props.location;
    const token = search.split('token=')[1];

    CloudAPI.parseToken(token).then(res => {
      if (res.cookies) {
        res.cookies.forEach(cookie => {
          Cookie.set(cookie.name, cookie.value, {domain: '.solinkcloud.com'});
        });
      }

      // 
      // 
      // fake info
      const viewer = 'syang@solinkcorp.com';

      res.event.viewer = viewer;
      res.event.fakeCameras = [
        res.event.cameras[0],
        {
          id: 'test2',
          name: 'Cash 2',
          thumbnail: 'https://i.ytimg.com/vi/txU-z4meCS4/hqdefault.jpg?custom=true&w=336&h=188&stc=true&jpg444=true&jpgq=90&sp=67&sigh=Wac06ms6Yk_PZjmAXWmc_ypL-_Q',
          streams: [{
            'id': 'fcd4d123-c544-4b76-f953-6b2bd397a286',
            'name': 'HD'
          }, {'id': '23174f8b-5d9c-4d32-bc9e-c39f5e813123', 'name': 'SD'}],
          snapshot_params: 'time=1493311801000&precision=1&width=320',
          accessibleAddress: 'https://83bfe160-13dd-11e7-8984-d57f2d83a0db.solink.direct:18080',
          deviceId: '83bfe160-13dd-11e7-8984-d57f2d83a0db'
        },
        {
          id: 'test3',
          name: 'Cash 2',
          thumbnail: 'https://i.ytimg.com/vi/txU-z4meCS4/hqdefault.jpg?custom=true&w=336&h=188&stc=true&jpg444=true&jpgq=90&sp=67&sigh=Wac06ms6Yk_PZjmAXWmc_ypL-_Q',
          streams: [{
            'id': 'fcd4d123-c544-4b76-f953-6b2bd397a286',
            'name': 'HD'
          }, {'id': '23174f8b-5d9c-4d32-bc9e-c39f5e813123', 'name': 'SD'}],
          snapshot_params: 'time=1493311801000&precision=1&width=320',
          accessibleAddress: 'https://83bfe160-13dd-11e7-8984-d57f2d83a0db.solink.direct:18080',
          deviceId: '83bfe160-13dd-11e7-8984-d57f2d83a0db'
        },
        {
          id: 'test4',
          name: 'Cash 2',
          thumbnail: 'https://i.ytimg.com/vi/txU-z4meCS4/hqdefault.jpg?custom=true&w=336&h=188&stc=true&jpg444=true&jpgq=90&sp=67&sigh=Wac06ms6Yk_PZjmAXWmc_ypL-_Q',
          streams: [{
            'id': 'fcd4d123-c544-4b76-f953-6b2bd397a286',
            'name': 'HD'
          }, {'id': '23174f8b-5d9c-4d32-bc9e-c39f5e813123', 'name': 'SD'}],
          snapshot_params: 'time=1493311801000&precision=1&width=320',
          accessibleAddress: 'https://83bfe160-13dd-11e7-8984-d57f2d83a0db.solink.direct:18080',
          deviceId: '83bfe160-13dd-11e7-8984-d57f2d83a0db'
        }
      ];

      console.debug('event >>', res.event)

      this.setState({
        event: res.event,
        dataReady: true,
      });
    });
  }

  render() {
    let url = '';
    if (this.state.event.fakeCameras.length > 0) {
      url = CloudAPI.getPlaylist(this.state.event.fakeCameras[this.state.playingIndex]);
    }


    const appClass = classNames(
      'App',
      {
        'fake': !this.state.dataReady,
        'data-ready': this.state.dataReady,
      }
    );

    const start = `${moment(this.state.event.startTime).format('L')} ${moment(this.state.event.startTime).format('LTS')}`;
    const end = `${moment(this.state.event.endStart).format('L')} ${moment(this.state.event.endTime).format('LTS')}`;

    return (
      <div className={appClass}>
        <div className='container'>
          <div className='App-header'>
            <img src={process.env.PUBLIC_URL + '/solink.png'} />
            {
              this.state.dataReady &&
              <div className='right'>
                Video time: {start} - {end}
              </div>
            }
            {
              !this.state.dataReady &&
              <div className='right'>
                <div className='right-fake'/>
              </div>
            }
            
          </div>
          <div className='app-body'>
            {
              url.length > 0 && this.state.dataReady &&
              <Player url={url} width={800} height={450} />
            }
            {
              !this.state.dataReady &&
              <div className='player-fake'/>
            }
          </div>
          <div className='App-intro'>
            {
              this.state.event.fakeCameras.length > 0 && this.state.dataReady &&
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
            {
              !this.state.dataReady &&
              <div className='cameras-panel'>
                <Camera camera={{}}/>
                <Camera camera={{}}/>
              </div>
            }
          </div>
          <div className='App-details'>
            <div className='left'>
              <div className='title'>{this.state.event.title}</div>
              <div className='sub-title'>{this.state.event.subtitle}</div>

            </div>
            <div className='description'>
              {this.state.event.details.description}
            </div>
            {
              this.state.dataReady &&
              this._renderShareInfo()
            }
            
          </div>
        </div>
      </div>
    );
  }

  _renderShareInfo() {
    const shareInfo = this.state.event.shares.filter(share => {
      return share.email === this.state.event.viewer;
    });


    return (
      <div className='share-info'>Shared by <span className='email'>{shareInfo[0].sharedBy}</span> at {shareInfo[0].sharedAt}</div>
    )
  }


  _handleCameraChange(index) {
    this.setState({
      playingIndex: index,
    });
  }
}


